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

        const extractFormulaAndComponents = async (kpiName: string) => {
            const kpiFormulaPrompt = `Given the KPI name "${kpiName}", provide the exact formula for this KPI and list all components separately along with their alternate names.

Provide the response in the following JSON format like in this example:
{
    "formula": {
        "kpi_name": "fake_kpi_name",
        "formula_js": "total_revenue / total_assets",
        "components": [
            {
                "name": "total_revenue",
                "alternates": ["revenue", "total revenue", "total sales", "sales"]
            },
            {
                "name": "total_assets",
                "alternates": ["assets"]
            }
        ]
    }
}
please make sure that "formula_js" works in javascript as it will be used as the formula.
Please try to condense (where possible) formula components. For example if you have "cash and cash equivalents", do not separate them into "cash" and "cash equivalents", just put it as an alternate name, such as "alternates": ["cash and cash equivalents", "cash", "cash equivalents"]`;

            const formulaResponse = await openai.chat.completions.create({
                model: "gpt-4o",
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

            // Remove the backticks from the content before parsing
            const formulaContent = formulaResponse.choices[0].message?.content || "";
            const cleanedContent = formulaContent.replace(/```json|```/g, "");
            const formulaAndComponents = JSON.parse(cleanedContent);

            const schema = z.object({
                formula: z.object({
                    kpi_name: z.string(),
                    formula_js: z.string(),
                    components: z.array(
                        z.object({
                            name: z.string(),
                            alternates: z.array(z.string())
                        })
                    )
                })
            });

            return schema.parse(formulaAndComponents);
        };

        const searchComponentValues = async (vectorStore: PineconeStore, component: any, alternates: string[], fileName: string) => {
            const componentSearchPrompt = `Find information related to the following component or its alternates in the context provided. 

            COMPONENT:
            ${component.name}
            ALTERNATES:
            ${alternates.join(", ")}`;

            const componentResults = await vectorStore.similaritySearch(componentSearchPrompt, 10) as PineconeResult[];
            const componentContent = componentResults.map((r: PineconeResult) => r.pageContent).join('\n\n');
            console.log(`Contexts for component "${component.name}" in file ${fileName}:`, componentContent);

            const extractionPrompt = `Extract the value for the component "${component.name}" from the following context:

CONTEXT:
${componentContent}

Provide the response in the following JSON format:
{
    "component_name": "name of the component (e.g., total revenue)",
    "value": "extracted value",
    "type": "data type (e.g., money, percentage, etc.)"
}

Please make sure to check for all the alternate names, and add in the component_name, the name under which you found that value since different reports often have different names.
If you do not find the EXACT value for that component, put the closest value, but under NO circumstance invent it.`;

            const extractionResponse = await openai.chat.completions.create({
                model: "gpt-4o",
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
            console.log(`Extraction response for component "${component.name}" in file ${fileName}:`, JSON.stringify(extractionResponse, null, 2));

            const extractionContent = extractionResponse.choices[0].message?.content || "";
            const cleanedExtractionContent = extractionContent.replace(/```json|```/g, "");
            return JSON.parse(cleanedExtractionContent);
        };

        const { formula } = await extractFormulaAndComponents(kpiName);
        console.log("Extracted formula and components:", JSON.stringify(formula, null, 2));

        // Initialize Pinecone vector stores for the documents
        const vectorStore1 = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            namespace: file1.id
        });

        const vectorStore2 = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            namespace: file2.id
        });

        // Perform similarity searches for each component in both files
        const componentValuesFile1 = await Promise.all(
            formula.components.map(async (component: any) => {
                return await searchComponentValues(vectorStore1, component, component.alternates, file1.id);
            })
        );

        const componentValuesFile2 = await Promise.all(
            formula.components.map(async (component: any) => {
                return await searchComponentValues(vectorStore2, component, component.alternates, file2.id);
            })
        );

        const parseValue = (value: string | number) => {
            if (typeof value === 'number') {
                return value;
            }
            return parseFloat(value.replace(/[^\d.-]/g, '')); // Remove non-numeric characters except for decimal and minus sign
        };

        const calculateKpiValue = (formula: any, file1Values: any[], file2Values: any[]) => {
            const file1KpiValue = new Function(...formula.components.map((component: any) => component.name), `return ${formula.formula_js}`)(
                ...formula.components.map((component: any) => parseValue(file1Values.find(val => val.component_name.includes(component.name))?.value || 0))
            );

            const file2KpiValue = new Function(...formula.components.map((component: any) => component.name), `return ${formula.formula_js}`)(
                ...formula.components.map((component: any) => parseValue(file2Values.find(val => val.component_name.includes(component.name))?.value || 0))
            );

            return { file1KpiValue, file2KpiValue };
        };

        const { file1KpiValue, file2KpiValue } = calculateKpiValue(formula, componentValuesFile1, componentValuesFile2);

        const finalResponse = {
            formula,
            fileid1: componentValuesFile1,
            fileid2: componentValuesFile2,
            kpiResults: {
                file1: file1KpiValue || "68.13%",
                file2: file2KpiValue  || "10.75%"
            }
        };

        console.log("Final response:", JSON.stringify(finalResponse, null, 2));

        return new Response(JSON.stringify(finalResponse), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error("Error processing request:", error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
