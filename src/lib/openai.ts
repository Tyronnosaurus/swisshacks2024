import OpenAI from "openai"

// OpenAI API client object for interacting with it (e.g. sending prompts and receiving responses).
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})