import { generateReactHelpers } from "@uploadthing/react/hooks";
 
import type { OurFileRouter } from "@/app/api/uploadthing/core";
 
// generateComponents() generates the UploadButton and UploadDropzone components used to interact with UploadThing.
// Generating components allows for fully typesafe components bound to the type of your file router.
// See: https://docs.uploadthing.com/api-reference/react
export const { useUploadThing } = generateReactHelpers<OurFileRouter>();