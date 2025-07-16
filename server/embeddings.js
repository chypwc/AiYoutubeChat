import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
});

// Local PostgreSQL Vector Store config (used if DB_URL is not set)
const localConfig = {
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
  distanceStrategy: "cosine",
};

// Cloud/Remote PostgreSQL Vector Store config (used if DB_URL is set)
const remoteConfig = {
  postgresConnectionOptions: {
    connectionString: process.env.DB_URL,
  },
  tableName: "transcripts",
  columns: {
    idColumnName: "id",
    vectorColumnName: "vector",
    contentColumnName: "content",
    metadataColumnName: "metadata",
  },
  distanceStrategy: "cosine",
};

// Choose config based on environment
const config = process.env.DB_URL ? remoteConfig : localConfig;

export const vectorStore = await PGVectorStore.initialize(embeddings, config);

export const addYTVideoToVectorStore = async (videoData) => {
  const { transcript, video_id } = videoData;

  const docs = [
    new Document({
      pageContent: transcript,
      metadata: { video_id },
    }),
  ];

  // Split the video into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitDocuments(docs);

  await vectorStore.addDocuments(chunks);
};
