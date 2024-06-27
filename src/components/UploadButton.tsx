"use client"

import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { useState } from "react"
import { Button } from "./ui/button"
import UploadDropZone from "./UploadDropZone"


interface UploadButtonProps {
    isSubscribed: boolean,
}


/** Button to open a modal where the user can upload a file */
const UploadButton = ({isSubscribed}: UploadButtonProps) => {

    const [isOpen, setIsOpen] = useState<boolean>(false)
  
    return (
        <Dialog open={isOpen}
                onOpenChange={(v) => {if(!v) setIsOpen(v)}}>
            <DialogTrigger asChild
                           onClick={() => setIsOpen(true)}>
                <Button>
                    Upload PDF
                </Button>
            </DialogTrigger>

            <DialogContent>
                <UploadDropZone isSubscribed={isSubscribed} setIsOpen={setIsOpen}/>
            </DialogContent>
        </Dialog>
    )
}

export default UploadButton