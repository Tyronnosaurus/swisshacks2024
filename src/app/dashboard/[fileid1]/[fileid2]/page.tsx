import ChatWrapper from "@/components/chat/ChatWrapper"
import PdfRenderer from "@/components/PdfRenderer"
import { db } from "@/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { notFound, redirect } from "next/navigation"

interface PageProps {
    params: {
        fileid1: string,
        fileid2: string
    }
}

/** Given the file id of a PDF in the db, shows a page where on the left there's a PDF reader and on the right there's a chat to ask questions about the PDF. */
const Page = async ({params}: PageProps) => {

    const {fileid1, fileid2} = params

    // Ensure user is logged in, otherwise redirect to login page
    const { getUser } = getKindeServerSession()
    const user = getUser()
    if(!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileid1}`) 

    // Get file info from the db. Make sure it belongs to the user logged in
    const file1 = await db.file.findFirst({
        where: {
            id: fileid1,
            userId: user.id
        }
    })
    if(!file1) notFound()   // If file isn't found in db, redirect to 404 page

    const file2 = await db.file.findFirst({
        where: {
            id: fileid2,
            userId: user.id
        }
    })
    if(!file2) notFound()

    
    return (
        <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
            <div className="mx-auto w-full max-w-8xl grow lg:flex lg:px-2">
                {/* Left side (or top on small screens) */}
                <div className="flex flex-row gap-4 px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
                    <PdfRenderer url={file1.url}/>
                    <PdfRenderer url={file2.url}/>
                </div>

                {/* Right side (or bottom on small screens) */}
                <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
                    <ChatWrapper fileId={file1.id}/>
                </div>
            </div>
        </div>
    )
}

export default Page