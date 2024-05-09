export const PLANS = [
    {
        name: "Free",
        slug: "free",
        pdfsPerMonth: 10,
        pagesPerPdf: 5,
        price: {
            amount: 0,
            priceIds: {
                test: '',
                production: ''
            }
        }
    },

    {
        name: "Pro",
        slug: "pro",
        pdfsPerMonth: 50,
        pagesPerPdf: 25,
        price: {
            amount: 14,
            priceIds: {
                test: process.env.STRIPE_PRICE_ID!,
                production: ''
            }
        }
    }
]





