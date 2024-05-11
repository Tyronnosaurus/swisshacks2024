"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "./ui/button"
import { trpc } from "@/app/_trpc/client"


/** Fancy "Subscribe" button that appears on the Pricing page under the Pro plan, to catch the attention of the user */
const UpgradeButton = () => {

  // When button is clicked, we'll create a Stripe session. Doing so will
  // return a url to go Stripe's checkout page
  const {mutate: createStripeSession} = trpc.createStripeSession.useMutation({
    onSuccess: ({url}) => {
      window.location.href = url ?? "/dashboard/billing"  // Redirect user to checkout page (or stay on billing page if createStripeSession fails to return an url)
    }
  })


  return (
    <Button onClick={() => createStripeSession()} className="w-full">
        Upgrade now
        <ArrowRight className="h-5 w-5 ml-1.5" />
    </Button>
  )
}

export default UpgradeButton