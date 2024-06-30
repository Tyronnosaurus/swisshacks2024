[See it live!](https://swisshacks2024.vercel.app//)

## Getting Started

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

First, install the dependencies:

```pnpm install```

Then, run
```npx prisma generate```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or (recommended way)
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.



# Prisma
When making edits to schema.prisma, rerun this (must stop server and restart it afterwards):

```npx prisma db push``` Syncs the db's schema in the cloud

or

```npx prisma generate``` Generates usable types in our project. Not necessary if you already ran db push.

See https://www.prisma.io/docs/orm/prisma-migrate/workflows/prototyping-your-schema


Start Prisma Studio with
```npx prisma studio```
