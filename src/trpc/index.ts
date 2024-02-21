import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
 
// queries are for GET requests
// mutations are for POST, UPDATE... requests

export const appRouter = router({

  // Public procedure to synchronize user auth service with database.
  // If a user is logged in but not in the database, add them to the database. 
  authCallback: publicProcedure.query(async() => {

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

    return({success: true})
  })
});
 
// Export router type signature, NOT the router itself.
export type AppRouter = typeof appRouter;