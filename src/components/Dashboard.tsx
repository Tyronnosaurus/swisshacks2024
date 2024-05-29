'use client'

import { trpc } from "@/app/_trpc/client"
import UploadButton from "./UploadButton"
import { Ghost, Loader2, Trash } from "lucide-react"
import Skeleton from "react-loading-skeleton"
import Link from "next/link"
import {format} from "date-fns"
import { Button } from "./ui/button"
import { useState } from "react"
import { getUserSubscriptionPlan } from "@/lib/stripe"


interface PageProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

const Dashboard = ({subscriptionPlan}: PageProps) => {

  const { data: files, isLoading } = trpc.getUserFiles.useQuery()

  // Id of the file currently being deleted, so that we can show feedback to the user (change trash icon to a loading icon)
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<string | null>(null)

  // Invalidates the getUserFiles query so that it is run again.
  // Used when deleteing a file so that the file list gets refreshed without reloading the page.
  const utils = trpc.useContext()

  // Used to delete files when trash button is used
  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {utils.getUserFiles.invalidate()},  // Forces file list to refresh
    onMutate: ({id}) => {setCurrentlyDeletingFile(id)},  // Changes the trash icon to a loading icon
    onSettled: () => {setCurrentlyDeletingFile(null)}    // Changes the loading icon to a trash icon
  })

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

              <li key={file.id} className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg">
                <Link href={`/dashboard/${file.id}`} className="flex flex-col gap-2">
                  <div className="pt-6 px-6 flex w-full items-cneter justify-between space-x-6">
                    
                    {/* Circle */}
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                    
                    {/* Filename */}
                    <div className="flex items-center justify-start space-x-3 flex-1 truncate">
                      <h3 className="truncate text-lg font-medium text-zinc-900">
                        {file.name}
                      </h3>
                    </div>

                  </div>
                </Link>

                <div className="px-6 mt-4 grid grid-cols-2 place-items-stretch py-2 gap-6 text-xs text-zinc-500">
                  
                  {/* Date of upload */}
                  <div className="flex items-center gap-2">
                    Added {format(new Date(file.createdAt), "dd MMM yyyy")}
                  </div>

                  {/* 'Delete' button */}
                  <Button size="sm" className="w-full" variant="destructive"
                          onClick={() => deleteFile({id: file.id})}>
                    {currentlyDeletingFile===file.id ? 
                      <Loader2 className="h-4 w-4 animate-spin" /> :
                      <Trash className="h-4 w-4" />}
                  </Button>
                  
                </div>
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