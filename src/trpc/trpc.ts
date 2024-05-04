import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { TRPCError, initTRPC } from '@trpc/server';
 

// Initialization of tRPC backend. Should be done only once per backend!
const t = initTRPC.create();

const middleware = t.middleware

// Used to get logged in user's info, which will be avaiable as context in private procedures
const isAuth = middleware(async(opts) => {

    // Get current logged in user
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    // Throw error if no user is logged in
    if(!user || !user.id) throw new TRPCError({ code: 'UNAUTHORIZED'})

    // Otherwise, return user's info
    return(opts.next({
        ctx: {
            userId: user.id,
            user
        }
    }))
})
 

// Export reusable router and procedure helpers that can be used throughout the application
export const router = t.router;
export const publicProcedure = t.procedure; // Allows us to create a public endpoint that anyone (authenticated or not) can call
export const privateProcedure = t.procedure.use(isAuth) // Only for logged in users