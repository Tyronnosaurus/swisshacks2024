"use client"

import { ChevronDown, ChevronUp, Loader2, RotateCw, Search } from "lucide-react";
import {Document, Page, pdfjs} from "react-pdf"
import 'react-pdf/dist/Page/AnnotationLayer.css'; // Support for annotations
import 'react-pdf/dist/Page/TextLayer.css'; // Support for text layer (for text selection & search)
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector"
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

import { useForm } from "react-hook-form"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";

import SimpleBar from "simplebar-react"
import PdfFullScreen from "./PdfFullScreen";


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

  const [numPages, setNumPages] = useState<number>()
  const [currPage, setCurrPage] = useState<number>(1)

  const [scale, setScale] = useState<number>(1)
  const [rotation, setRotation] = useState<number>(0)

  // We use these to prevent flickering when changing scale
  const [renderedScale, setrenderedScale] = useState<number | null>(null)
  const isLoading = (renderedScale !== scale)

  const CustomPageValidator = z.object({
    page: z.string().refine((num) => Number(num) > 0 && Number(num) <= numPages!)
  })

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>

  const {
    register,
    handleSubmit,
    formState: {errors},
    setValue
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1"
    },
    resolver: zodResolver(CustomPageValidator)
  })

  const { width, ref } = useResizeDetector()


  const handlePageSubmit = ({page}: TCustomPageValidator) => {
    setCurrPage(Number(page))
    setValue("page", String(page))
  }


  return (
    <div className="w-1/2 bg-white rounded-md shadow flex flex-col items-center">

      {/* PDF options bar */}
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-1"> 
        
        {/* Page selector (on the left)*/}
        <div className="flex items-center gap-1">
          <Button variant="ghost"
                  aria-label="previous-page"
                  onClick={() => {
                    setCurrPage( (prev) => (prev>1 ? prev-1 : 1) )
                    setValue("page", String(currPage - 1))
                  }}
                  disabled={currPage<=1}>
            <ChevronDown className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            <Input
              {...register("page")}
              className={cn('w-12 h-6', errors.page && "focus-visible:ring-red-500")}
              onKeyDown={(e) => {if (e.key === "Enter") handleSubmit(handlePageSubmit)()}}/>
            <p className="text-zinc-700 text-sm space-x-0.5">
              <span>/</span>
              <span>{numPages ?? "?"}</span>
            </p>
          </div>

          <Button variant="ghost"
                  aria-label="next-page"
                  onClick={() => {
                    setCurrPage( (prev) => (prev<numPages! ? prev+1 : numPages!) )
                    setValue("page", String(currPage + 1))
                  }}
                  disabled={numPages === undefined || currPage>=numPages!}>
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        {/* Controls on the right side */}
        <div className="space-x-0.5">

          {/* Scale (zoom) dropdowm menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label='zoom' variant='ghost' className="gap-1">
                <Search className="h-3 w-3"/>
                {scale * 100}%<ChevronDown className='h-3 w-3 opacity-50' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(.5)}  >50%</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(0.75)}>75%</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1)}   >100%</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)} >150%</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}   >200%</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Rotation button */}
          {/* <Button
            variant='ghost'
            aria-label="rotate 90 degrees"
            onClick={() => setRotation((prev) => (prev>=270 ? 0 : prev+90))}>
            <RotateCw className="h-3 w-3"/>
          </Button> */}

          {/* Fullscreen button */}
          <PdfFullScreen url={url} scale={scale} rotation={rotation}/>

        </div>
        
      </div>
      

      {/* PDF rendering */}
      <div className="flex-1 w-full max-h-screen">
         {/* Use scrollbars to prevent overflow when zoom>100% */}
         <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div ref={ref}>
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
                      onLoadSuccess={({numPages}) => {setNumPages(numPages)}}
                      file={url}
                      className="max-h-full">
              
              {/* Prevent flickering when changing scale by showing old scale until the new one has rendered */}
              {isLoading && renderedScale ?
                <Page
                  width={width ? width : 1}
                  pageNumber={currPage}
                  scale={scale}
                  rotate={rotation}
                  key={"@" + renderedScale}/>
                  :
                  null
              }

              <Page
                  className={cn(isLoading ? "hidden" : "")}
                  width={width ? width : 1}
                  pageNumber={currPage}
                  scale={scale}
                  rotate={rotation}
                  key={"@" + scale}
                  loading={
                    <div className="flex justify-center">
                      <Loader2 className="my-24 h-6 w-6 animate-spin" />
                    </div>
                  }
                  onRenderSuccess={() => setrenderedScale(scale)}/>

            </Document>
          </div>
        </SimpleBar>
      </div>

    </div>
  )
}

export default PdfRenderer