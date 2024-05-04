import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { z } from 'zod'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query';

 
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


  // Private procedure to fetch previous chat messages for a specific file, in an infinite query way:
  // we can pass a cursor, and it will fetch N msgs starting at the Mth position going back in time.
  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),  // Number of messages to get. Optional
        cursor: z.string().nullish(),                 // Msg Id from which to start the batch. Optional, if not given we'll get the most recent msgs.
        fileId: z.string()
      })
    )
    .query(async({ctx, input}) => {
      const {userId} = ctx 
      const {fileId, cursor} = input
      const limit = input.limit ?? INFINITE_QUERY_LIMIT // How many msgs to get per request. If not specified, a default value is used.

      // Get file info from database
      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId
        }
      })

      if(!file) throw new TRPCError({ code: 'NOT_FOUND' })

      // Fetch msgs from database
      const messages = await db.message.findMany({
        take: limit + 1,  // Get one more than needed. We'll remove it but save its Id.
        where: { fileId },
        orderBy: { createdAt: "desc" },
        cursor: cursor ? {id: cursor} : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true
        }
      })

      let nextCursor: typeof cursor | undefined = undefined

      // If the db returned as many msgs as we requested, it means we haven't reached the oldest msg yet.
      // Save the Id of the extra msg we added to the batch and remove it.
      if(messages.length > limit) {
        const nextItem = messages.pop()
        nextCursor = nextItem?.id
      }

      return({messages, nextCursor})
    }),


  // Get uploadStatus (PENDING, PROCESSING, FAILED or SUCCESS)
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