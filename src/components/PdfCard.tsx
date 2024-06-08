'use client'

import { trpc } from "@/app/_trpc/client"
import { Loader2, Trash } from "lucide-react"
import Link from "next/link"
import {format} from "date-fns"
import { Button } from "./ui/button"
import { useState } from "react"


interface PdfCardProps {
    file: {id: string, name: string, createdAt: string}
  }
  
  const PdfCard = ({file}: PdfCardProps) => {
  
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
  
    return(
      <div className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg">
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
      </div>
    )
  }

export default PdfCard