"use client"

import { Loader2 } from "lucide-react";
import {Document, Page, pdfjs} from "react-pdf"
import 'react-pdf/dist/Page/AnnotationLayer.css'; // Support for annotations
import 'react-pdf/dist/Page/TextLayer.css'; // Support for text layer (for text selection & search)
import { useToast } from "./ui/use-toast";

// Worker. Necessary for rendering PDFs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`


/*
 * Uses react-pdf to render a PDF file.
 * See: https://www.npmjs.com/package/react-pdf
 */

interface PdfRendererProps {
  url: string
}

const PdfRenderer = ({url}:PdfRendererProps) => {

  const {toast} = useToast()
  
  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">

      {/* PDF options bar */}
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2"> 
        <div className="flex items-center gap-1.5">
          top bar
        </div>
      </div>

      {/* PDF rendering */}
      <div className="flex-1 w-full max-h-screen">
        <div>
          <Document loading={
                      <div className="flex justify-center">
                        <Loader2 className="my-24 h-6 w-6 animate-spin" />
                      </div>
                    }
                    onLoadError={() => {
                      toast({
                        title: "Error loading PDF",
                        description: "Please try again later",
                        variant: "destructive"
                      })
                    }}
                    file={url}
                    className="max-h-full">
            <Page pageIndex={0}/>
          </Document>
        </div>
      </div>

    </div>
  )
}

export default PdfRenderer