import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

// Embed the chunks
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

export const vectorStore = await new MemoryVectorStore(embeddings);

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
