// npm install @langchain/langgraph @langchain/core @langchain/anthropic zod
// npm i langchain
import { ChatAnthropic } from "@langchain/anthropic";
// A ReAct agent is a type of agent that can Reason about a task and then Act to accomplish it
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

import data from "./data.js";

const video1 = data[0];
const docs = [
  new Document({
    pageContent: video1.transcript,
    metadata: { video_id: video1.video_id },
  }),
];

// split the video transcript into chunks
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const chunks = await textSplitter.splitDocuments(docs);

// Embed the chunks
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});
const vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);

// Returns the top 5 most similar chunks
// Performs semantic search: it embeds your query and compares it to the stored chunks using cosine similarity
// const docsRetrieved = await vectorStore.similaritySearch(
//   "How many strikes did the pitcher throw in the video?",
//   5
// );
// console.log("Retrieved docs: --------------------------------");
// console.log(docsRetrieved);

// retrieval tool
// async : Enabling use of await inside the function
const retrievalTool = tool(
  async ({ query }) => {
    console.log("Retrieving docs for query: ", query);

    const docsRetrieved = await vectorStore.similaritySearch(query, 10);
    const serializedDocs = docsRetrieved
      .map((doc) => doc.pageContent)
      .join("\n");
    return serializedDocs;
  },
  {
    name: "retrieve",
    description: "Retrieve the most relevant chunks from the youtube video",
    schema: z.object({
      query: z.string(), // this tool expects an object with a single string field called query
    }),
  }
);

const llm = new ChatAnthropic({
  model: "claude-3-5-sonnet-20240620",
});

const agent = createReactAgent({ llm, tools: [retrievalTool] });

// The await keyword pauses the script until the agent gets a response back from the Anthropic API
const results = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "How many strikes (Ks) did the pitcher throw in the video?",
    },
  ],
});

// .at(-1) always retrieves the last element
// ? (The Optional Chaining Operator)
// It checks if the value to its left (results.messages.at(-1)) is null or undefined.
console.log(results.messages.at(-1)?.content);
