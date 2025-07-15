import { OpenAIEmbeddings } from "@langchain/openai";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
// import { PoolConfig } from "pg";

// Embed the chunks
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const config = {
  postgresConnectionOptions: {
    type: "postgres",
    host: "127.0.0.1",
    port: 5432, // Note: This must match your Docker port
    user: "postgres",
    password: "postgres",
    database: "vector_db",
  },
  tableName: "transcripts",
  columns: {
    idColumnName: "id",
    vectorColumnName: "vector",
    contentColumnName: "content",
    metadataColumnName: "metadata",
  },
  // supported distance strategies: cosine (default), innerProduct, or euclidean
  distanceStrategy: "cosine",
};

// export const vectorStore = await new MemoryVectorStore(embeddings);

export const vectorStore = await PGVectorStore.initialize(embeddings, config);

export const addYTVideoToVectorStore = async (videoData) => {
  const { transcript, video_id } = videoData;
  const docs = [
    new Document({
      pageContent: transcript,
      metadata: { video_id },
    }),
  ];

  // split the video transcript into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await textSplitter.splitDocuments(docs);

  await vectorStore.addDocuments(chunks);
};
