"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '../_trpc/client'

const Page = () => {

    const router = useRouter()

    // Parse the url to get the value in "?origin=xxx"
    const searchParams = useSearchParams()
    const origin = searchParams.get('origin')

    trpc.authCallback.useQuery(undefined, {
        onSuccess: ({success}) => {
            if (success) {
                // User is synced to database
                router.push(origin ? `/${origin}` : '/dashboard')
            }
        }
    })
}

export default Page