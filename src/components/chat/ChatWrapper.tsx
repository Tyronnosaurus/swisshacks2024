"use client"

import Messages from "./Messages"
import ChatInput from "./ChatInput"
import { trpc } from "@/app/_trpc/client"
import { ChevronLeft, Loader2, XCircle } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "../ui/button"
import { ChatContextProvider } from "./ChatContext"

interface ChatWrapperProps {
  fileId1: string,
  fileId2: string
}

const ChatWrapper = ({fileId1, fileId2}: ChatWrapperProps) => {


  const {data: data1, isLoading: isLoading1} = trpc.getFileUploadStatus.useQuery({
    fileId: fileId1,
  }, {
    refetchInterval: (data) => (data?.status === "SUCCESS" || data?.status === "FAILED") ? false : 500
  })

  const {data: data2, isLoading: isLoading2} = trpc.getFileUploadStatus.useQuery({
    fileId: fileId1,
  }, {
    refetchInterval: (data) => (data?.status === "SUCCESS" || data?.status === "FAILED") ? false : 500
  })



  if(isLoading1 || isLoading2) return(
    <div className="relative min-h-full bgzinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
      <div className="flex-1 flex justify-center items-center flex-col mb-28">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin"/>
          <h3 className="font-semibold text-xl">Loading...</h3>
          <p className="text-zinc-500 text-sm">
            We&apos;re preparing your PDFs.
          </p>
        </div>
      </div>

      {/* Show a disabled input just for decoration, so the user knows a chat is gonna appear */}
      <ChatInput isDisabled />
    </div>
  )

  if(data1?.status === "PROCESSING" || data2?.status === "PROCESSING") return(
    <div className="relative min-h-full bgzinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
      <div className="flex-1 flex justify-center items-center flex-col mb-28">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin"/>
          <h3 className="font-semibold text-xl">Processing PDFs...</h3>
          <p className="text-zinc-500 text-sm">
            This won&apos;t take long.
          </p>
        </div>
      </div>

      {/* Show a disabled input just for decoration, so the user knows a chat is gonna appear */}
      <ChatInput isDisabled />
    </div>
  )

  // Handle failed state (e.g. the PDF had more pages than allowed by the user's plan)
  if(data1?.status === "FAILED" || data2?.status === "FAILED") return(
    <div className="relative min-h-full bgzinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
      <div className="flex-1 flex justify-center items-center flex-col mb-28">
        <div className="flex flex-col items-center gap-2">
          <XCircle className="h-8 w-8 text-red-500"/>
          <h3 className="font-semibold text-xl">Too many pages in PDF</h3>
          <p className="text-zinc-500 text-sm">
            Your <span className="font-medium">Free</span> plan supports up to 5 pages per PDF.
          </p>
          <Link href="/dashboard" 
                className={buttonVariants({
                  variant: "secondary",
                  className: "mt-4"
                })}>
            <ChevronLeft className="h-3 w-3 mr-1.5"/>Back
          </Link>
        </div>
      </div>

      {/* Show a disabled input just for decoration, so the user knows a chat is gonna appear */}
      <ChatInput isDisabled />
    </div>
  )
  

  return (
    <ChatContextProvider fileId1={fileId1} fileId2={fileId2}>
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 justify-between flex flex-col mb-28">
          <Messages fileId1={fileId1} fileId2={fileId2}/>
        </div>

        <ChatInput />
      </div>
    </ChatContextProvider>
  )
}

export default ChatWrapper