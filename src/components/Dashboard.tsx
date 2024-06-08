'use client'

import { trpc } from "@/app/_trpc/client"
import UploadButton from "./UploadButton"
import { Ghost } from "lucide-react"
import Skeleton from "react-loading-skeleton"
import { getUserSubscriptionPlan } from "@/lib/stripe"
import PdfCard from "./PdfCard"







interface PageProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

const Dashboard = ({subscriptionPlan}: PageProps) => {

  const { data: files, isLoading } = trpc.getUserFiles.useQuery()

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-5xl text-gray-900">My files</h1>

        <UploadButton isSubscribed={subscriptionPlan.isSubscribed}/>
      </div>

      {/* Display the user's files */}
      {files && files?.length !== 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {files.sort(
            (a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((file) => (

              <li key={file.id}>
                <PdfCard file={file}/>
              </li>

            )
          )}
        </ul>
      ) : isLoading ? (
        <Skeleton height={100} className="my-2" count={3} />
      ) : (
        <div className="mt-16 flex flex-col items-center gap-2">
          <Ghost className="h-8 w-8 text-zinc-800" />
          <h3 className="font-semibold text-xl">Pretty empty around here</h3>
          <p>Let&apos;s upload your first PDF.</p>
        </div>
      )}

    </main>
  )
}

export default Dashboard