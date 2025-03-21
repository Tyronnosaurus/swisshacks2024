"use client"

import { useState } from "react"

import Dropzone from "react-dropzone"
import { Cloud, File, Loader2 } from "lucide-react"
import { Progress } from './ui/progress'
import { useUploadThing } from "@/lib/uploadthing"
import { useToast } from "./ui/use-toast"
import { trpc } from "@/app/_trpc/client"


interface UploadDropZoneProps {
    isSubscribed: boolean,
    setIsOpen: (isOpen: boolean) => void
}


/** Modal for the user to upload files. Has a button to open a file dialog, a drop zone, a progress bar, and a toast to show success or fail */
const UploadDropZone = ({isSubscribed, setIsOpen}: UploadDropZoneProps) => {

    const [isUploading, setIsUploading] = useState<boolean>(false)
    const [uploadProgress, setUploadProgress] = useState<number>(0)

    const {startUpload} = useUploadThing(isSubscribed ? "proPlanUploader" : "freePlanUploader")

    const {toast} = useToast()

    // Runs at the end of file upload. Tries to get the file to confirm that it uploaded correctly
    const {mutate: tryGetFile} = trpc.getFile.useMutation({
        onSuccess: (file) => {
            // After confirming that file has been successfully uploaded, close the Upload popup
            setIsOpen(false)
            utils.getUserFiles.invalidate() // Forces file list to refresh
        },
        onError: () => {
            toast({
                title: "Something went wrong",
                description: "Please refresh the page and try again",
                variant: "destructive"
            })
        },
        retry: 10,
        retryDelay: 1000
    })

    const startSimulatedProgress = () => {
        setUploadProgress(0)

        // Show fake progress: grows at 5% increments every 0.5s.
        // If upload finishes early, jump to 100%. If upload takes too long, stall at 95%.
        const interval = setInterval(() => {
            setUploadProgress((prevProgress) => {
                if(prevProgress >=95) {
                    clearInterval(interval)
                    return(prevProgress)
                }
                return(prevProgress+5)
            })
        }, 500)

        return(interval)
    }

    const utils = trpc.useContext()


    return(
        <Dropzone multiple={false}
                  onDrop={async (acceptedFile) => {
                            setIsUploading(true)
                            const progressInterval = startSimulatedProgress()

                            // Handle file uploading
                            const res = await startUpload(acceptedFile)

                            if(!res){
                                return(toast({
                                    title: "Something went wrong",
                                    description: "Please try again later",
                                    variant: "destructive"
                                }))
                            }

                            const [fileResponse] = res

                            // Get key of the uploaded file
                            const key = fileResponse?.key
                            
                            if(!key){
                                return(toast({
                                    title: "Something went wrong",
                                    description: "Please try again later",
                                    variant: "destructive"
                                }))
                            }

                            clearInterval(progressInterval)
                            setUploadProgress(100)

                            // Try to request the uploaded file to confirm upload was successful
                            tryGetFile({ key })
                        }}>
            {({getRootProps, getInputProps, acceptedFiles}) => (
                <div {...getRootProps()} className="border h-64 m-4 border-dashed border-gray-300 rounded-lg">
                    <div className="flex items-center justify-center h-full w-full">
                        <label htmlFor="dropzone-file"
                               className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                
                                {/* Cloud icon, instructions, and text stating the max file size */}
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                                    <p className="mb-2 text-sm text-zinc-700">
                                        <span className="font-semibold">Click to upload</span>&nbsp;or drag and drop
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        PDF (up to {isSubscribed ? "256" : "256"}MB)
                                    </p>
                                </div>

                                {/* File icon and filename */}
                                {(acceptedFiles && acceptedFiles[0]) && (
                                    <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                                        <div className="px-3 py-2 h-full grid place-items-center">
                                            <File className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <div className="px-3 py-2 h-full text-sm truncate">
                                            {acceptedFiles[0].name}
                                        </div>
                                    </div>
                                )}

                                {/* Progress bar */}
                                {isUploading && (
                                    <div className="w-full mt-4 max-w-xs mx-auto">
                                        <Progress value={uploadProgress}
                                                  className="h-1 w-full bg-zinc-200"
                                                  indicatorColor={uploadProgress===100 ? "bg-green-500" : ""} />
                                    </div>
                                )}

                                {/* Show a "redirecting" text when upload finishes */}
                                {uploadProgress===100 && (
                                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 pt-2">
                                        <Loader2 className="h-3 w-3 animate-spin" /> Redirecting...
                                    </div>
                                )}

                            <input {...getInputProps()} type="file" id="dropzone-file" className="hidden" />
                        </label>
                    </div>
                </div>
            )}
        </Dropzone>
    )
}

export default UploadDropZone