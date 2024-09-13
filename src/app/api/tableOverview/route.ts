import { db } from "@/db";
import { NextRequest } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeClient } from "@/lib/pinecone";
import { openai } from "@/lib/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { z } from "zod";

interface PineconeResult {
    id: string;
    score: number;
    metadata: Record<string, any>;
    pageContent: string;
}

export const POST = async (req: NextRequest) => {
    console.log("POST request received");

    try {
        const body = await req.json();
        console.log("Request body:", body);

        const { getUser } = getKindeServerSession();
        const user = getUser();
        console.log("User:", user);

        const { id: userId } = user;

        if (!userId) {
            console.log("Unauthorized: No user ID found");
            return new Response('Unauthorized', { status: 401 });
        }

        const { fileid1, fileid2, kpiName } = body;
        console.log("fileid:", fileid1, fileid2, "kpiName:", kpiName);

        // Fetch the files' info from the database (to confirm they exist and belong to the actual logged in user)
        const file1 = await db.file.findFirst({
            where: {
                id: fileid1,
                userId
            }
        });

        if (!file1) {
            console.log("File 1 not found");
            return new Response('Not found', { status: 404 });
        }

        const file2 = await db.file.findFirst({
            where: {
                id: fileid2,
                userId
            }
        });

        if (!file2) {
            console.log("File 2 not found");
            return new Response('Not found', { status: 404 });
        }

        console.log("Files found:", { file1, file2 });

        // Prepare objects to interact with the APIs
        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY!,
        });

        const pinecone = getPineconeClient();
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

        console.log("Initialized Pinecone and OpenAIEmbeddings");

        function createChatCompletionMessage(extractionType: string, results1: any[], results2: any[], message: string): ChatCompletionMessageParam[] {
            return [
                {
                    role: 'system',
                    content: 'Use the following context to answer the user"s question in markdown format.',
                },
                {
                    role: 'user',
                    content: `Identify the company's ${extractionType}. Write only the conclusion.
                            Give a response in markdown format. If you don't know the answer, just say you don't know, don't try to make it up.
                    
                            CONTEXT 1:
                            ${results1.map((r) => r.pageContent).join('\n\n')}
                            \n
                            CONTEXT 2:
                            ${results2.map((r) => r.pageContent).join('\n\n')}
                            \n
                            USER'S INPUT: ${message}`
                }
            ];
        }
        
        const extractCompanyName = createChatCompletionMessage("names", results1, results2, message);        
        const extractLegalStructure = createChatCompletionMessage("legal structure", results1, results2, message);
        const extractStockCurrency = createChatCompletionMessage("stock currency", results1, results2, message);
        const extractVolatility = createChatCompletionMessage("Volatility 1 year (in EUR)", results1, results2, message);     
        const extractNetIncome = createChatCompletionMessage("Net Income", results1, results2, message);     
        const extractReturnOnAssets = createChatCompletionMessage("Return on Assets (ROA)", results1, results2, message);     
        const extractReturnOnEquity = createChatCompletionMessage("Return on Equity (ROE)", results1, results2, message);     
        const extractRevenueGrowth = createChatCompletionMessage("Revenue Growth", results1, results2, message);     
        const extractNetIncomeGrowth = createChatCompletionMessage("Net Income Growth", results1, results2, message);     
        const extractEPSGrowth = createChatCompletionMessage("EPS Growth", results1, results2, message);     
        const extractCurrentRatio = createChatCompletionMessage("Current Ratio", results1, results2, message);     
        const extractQuickRatio = createChatCompletionMessage("Quick Ratio", results1, results2, message);     
        const extractDebtRatio = createChatCompletionMessage("Debt to Equity Ratio", results1, results2, message);     

        console.log("Prompt messages: ", promptMessages)
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

        console.log("Final response:", JSON.stringify(finalResponse, null, 2));

        return new Response(JSON.stringify(finalResponse), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error("Error processing request:", error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
