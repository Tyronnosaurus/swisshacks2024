import { PineconeClient } from '@pinecone-database/pinecone'

export const getPineconeClient = async () => {
  const client = new PineconeClient()

  await client.init({
    apiKey: process.env.PINECONE_API_KEY!,
    //environment: process.env.PINECONE_ENV!
    environment: "gcp-starter"
  })

  return client
}