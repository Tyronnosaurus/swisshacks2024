"use client"

import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { useState } from "react"
import { Button } from "./ui/button"
import UploadDropZone from "./UploadDropZone"

/** Button to open a modal where the user can upload a file */
const UploadButton = () => {

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
                <UploadDropZone />
            </DialogContent>
        </Dialog>
    )
}

export default UploadButton