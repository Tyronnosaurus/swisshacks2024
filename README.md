
[See it live!](https://swisshacks2024.vercel.app/)  

## Presentation
[![Youtube presentation](https://img.youtube.com/vi/Px1rdv2ye8E/0.jpg)](https://www.youtube.com/watch?v=Px1rdv2ye8E)


## Getting Started

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# To install pnpm globally

npm install -g pnpm

# Verify the installation

pnpm --version

# Install Dependencies

```pnpm install```

Then, run

```npx prisma generate```

  
# Run Development Server

```bash

npm  run  dev

```

## Or the recommended way
```bash

pnpm dev

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