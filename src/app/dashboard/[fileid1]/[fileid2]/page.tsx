import ChatWrapper from "@/components/chat/ChatWrapper"
import PdfRenderer from "@/components/PdfRenderer"
import { db } from "@/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { notFound, redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ComparisonTable from "@/components/ComparisonTable"
import { useQuery } from "@tanstack/react-query"
import PlotFromCsv from "@/components/PdfToCsv"
import Image from "next/image"
import MiniLineChart from "@/components/MiniLineChart"

interface PageProps {
    params: {
        fileid2: string,
        fileid1: string
    }
}

/** Given the file id of a PDF in the db, shows a page where on the left there's a PDF reader and on the right there's a chat to ask questions about the PDF. */
const Page = async ({params}: PageProps) => {

    const {fileid2, fileid1} = params

    // Ensure user is logged in, otherwise redirect to login page
    const { getUser } = getKindeServerSession()
    const user = getUser()
    if(!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileid1}/${fileid2}`) 

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
        <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)] bg-zinc-100">
            <div className="mx-auto w-full max-w-8xl grow lg:flex lg:px-2">
                {/* Left side (or top on small screens) */}
                <div className="flex flex-row w-1/3 gap-4 px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6 bg-zinc-100">
                    <Tabs defaultValue="pdfs" className="bg-zinc-100 w-full">
                        <TabsList>
                            <TabsTrigger value="pdfs">Reports visualizer</TabsTrigger>
                            <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
                            <TabsTrigger value="graphs">Graphs</TabsTrigger>
                        </TabsList>
                        <div className="flex max-h-[calc(100vh-10.5rem)] min-w-[800px] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto 
                            scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
                            <TabsContent value="pdfs">
                                <div className="flex flex-row gap-4 w-full">
                                    <PdfRenderer url={file1.url}/>
                                    <PdfRenderer url={file2.url}/>
                                </div>
                            </TabsContent>
                            <TabsContent value="benchmarking">
                                <MiniLineChart/>
                                <ComparisonTable file1={file1.id}  file2={file2.id}/>
                            </TabsContent>
                            <TabsContent value="graphs">
                                {/* <PlotFromCsv/> */}
                                {/* <Image src="/SummaryKPIs.PNG" width={800} height={1000} alt="Summary of KPIs"/> */}
                                <h1>Coming soon</h1>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
                {/* Right side (or bottom on small screens) */}
                <div className="shrink-0 w-2/3 flex-[0.75] border-t border-gray-200 lg:border-l lg:border-t-0 ">
                    <ChatWrapper fileId1={file1.id} fileId2={file2.id}/>
                </div>
            </div>
        </div>
    )
}

export default Page
