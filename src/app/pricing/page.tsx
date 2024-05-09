import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip'
import { PLANS } from "@/config/stripe"
import { cn } from "@/lib/utils"
import { ArrowRight, Check, HelpCircle, Minus } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import UpgradeButton from "@/components/UpgradeButton"

const Page = () => {

    // Get logged in user so that we can decide what call to action should the buttons have (Sign up vs Upgrade)
    const {getUser} = getKindeServerSession()
    const user = getUser()

    // Info to show on each tier
    const pricingItems = [
        {
          plan: 'Free',
          tagline: 'For small side projects.',
          pdfsPerMonth: 10,
          features: [
            {
              text: '5 pages per PDF',
              tooltip: 'The maximum amount of pages per PDF-file.',
            },
            {
              text: '4MB file size limit',
              tooltip: 'The maximum file size of a single PDF file.',
            },
            {
              text: 'Mobile-friendly interface',
            },
            {
              text: 'Higher-quality responses',
              tooltip: 'Better algorithmic responses for enhanced content quality',
              negative: true,
            },
            {
              text: 'Priority support',
              negative: true,
            },
          ],
        },
        {
          plan: 'Pro',
          tagline: 'For larger projects with higher needs.',
          pdfsPerMonth: PLANS.find((p) => p.slug === 'pro')!.pdfsPerMonth,
          features: [
            {
              text: '25 pages per PDF',
              tooltip: 'The maximum amount of pages per PDF-file.',
            },
            {
              text: '16MB file size limit',
              tooltip: 'The maximum file size of a single PDF file.',
            },
            {
              text: 'Mobile-friendly interface',
            },
            {
              text: 'Higher-quality responses',
              tooltip: 'Better algorithmic responses for enhanced content quality',
            },
            {
              text: 'Priority support',
            },
          ],
        },
      ]


    return(
        <>
            <MaxWidthWrapper className="mb-8 mt-24 text-center max-w-5xl">
                {/* Page headers */}
                <div className="mx-auto mb-10 sm:max-w-lg">
                    <h1 className="text-6xl font-bold sm:text-7xl">Pricing</h1>
                    <p className="mt-5 text-gray-600 sm:text-lg">
                        Whether you&apos;re just trying out our service or need more, we&apos;ve got you covered.
                    </p>
                </div>

                {/* Pricing tier boxes */}
                <div className="pt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
                    <TooltipProvider>
                        {pricingItems.map(({plan, tagline, pdfsPerMonth, features}) => {
                            const price = PLANS.find((p) => p.slug === plan.toLowerCase())?.price.amount || 0

                            return(
                                <div key={plan} className={cn('relative rounded-2xl bg-white shadow-lg', {
                                    'border-2 border-blue-600 shadow-blue-200': (plan === 'Pro'),
                                    'border border-blue-200': (plan !== 'Pro'),
                                })}>
                                    {/* Catchy "Upgrade now" banner on top of the Pro plan */}
                                    {plan === "Pro" && (
                                        <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-2 text-sm font-medium">
                                            Upgrade now
                                        </div>
                                    )}

                                    {/* Plan name, tagline & price */}
                                    <div className="p-5">
                                        <h3 className='my-3 text-center font-display text-3xl font-bold'>{plan}</h3>
                                        <p className="text-gray-500">{tagline}</p>
                                        <p className="my-5 font-display text-6xl font-semibold">${price}</p>
                                        <p className="tex-gray-500">per month</p>
                                    </div>

                                    {/* Quota (how many PDFs/month) */}
                                    <div className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-gray-50">
                                        <div className="flex items-center space-x-1">
                                            <p>{pdfsPerMonth.toLocaleString()} PDFs/month included</p>

                                            <Tooltip delayDuration={300}>
                                                <TooltipTrigger className="cursor-default ml-1.5">
                                                    <HelpCircle className="h-4 w-4 text-zinc-500" />
                                                </TooltipTrigger>
                                                    
                                                <TooltipContent className="w-80 p-2">
                                                    How many PDFs you can upload per month.
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>

                                    {/* List of features included/excluded in the plan */}
                                    <ul className="my-10 space-y-5 px-8">
                                        {features.map(({text, tooltip, negative}) => (
                                            <li key={text} className="flex space-x-5">

                                                {/* Show a tick (feature included) or a minus sign (feature not included) */}
                                                <div className="flex-shrink-0">
                                                    {negative ? (
                                                        <Minus className="h-6 w-6 text-grey-300" />
                                                    ) : (
                                                        <Check className="h-6 w-6 text-blue-300" />
                                                    )}
                                                </div>

                                                {/* Describe the feature, with a tooltip at the end for further info */}
                                                <div className="flex items-center space-x-1">
                                                    <p className={cn('text-gray-400', {'text-gray-600': negative})}>
                                                        {text}
                                                    </p>

                                                    {tooltip && (
                                                        <Tooltip delayDuration={300}>
                                                            <TooltipTrigger className="cursor-default ml-1.5">
                                                                <HelpCircle className="h-4 w-4 text-zinc-500" />
                                                            </TooltipTrigger>
                                                                
                                                            <TooltipContent className="w-80 p-2">
                                                                {tooltip}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="border-t border-gray-200" />

                                    {/* Button to subscribe to the plan */}
                                    <div className="p-5">
                                        {/* Free plan */}
                                        {plan === "Free" && (
                                            <Link href="/sign-in" className={buttonVariants({className: 'w-full', variant: 'secondary'})}>
                                                {user ? "Upgrade now" : "Sign up"}
                                                <ArrowRight className="h-5 w-5 ml-1.5" />
                                            </Link>
                                        )}
                                        
                                        {/* Pro plan. If a free plan user is already logged in, we show a fancy "Upgrade" button */}
                                        {plan === "Pro" && (
                                            user ? (
                                                <UpgradeButton />
                                            ) : (
                                                <Link href="/sign-in" className={buttonVariants({className: 'w-full'})}>
                                                    Sign up
                                                    <ArrowRight className="h-5 w-5 ml-1.5" />
                                                </Link>
                                            )
                                        )}
                                    </div>

                                </div>
                            )
                        })}
                    </TooltipProvider>
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page