import { db } from "@/db";
import { NextRequest } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeClient } from "@/lib/pinecone";
import { openai } from "@/lib/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { OpenAIStream, StreamingTextResponse } from "ai"


export const POST = async (req: NextRequest) => {
    // Endpoint for asking a question to a PDF file

    const body = await req.json()

    const {getUser} = getKindeServerSession()
    const user = getUser()

    const {id: userId} = user
    
    if(!userId) return(new Response('Unauthorized', { status:401 }))

    const { fileId, message } = SendMessageValidator.parse(body)

    // Fetch the file's info from the database (we need its id)
    const file = await db.file.findFirst({
        where: {
            id:fileId,
            userId
        }
    })

    if(!file) return(new Response('Not found', { status:404 }))

    // Save the user's message in the database
    await db.message.create({
        data: {
            text: message,
            isUserMessage: true,
            userId,
            fileId
        }
    })

    // Prepare objects to interact with the APIs
    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY!,
    });

    const pinecone = getPineconeClient();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    // Search the Pinecone vectorstore for the most relevant page
    // (by comparing vectorized message with vectorized pages)
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace: file.id
    })

    // Get 4 closest results
    const results = await vectorStore.similaritySearch(message, 4)

    // Fetch the most recent messages sent by the user for this file from the database
    const prevMessages = await db.message.findMany({
        where: {fileId},
        orderBy: { createdAt: "asc"},
        take: 6
    })

    // Format them in a way that can be used in the OpenAI prompt
    const formattedPrevMessages = prevMessages.map((msg) => ({
        role: msg.isUserMessage? "user" as const : "assistant" as const,
        content: msg.text
    }))

    // Prepare the text of the prompt
    const promptMessages: ChatCompletionMessageParam[]  = [
        {
          role: 'system',
          content: 'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
        },
        {
          role: 'user',
          content: `Use the following pieces of context (or previous conversaton if needed) to answer the user's question in markdown format. \n
                    If you don't know the answer, just say that you don't know, don't try to make up an answer.
                    \n----------------\n
                    PREVIOUS CONVERSATION:
                    ${formattedPrevMessages.map((message) => {
                    if (message.role === 'user') return `User: ${message.content}\n`
                    return `Assistant: ${message.content}\n`
                    })}
                    \n----------------\n
                    CONTEXT:
                    ${results.map((r) => r.pageContent).join('\n\n')}
                    USER INPUT: ${message}`
        }
    ]

    // Send prompt to OpenAI API
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0,
        stream: true,
        messages: promptMessages
    })

    // Save response in our database
    const stream = OpenAIStream(response, {
        async onCompletion(completion){
            await db.message.create({
                data: {
                    text: completion,
                    isUserMessage: false,
                    fileId,
                    userId
                }
            })
        }
    })


    return new StreamingTextResponse(stream)
}