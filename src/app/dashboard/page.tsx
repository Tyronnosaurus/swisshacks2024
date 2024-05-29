import Dashboard from '@/components/Dashboard'
import { db } from '@/db'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'

const Page = async () => {

   // If user is not logged in, redirect to auth-callback page
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) redirect("/auth-callback?origin=dashboard")

  // If user is logged in but user service is not synced with user database, redirect to auth-callback page
  const dbUser = await db.user.findFirst({
    where: {
      id: user.id
    }
  })

  // If user is not in db, redirect to auth callback page where they will be added to the db
  if(!dbUser) redirect('/auth-callback?origin=dashboard')

  const subscriptionPlan = await getUserSubscriptionPlan()
  
  return (
    <Dashboard subscriptionPlan={subscriptionPlan}/>
  )
}

export default Page