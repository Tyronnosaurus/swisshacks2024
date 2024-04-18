import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { z } from 'zod'
 
// queries are for GET requests
// mutations are for POST, UPDATE... requests

export const appRouter = router({

  // Public procedure to synchronize user auth service with database.
  // If a user is logged in but not in the database, add them to the database. 
  authCallback: publicProcedure.query(async () => {

    // Get current logged in user
    const { getUser } = getKindeServerSession()
    const user = getUser()

    // Throw error if no user is logged in
    if (!user.id || !user.email) throw new TRPCError({code: "UNAUTHORIZED"})

    // Check if the user that is logged in is also in the database
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id
      }
    })

    // If not, create user in db
    if (!dbUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email
        }
      })
    }

    return {success: true}
  }),

  // Private procedure (only logged in users can do it) to get a user's uploaded PDFs
  getUserFiles: privateProcedure.query(async ({ctx}) => {
    const { userId } = ctx

    return await db.file.findMany({
      where: {
        userId
      }
    })
  }),

  // Get uploadStatus (PENDING, PROCESSING, FAILED OR SUCCESS)
  getFileUploadStatus: privateProcedure
    .input(z.object({fileId: z.string()}))
    .query(async ({input, ctx}) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId
        }
      })

      if(!file) return({status: "PENDING" as const})

      return({status: file.uploadStatus})
    }),

  // Private procedure (only logged in users can do it) to get a single file
  getFile: privateProcedure
    .input(z.object({key: z.string()}))
    .mutation(async ({ctx, input}) => {
      const {userId} = ctx

      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId
        }
      })

      if(!file) throw new TRPCError({code:"NOT_FOUND"})

      return(file)
    }),

  // Private procedure (only logged in users can do it) to delete a single file
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ctx, input}) => {
      const {userId} = ctx

      // Find file in db by its id (and make sure it belongs to the logged in user)
      const file = await db.file.findFirst({where:{id:input.id, userId}})

      // Throw error if file not found
      if(!file) throw new TRPCError({code:"NOT_FOUND"})

      // Delete file in db
      await db.file.delete({where:{id: input.id}})

      // Return deleted file (just in case, we don't need this for now)
      return(file)
    })

})
 
// Export router type signature, NOT the router itself.
export type AppRouter = typeof appRouter;