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
        console.log("fileid1:", fileid1, "fileid2:", fileid2);

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

        // Search the Pinecone vectorstore for the most relevant pages containing the formula
        const vectorStore1 = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            namespace: file1.id
        });

        const vectorStore2 = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            namespace: file2.id
        });

        console.log("Initialized Pinecone stores");

        const extractFormulaAndComponents = async (kpiName: string, formulaContent1: string, formulaContent2: string) => {
            const kpiFormulaPrompt = `Given the following context, identify the formula for the KPI "${kpiName}" and its components. Provide the formula and list all components separately.

CONTEXT 1:
${formulaContent1}

CONTEXT 2:
${formulaContent2}

Provide the response in the following JSON format:
{
    "formula": {
        "kpi_name": "${kpiName}",
        "formula_js": "total revenue / total assets",
        "components": [
            {
                "name": "total revenue"
            },
            {
                "name": "total assets"
            }
        ]
    }
}`;

            const formulaResponse = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert in financial analysis. Identify the formula and components accurately.'
                    },
                    {
                        role: 'user',
                        content: kpiFormulaPrompt
                    }
                ]
            });

            console.log("Formula response:", JSON.stringify(formulaResponse, null, 2));

            const formulaAndComponents = JSON.parse(formulaResponse.choices[0].message?.content || "{}");

            const schema = z.object({
                formula: z.object({
                    kpi_name: z.string(),
                    formula_js: z.string(),
                    components: z.array(
                        z.object({
                            name: z.string()
                        })
                    )
                })
            });

            return schema.parse(formulaAndComponents);
        };

        const searchComponentValues = async (vectorStore: PineconeStore, component: string) => {
            const componentSearchPrompt = `Find information related to the following component in the context provided. 

COMPONENT:
${component}`;

            const componentResults = await vectorStore.similaritySearch(componentSearchPrompt, 10) as PineconeResult[];
            const componentContent = componentResults.map((r: PineconeResult) => r.pageContent).join('\n\n');

            const extractionPrompt = `Extract the value for the component "${component}" from the following context:

CONTEXT:
${componentContent}

Provide the response in the following JSON format:
{
    "component_name": "${component}",
    "value": "extracted value",
    "type": "data type (e.g., money, percentage, etc.)"
}`;

            const extractionResponse = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert in financial analysis. Extract the value accurately.'
                    },
                    {
                        role: 'user',
                        content: extractionPrompt
                    }
                ]
            });
            console.log("prompt", extractionPrompt)
            console.log(`Extraction response for component "${component}":`, JSON.stringify(extractionResponse, null, 2));

            return JSON.parse(extractionResponse.choices[0].message?.content || "{}");
        };

        const formulaSearchPrompt = `Find the exact formula for the KPI "${kpiName}".`;

        const formulaResult1 = await vectorStore1.similaritySearch(formulaSearchPrompt, 10) as PineconeResult[];
        const formulaResult2 = await vectorStore2.similaritySearch(formulaSearchPrompt, 10) as PineconeResult[];

        const formulaContent1 = formulaResult1.map((r: PineconeResult) => r.pageContent).join('\n\n');
        const formulaContent2 = formulaResult2.map((r: PineconeResult) => r.pageContent).join('\n\n');

        const { formula } = await extractFormulaAndComponents(kpiName, formulaContent1, formulaContent2);
        console.log("Extracted formula and components:", JSON.stringify(formula, null, 2));

        // Search for each component in both documents
        const componentValuesFile1 = await Promise.all(
            formula.components.map(async (component) => {
                return await searchComponentValues(vectorStore1, component.name);
            })
        );

        const componentValuesFile2 = await Promise.all(
            formula.components.map(async (component) => {
                return await searchComponentValues(vectorStore2, component.name);
            })
        );

        const finalResponse = {
            formula,
            fileid1: componentValuesFile1,
            fileid2: componentValuesFile2
        };

        console.log("Final response:", JSON.stringify(finalResponse, null, 2));

        return new Response(JSON.stringify(finalResponse), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error("Error processing request:", error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
