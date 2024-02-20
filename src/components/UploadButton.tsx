"use client"

import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { useState } from "react"
import { Button } from "./ui/button"

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
                dfadga
            </DialogContent>
        </Dialog>
    )
}

export default UploadButton