import { trpc } from "@/app/_trpc/client"
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query"
import Message from "./Message"
import { useContext, useEffect, useRef } from "react"
import { ChatContext } from "./ChatContext"
import { Loader2 } from "lucide-react"
import { useIntersection } from '@mantine/hooks'
import { EmptyMessages, SkeletonMessages } from "./MessagesPlaceholders"



interface MessagesProps {
  fileId1: string,
  fileId2: string
}

// Component that shows the chat messages (i.e. the conversation) between user and AI.
// Starts showing only the most recent messages, and loads older messages as the user scrolls up.
const Messages = ({fileId1, fileId2}: MessagesProps) => {

  const {isLoading: isAiThinking} = useContext(ChatContext) // We name it isAiThinking to prevent a naming conflict

  const {data, isLoading, fetchNextPage} = trpc.getFileMessages.useInfiniteQuery({
    fileId: fileId1,
    limit: INFINITE_QUERY_LIMIT
  },{
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    keepPreviousData: true
  })


  // The actual messages are inside of data, in the message field
  // We use flatMap instead of map so that we don't have to work with an double array.
  const messages = data?.pages.flatMap((page) => page.messages)


  // Loading indicator
  const loadingMessage = {
    createdAt: new Date().toISOString(),
    id: 'loading-message',
    isUserMessage: false,
    text: (
      <span className='flex h-full items-center justify-center'>
        <Loader2 className='h-4 w-4 animate-spin' />
      </span>
    )
  }

  // Combine the messages with the loading indicator, if necessary
  const combinedMessages = [
    ...(isAiThinking ? [loadingMessage] : []),  // Add the loading indicator
    ...(messages ?? [])                         // and the messages
  ]

  // Load more messages when we scroll to the top of the conversation.
  // useIntersection will let us know the visibility of the upper message within the scrollbox.
  const lastMessageRef = useRef<HTMLDivElement>(null)

  const {ref, entry} = useIntersection({
    root: lastMessageRef.current,
    threshold: 1
  })

  useEffect(() => {
    if(entry?.isIntersecting) fetchNextPage()
  }, [entry, fetchNextPage])


  return (
    <div className="flex max-h-[calc(100vh-10.5rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto
                    scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
        {(combinedMessages && combinedMessages.length > 0) ? (
           combinedMessages.map((message, i) => {

            // We'll use this to prevent adding the sender icon to multiple consecutive messages
            const isNextMessageSamePerson = (combinedMessages[i-1]?.isUserMessage === combinedMessages[i]?.isUserMessage)
      
            if(i === combinedMessages.length - 1){
              return      <Message message={message} isNextMessageSamePerson={isNextMessageSamePerson} key={message.id} ref={ref}/>
            } else return <Message message={message} isNextMessageSamePerson={isNextMessageSamePerson} key={message.id} />
          })
        ) : isLoading ? (
          <SkeletonMessages />
        ) : (
          <EmptyMessages />
        )}
    </div>
  )
}

export default Messages