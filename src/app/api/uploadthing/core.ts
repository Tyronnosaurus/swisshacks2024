import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {

  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute

    .middleware(async ({ req }) => {
      // This code runs on your server before upload

      const { getUser } = getKindeServerSession()
      const user = getUser()

      // If no user is logged in, throw error and stop uploading to uploadThing
      if(!user || !user.id) throw new Error("Unauthorized")
 
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return({userId: user.id})
    })

    .onUploadComplete(async ({ metadata, file }) => {

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
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;