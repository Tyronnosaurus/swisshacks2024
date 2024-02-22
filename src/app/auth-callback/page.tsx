"use client"

/* If the user visits the dashboard, a quick check is made to see if he's logged in */

import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '../_trpc/client'
import { Loader2 } from 'lucide-react'

const Page = () => {

    const router = useRouter()
    
    // Parse the url to get the xxx value in "?origin=xxx", if there is one
    const searchParams = useSearchParams()
    const origin = searchParams.get('origin')

    trpc.authCallback.useQuery(
        undefined,
        {
            onSuccess: ({success}) => {
                // If user is synced to database, return to previous page (origin). If there's no origin, go to dashboard page
                if (success) router.push(origin ? `/${origin}` : '/dashboard')
            },
            onError: (err) => {
                // Otherwise, go to sign in page
                if (err.data?.code === "UNAUTHORIZED") router.push("/sign-in")
            },
            retry: 5,
            retryDelay: 1000,
        }
    )

    return(
        <div className='w-full mt-24 flex justify-center'>
            <div className='flex flex-col items-center gap-2'>
                <Loader2 className='h8 w-8 animate-spin text-zinc-800' />
                <h3 className='font-semibold text-xl'>Setting up your account...</h3>
                <p>You will be redirected automatically</p>
            </div>
        </div>
    )
}

export default Page