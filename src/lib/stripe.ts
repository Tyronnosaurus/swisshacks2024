import { PLANS } from '@/config/stripe'
import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
    apiVersion: '2023-08-16',
    typescript: true,
})

/** Returns info about the current subscription plan of the logged in user */
export async function getUserSubscriptionPlan() {

    // Get the current user
    const { getUser } = getKindeServerSession()
    const user = getUser()
  
    // If user is not logged in, return default values (no plan)
    if (!user.id) {
        return {
            ...PLANS[0],
            isSubscribed: false,
            isCanceled: false,
            stripeCurrentPeriodEnd: null,
        }
    }
  
    // Get user's info from database
    const dbUser = await db.user.findFirst({
        where: {
            id: user.id,
        },
    })
  
    // If user not found in database, return default values (no plan)
    if (!dbUser) {
        return {
            ...PLANS[0],
            isSubscribed: false,
            isCanceled: false,
            stripeCurrentPeriodEnd: null,
        }
    }
  
    // Check if user is subscribed to a paid plan (and make sure the subscription hasn't expired)
    const isSubscribed = Boolean(
        dbUser.stripePriceId &&
            dbUser.stripeCurrentPeriodEnd &&
            dbUser.stripeCurrentPeriodEnd.getTime() + 86400000 > Date.now()  // 86400000 = 1 day
    )
  
    // Check which plan they're subscribed to, as an object retrieved from PLANS array. Null if no plan.
    const plan = isSubscribed ? PLANS.find((plan) => plan.price.priceIds.test === dbUser.stripePriceId) : null
  
    // Check if they have manually cancelled their plan
    let isCanceled = false
    if (isSubscribed && dbUser.stripeSubscriptionId) {
        const stripePlan = await stripe.subscriptions.retrieve(dbUser.stripeSubscriptionId)
        isCanceled = stripePlan.cancel_at_period_end
    }
  
    // Return relevant info about user's subscription
    // Contains the info about the plan itself, and the specific user's info about their subscription
    return {
        ...plan,
        stripeSubscriptionId: dbUser.stripeSubscriptionId,
        stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
        stripeCustomerId: dbUser.stripeCustomerId,
        isSubscribed,
        isCanceled,
    }
}