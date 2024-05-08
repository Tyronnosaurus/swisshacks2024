// This context will be responsible for transmitting data from the ChatInput to the Messages components.
// In React we can only send props from parent to children, but these two are at the same level,
// so we need to put them inside a Context.

import { ReactNode, createContext, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";


type StreamResponse = {
    addMessage: () => void,
    message: string,
    handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void,
    isLoading: boolean
}

// Create a context to be shared among the chat components
export const ChatContext = createContext<StreamResponse>({
    addMessage: () => {},
    message: '',
    handleInputChange: () => {},
    isLoading: false
})


interface ChatContextProviderProps {
    fileId: string,
    children: ReactNode
}


// Provider component: it accepts a value prop which will be the data accessible to components that consume this context
export const ChatContextProvider = ({fileId, children}: ChatContextProviderProps) => {
    const [message, setMessage] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const utils = trpc.useUtils() // For the optimistic updates

    const {toast} = useToast()

    const backupMessage = useRef('') // Use useRef to not cause a re-render when it changes

    // Using the useMutation hook from react-query, prepare the sendMessage function.
    // The function uses the message API route.
    // It can't use tRPC because we want to stream back a response from the API to this client, and this wouldn't work with tRPC, only with JSON.
    const {mutate: sendMessage} = useMutation({
        mutationFn: async ({message}: {message: string}) => {
            const response = await fetch('/api/message', {
                method: 'POST',
                body: JSON.stringify({fileId, message})
            })
            
            if(!response.ok) throw new Error("Failed to send message")

            return(response.body)
        },

        // onMutate will fire before mutationFn, and is passed the same variables.
        // We use it to do an optimistic update: manually add our message to the chat (instead of waiting for it to be added to the db and fetched).
        onMutate: async ({ message }: {message: string}) => {

            backupMessage.current = message // Make a backup of the sent message
            setMessage('')                  // Clear the state

            // Step 1 - Cancel any existing outgoing fetches so that they don't overwrite the optimistic update
            await utils.getFileMessages.cancel()

            // Step 2 - Save snapshot of previous values as a backup
            const previousMessages = utils.getFileMessages.getInfiniteData()

            // Step 3 - Optimistically insert new value right as user sends it
            // For this we'll use the getFileMessages tRPC route, but instead of getInfiniteData which would get messages from the db,
            //we use setInfiniteData which lets us manually update the query's cached data.
            utils.getFileMessages.setInfiniteData(
                {fileId, limit: INFINITE_QUERY_LIMIT},
                (old) => {
                    // Must return a {pages, pageParams} object

                    // Handle edge case: no old data
                    if(!old) return({
                        pages: [],
                        pageParams: []
                    })
                    
                    // Clone the old pages into a variable we can edit and later return
                    let newPages = [...old.pages]

                    // This will only contain the latest page (and not the ones above it) in the interval we sent.
                    // The latest page contains INFINITE_QUERY_LIMIT messages.
                    let latestPage = newPages[0]!

                    // Manually append the message that the user just sent
                    latestPage.messages = [
                        {
                            createdAt: new Date().toISOString(),
                            id: crypto.randomUUID(),
                            text: message,
                            isUserMessage: true
                        },
                        ...latestPage.messages
                    ]

                    newPages[0] = latestPage

                    // Return object with previous pageParams, but with updated pages
                    return({
                        ...old,
                        pages: newPages
                    })
                }
            )

            // Set loading to true after we've finished all the insertion logic for the optimistic message
            setIsLoading(true)

            // The returned value will be passed to both onError and onSettled functions in the event of a mutation failure,
            // and can be useful for rolling back optimistic updates.
            return({
                previousMessages: previousMessages?.pages.flatMap((page) => page.messages) ?? []
            })

        },

        // When we get the response from the API which contains a readable stream,
        // append the chunks in real time into the chat message.
        onSuccess: async (stream) => {

            // Hide the loading icon as soon as the response starts being streamed into the chat
            setIsLoading(false)

            // Show toast with error message if for some reason we receive an empty stream
            if(!stream) return(
                toast({
                    title: "There was a problem getting an answer",
                    description: "Please refresh the page and try again",
                    variant: "destructive"
                })
            )

            const reader = stream.getReader()
            const decoder = new TextDecoder()
            
            // Accumulated response
            let accResponse = ''

            // Keep appending the received chunks to the message
            let done = false

            while (!done) {
                const {value, done: doneReading} = await reader.read()
                done = doneReading
                const chunkValue = decoder.decode(value)

                accResponse += chunkValue

                // Append the chunk to the actual message
                utils.getFileMessages.setInfiniteData(
                    {fileId, limit: INFINITE_QUERY_LIMIT},
                    (old) => {
                        if(!old) return({pages: [], pageParams: []})
                        
                        let isAiResponseCreated = old.pages.some(
                            (page) => page.messages.some(
                                (message) => (message.id === "ai-response")
                            )
                        )

                        let updatedPages = old.pages.map((page) => {
                            if(page === old.pages[0]) {
                                let updatedMessages

                                if(!isAiResponseCreated) {
                                    updatedMessages = [
                                        {
                                            createdAt: new Date().toISOString(),
                                            id: "ai-response",
                                            text: accResponse,
                                            isUserMessage: false
                                        },
                                        ...page.messages
                                    ]
                                } else {
                                    updatedMessages = page.messages.map((message) => {
                                        if(message.id === "ai-response") {
                                            return({
                                                ...message,
                                                text: accResponse
                                            })
                                        }
                                        return(message)
                                    })
                                }

                                return({
                                    ...page,
                                    messages: updatedMessages,
                                })
                            }

                            return(page)
                        })

                        return({...old, pages: updatedPages})
                    }
                )
            }
        },

        // If there's an error, we'll put the optimistic message back into the input textbox
        // Context is the value returned by onMutate.
        onError: (_, __, context) => {
            // Reinsert the message text into the Input textbox with the backup we took at the beginning
            setMessage(backupMessage.current)

            // Restore conversation to how it was before we inserted the optimistic update
            utils.getFileMessages.setData(
                {fileId},
                {messages: context?.previousMessages ?? []}
            )
        },

        // Triggers when the mutation is either successful or encounters an error. Is passed either the data or error
        onSettled: async () => {

            // Hide the Loading icon
            setIsLoading(false)

            //
            await utils.getFileMessages.invalidate({ fileId })
        }
    })

    // Function that runs any time the text in the text area is changed, to update the message state
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }


    const addMessage = () => sendMessage({message})


    return(
        <ChatContext.Provider value={{addMessage, message, handleInputChange, isLoading}}>
            {children}
        </ChatContext.Provider>
    )

}