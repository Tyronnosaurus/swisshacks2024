import { Pinecone } from "@pinecone-database/pinecone";

// Crates a Pinecone client object that can be used to vectorize documents and save the vectors on Pinecone
export const getPineconeClient = () => {
  const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  return client;
};