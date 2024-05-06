// This context will be responsible for transmitting data from the ChatInput to the Messages components.
// In React we can only send props from parent to children, but these two are at the same level,
// so we need to put them inside a Context.

import { ReactNode, createContext, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";


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

    const {toast} = useToast()

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
        }
    })

    // Function to run any time the text in the text area is changed
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }

    // 
    const addMessage = () => sendMessage({message})


    return(
        <ChatContext.Provider value={{addMessage, message, handleInputChange, isLoading}}>
            {children}
        </ChatContext.Provider>
    )

}