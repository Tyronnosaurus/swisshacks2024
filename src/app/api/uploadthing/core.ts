import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
 
import { PDFLoader } from "langchain/document_loaders/fs/pdf"
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeClient } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";


const f = createUploadthing();
 
const middleware = async () => {
        // This code runs on the server before upload

        const { getUser } = getKindeServerSession()
        const user = getUser()
  
        // If no user is logged in, throw error and stop uploading to uploadThing
        if(!user || !user.id) throw new Error("Unauthorized")
         
        const subscriptionPlan = await getUserSubscriptionPlan()
  
        // Whatever is returned here is accessible in onUploadComplete as `metadata`
        return({subscriptionPlan, userId: user.id})
}

interface onUploadCompleteProps {
  metadata: Awaited<ReturnType<typeof middleware>>,
  file: {key: string, name:string, url: string}
}

const onUploadComplete = async ({metadata, file}: onUploadCompleteProps) => {

  // Prevent bug in which sometimes this callback gets called twice after file upload finishes
  const fileExists = await db.file.findFirst({
    where: {
      key: file.key
    }
  })

  if (fileExists) return

  // Once we finish uploading, add a File entry to our database
  //(with a PROCESSING status since we still have to parse it)
  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      url: file.url, //`https://utfs.io/f/${file.key}`, // //`https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
      uploadStatus: "PROCESSING"
    }
  })

  // Try to postprocess the file with Pinecone
  try {
    // Fetch the file
    const response = await fetch(file.url)
    const blob = await response.blob()

    const loader = new PDFLoader(blob)

    const pageLevelDocs = await loader.load()

    // Enforce the limit on number of pages for free and paid users
    const pagesAmt = pageLevelDocs.length

    const {subscriptionPlan} = metadata
    const {isSubscribed} = subscriptionPlan

    const isProExceeded = pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf
    const isFreeExceeded = pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf

    if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)){
      await db.file.update({
        data: {
          uploadStatus: 'FAILED',
        },
        where: {
          id: createdFile.id,
        }
      })
    }

    // Vectorize and index the entire document
    const pinecone = getPineconeClient();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY!,
    });

    await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
      pineconeIndex,
      namespace: createdFile.id,
    });

    // Change the file's uploadStatus to "SUCCESS" in the database
    await db.file.update({
      data: {
        uploadStatus: "SUCCESS",
      },
      where: {
        id: createdFile.id,
        userId: metadata.userId
      },
    });


  } catch (err) {
    console.log(err)

    // Change the file's uploadStatus in the db from Processing to Failed
    await db.file.update({
      data: { uploadStatus: "FAILED" },
      where: {
        id: createdFile.id,
        userId: metadata.userId }
    })
  }

}


// FileRouter for uploading to UploadThing
export const ourFileRouter = {

  // Here we define as many upload routes as we need, each with a unique routeSlug

  freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })  // Set permissions and file types for this FileRoute
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),

  proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })  // Set permissions and file types for this FileRoute
    .middleware(middleware)
    .onUploadComplete(onUploadComplete)

} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;