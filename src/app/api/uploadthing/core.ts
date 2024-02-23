import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();
 
const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload

      const { getUser } = getKindeServerSession()
      const user = getUser()

      // If error is thrown, uploadThing will know user can't upload file
      if(!user || !user.id) throw new Error("Unauthorized")
      
 
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return({userId: user.id})
    })
    .onUploadComplete(async ({ metadata, file }) => {}),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;