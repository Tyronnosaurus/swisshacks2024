import Dashboard from '@/components/Dashboard'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { db } from '@/db'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'
 
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
 
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { z } from "zod"
import CompanyAnalysis from './_components/analysis'

const formSchema = z.object({
  company: z.string().min(2).max(50),
})

const countries = [
  { label: "USA", value: "USA" },
  { label: "Canada", value: "Canada" },
  { label: "UK", value: "UK" },
  // Add more countries as needed
];

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
    <>
      <CompanyAnalysis subscriptionPlan={subscriptionPlan} />
    </>
  )
}

export default Page;
