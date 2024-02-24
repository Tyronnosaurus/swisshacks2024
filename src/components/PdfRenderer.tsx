import {Document, Page} from "react-pdf"
import 'react-pdf/dist/Page/AnnotationLayer.css'; // Support for annotations
import 'react-pdf/dist/Page/TextLayer.css'; // Support for text layer (for text selection & search)


/** Uses react-pdf to render a PDF file.
 *  See: https://www.npmjs.com/package/react-pdf
 */

interface PdfRendererProps {
  url: string
}

const PdfRenderer = ({url}:PdfRendererProps) => {
  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">

      {/* PDF options bar */}
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2"> 
        <div className="flex items-center gap-1.5">
          top bar
        </div>
      </div>

      <div className="flex-1 w-full max-h-screen">
        <div>
          <Document file={url} className="max-h-full">
            <Page pageIndex={1}/>
          </Document>
        </div>
      </div>

    </div>
  )
}

export default PdfRenderer