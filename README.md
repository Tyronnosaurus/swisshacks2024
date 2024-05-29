[See it live!](https://quill-beta-nine.vercel.app/)

A complete webapp where you can upload a PDF and ask questions about it in plain English. Includes everything a SaaS would need: responsiveness, user registration, database, different plans, payment processor, chat with infinite scrolling, etc.

Whenever a PDF is uploaded, it is analysed and each page has its text converted to vector embeddings. When a user asks a question, the question is also converted to a vector embedding. A comparison is done to find out which pages are semantically closer to the question. Finally, a prompt is sent to an AI service with both the question and the relevant text from the PDF. The answer is streamed into a chat message, and the user can then ask further questions.

Based on [this tutorial](https://www.youtube.com/watch?v=ucX2zXAZ1I0) by 'Josh tried coding', with many refactorings to make is easier to adapt to future products of my own.



![Homepage](public\homepage-preview.png "Homepage")
![File upload](public\file-upload-preview.jpg "File upload")
![File list](public\file-list-preview.png "File list")
![Chat](public\chat-preview.jpg "Chat")
![Chat2](public\chat-preview2.png "Chat 2")

## Getting Started

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

First, run the development server:

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