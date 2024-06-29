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

    // Save the user's message in the database
    await db.message.create({
        data: {
            text: message,
            isUserMessage: true,
            userId,
            fileId: fileId
        }
    })

    // Fetch the most recent messages sent by the user for this file from the database
    const prevMessages = await db.message.findMany({
        where: {fileId: fileId},
        orderBy: { createdAt: "asc"},
        take: 2
    })

    // Format them in a way that can be used in the OpenAI prompt
    const formattedPrevMessages = prevMessages.map((msg) => ({
        role: msg.isUserMessage? "user" as const : "assistant" as const,
        content: msg.text
    }))


    ///////////////////////////////////


    // Fetch the files' info from the database (to confirm they exist and belong to the actual logged in user)
    // In reverse order to prevent switching them. TODO: Find out why they get switched
    const [fileId2, fileId1] = fileId.split("_")
    
     
    const file1 = await db.file.findFirst({
        where: {
            id:fileId1,
            userId
        }
    })

    if(!file1) return(new Response('Not found', { status:404 }))

    const file2 = await db.file.findFirst({
        where: {
            id:fileId2,
            userId
        }
    })

    if(!file2) return(new Response('Not found', { status:404 }))


    ///////////////////////////////////


    // Prepare objects to interact with the APIs
    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY!,
    });

    const pinecone = getPineconeClient();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);


    // Search the Pinecone vectorstore for the most relevant page
    // (by comparing vectorized message with vectorized pages)
    const vectorStore1 = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace: file1.id
    })

    // Get 4 closest results
    const results1 = await vectorStore1.similaritySearch(message, 4)

    // Same for file 2
    const vectorStore2 = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace: file2.id
    })

    const results2 = await vectorStore2.similaritySearch(message, 4)


    ///////////////////////////////////


    // Prepare the text of the prompt
    const promptMessages: ChatCompletionMessageParam[]  = [
        {
          role: 'system',
          content: 'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
        },
        {
          role: 'user',
          content: `Write a summary of the differences between the two contexts involving the input specified by the user.
                    You may also use the previous conversation. Write only the conclusion.
                    Give a response in markdown format. If you don't know the answer, just say that you don't know, don't try to make up an answer.
                    \n----------------\n
                    PREVIOUS CONVERSATION:
                    ${formattedPrevMessages.map((message) => {
                        if (message.role === 'user') return `User: ${message.content}\n`
                        return `Assistant: ${message.content}\n`
                    })}
                    \n----------------\n
                    CONTEXT 1:
                    ${results1.map((r) => r.pageContent).join('\n\n')}
                    \n
                    CONTEXT 2:
                    ${results2.map((r) => r.pageContent).join('\n\n')}
                    \n
                    USER'S INPUT: ${message}`
        }
    ]

    // Send prompt to OpenAI API
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
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