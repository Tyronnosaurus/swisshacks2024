import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { z } from 'zod'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query';
import { absoluteUrl } from '@/lib/utils';
import { getUserSubscriptionPlan, stripe } from '@/lib/stripe';
import { PLANS } from '@/config/stripe';

 
// queries are for GET requests
// mutations are for POST, UPDATE... requests

export const appRouter = router({

  // Public procedures can be used by everyone.
  // Private procedures can only be used by logged in users.

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


  // Private procedure to get a user's uploaded PDFs
  getUserFiles: privateProcedure.query(async ({ctx}) => {
    const { userId } = ctx

    return await db.file.findMany({
      where: {
        userId
      }
    })
  }),


  // Private procedure to create a Stripe session for the user to upgrade his plan.
  // Returns link to Stripe checkout page.
  createStripeSession: privateProcedure.mutation(async ({ctx}) => {   
    
    const billingUrl = absoluteUrl("/dashboard/billing")

    // Get the user's info from the database
    const {userId} = ctx

    if(!userId) throw new TRPCError({code: "UNAUTHORIZED"})

    const dbUser = await db.user.findFirst({
      where:{
        id: userId
      }
    })

    if(!dbUser) throw new TRPCError({code: "UNAUTHORIZED"})


    // Find out user's current subscription plan
    const subscriptionPlan = await getUserSubscriptionPlan()
    
    // If user already has a paid subscription and a Stripe id in the database,
    // just report this Id to Stripe (they already have the user's data)
    if(subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: billingUrl
      })

      console.log("stripeSession for subscribed user with Stripe Id")
      console.log(stripeSession)

      return({url: stripeSession.url})
    }

    // Otherwise, create a session from scratch
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test,
          quantity: 1,
        }
      ],
      metadata: {userId: userId}
    })

    return({url: stripeSession.url})
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
      // Save the Id of the extra msg we added to the batch and discard it.
      if(messages.length > limit) {
        const nextItem = messages.pop()
        nextCursor = nextItem?.id
      }

      return({messages, nextCursor})
    }),


  // Get a file's uploadStatus (PENDING, PROCESSING, FAILED or SUCCESS)
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


  // Private procedure to get a single file's info
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


  // Private procedure to delete a single file's info from database
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