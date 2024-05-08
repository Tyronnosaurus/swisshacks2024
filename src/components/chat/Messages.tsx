import { trpc } from "@/app/_trpc/client"
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query"
import Message from "./Message"
import { useContext, useEffect, useRef } from "react"
import { ChatContext } from "./ChatContext"
import { Loader2, MessageSquare } from "lucide-react"
import Skeleton from "react-loading-skeleton"
import { useIntersection } from '@mantine/hooks'


// Placeholder skeleton for while the chat conversation is loading. Shows 4 gray bars.
const SkeletonMessages = () => {
  return(
    <div className='w-full flex flex-col gap-2'>
      <Skeleton className='h-16' count={4}/>
    </div>
  )
}

// Message to show when user still hasn't sent any message
const EmptyMessages = () => {
  return(
    <div className='flex-1 flex flex-col items-center jsutify-center gap-2'>
      <MessageSquare className='h-8 w-8 text-blue-500' />
      <h3 className="font-semibold text-xl">You&apos;re all set!</h3>
      <p className="text-zinc-500 text-sm">
        Ask your first question to get started.
      </p>
    </div>
  )
}


interface MessagesProps {
  fileId: string
}

// Component that shows the chat messages (i.e. the conversation) between user and AI.
// Starts showing only the most recent messages, and loads older messages as the user scrolls up.
const Messages = ({fileId}: MessagesProps) => {

  const {isLoading: isAiThinking} = useContext(ChatContext) // We name it isAiThinking to prevent a naming conflict

  const {data, isLoading, fetchNextPage} = trpc.getFileMessages.useInfiniteQuery({
    fileId,
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