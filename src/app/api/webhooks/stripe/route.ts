import { db } from '@/db'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import type Stripe from 'stripe'

/* After Stripe receives the payment, it will tell our app about it using a webhook.
It will send an API request to a route that we can determine.
*/

export async function POST(request: Request) {

    const body = await request.text()

    // Get the Stripe signature from the http headers
    const signature = headers().get('Stripe-Signature') ?? ''

    // Validate that this event actually comes from Stripe
    // Otherwise any user could call it to give themselves the Pro plan
    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        )
    } catch (err) {
        return new Response(
            `Webhook Error: ${
                err instanceof Error ? err.message : 'Unknown Error'
            }`,
            { status: 400 }
        )
    }

    const session = event.data.object as Stripe.Checkout.Session

    if (!session?.metadata?.userId) {
        return new Response(null, {
        status: 200,
        })
    }

    // If the user buys for the first time, add the subscription data in the user's entry in the database
    if (event.type === 'checkout.session.completed') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

        await db.user.update({
            where: {
                id: session.metadata.userId
            },
            data: {
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                stripePriceId: subscription.items.data[0]?.price.id,
                stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
            }
        })
    }

    // This is automatically called by Stripe when the monthly invoice payment succeeds
    if (event.type === 'invoice.payment_succeeded') {
        // Retrieve the subscription details from Stripe.
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

        await db.user.update({
            where: {
                stripeSubscriptionId: subscription.id
            },
            data: {
                stripePriceId: subscription.items.data[0]?.price.id,
                stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
            }
        })
    }

    return new Response(null, { status: 200 })
}