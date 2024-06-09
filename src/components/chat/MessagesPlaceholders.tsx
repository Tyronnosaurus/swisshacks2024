
import Skeleton from "react-loading-skeleton"
import { MessageSquare } from "lucide-react"


// Placeholder skeleton for while the chat conversation is loading. Shows 4 gray bars.
export const SkeletonMessages = () => {
    return(
        <div className='w-full flex flex-col gap-2'>
            <Skeleton className='h-16' count={4}/>
        </div>
    )
}

// Message to show when user still hasn't sent any message
export const EmptyMessages = () => {
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