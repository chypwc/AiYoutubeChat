// npm install @langchain/langgraph @langchain/core @langchain/anthropic @langchain/openai zod
// npm i langchain
// node --env-file=.env agent.js
import { ChatAnthropic } from "@langchain/anthropic";
// A ReAct agent is a type of agent that can Reason about a task and then Act to accomplish it
import { createReactAgent } from "@langchain/langgraph/prebuilt";

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph";

import { vectorStore, addYTVideoToVectorStore } from "./embeddings.js";

import data from "./data.js";

await addYTVideoToVectorStore(data[0]);
await addYTVideoToVectorStore(data[1]);

// retrieval tool
// async : Enabling use of await inside the function
const retrievalTool = tool(
  async ({ query }, { configurable: { video_id } }) => {
    console.log("Retrieving docs for query --------------------------");

    // Returns the top 5 most similar chunks
    // Performs semantic search: it embeds your query and compares it to the stored chunks using cosine similarity
    // {
    //   pageContent: "Yamamoto threw 50 strikes...",
    //   metadata: { video_id: "abc123" }
    // }

    const docsRetrieved = await vectorStore.similaritySearch(
      query,
      5,
      { video_id }
      // (doc) => String(doc.metadata.video_id) === String(video_id) // MemoryVectorStore requires a function filter
    );

    // console.log("docsRetrieved: ", docsRetrieved);

    // Serialize the retrieved chunks into a single string
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

const checkpointer = new MemorySaver();

const agent = createReactAgent({
  llm,
  tools: [retrievalTool],
  checkpointer,
});

//  testing the agent
// const video_id = "XIccFOAn7EE";
const video_id = "Q7mS1VHm3Yw";

// console.log("Q1: How many strikes (Ks) did the pitcher throw in the video?");
console.log(
  "Q1: What will people learn from the video based on the transcript?"
);
// The await keyword pauses the script until the agent gets a response back from the Anthropic API
const results = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content:
          "What will people learn from the video based on the transcript?",
      },
    ],
  },
  { configurable: { thread_id: 1, video_id } }
);

// .at(-1) always retrieves the last element
// ? (The Optional Chaining Operator)
// It checks if the value to its left (results.messages.at(-1)) is null or undefined.
console.log(results.messages.at(-1)?.content);

// console.log("Q2: What kind of pitch did the pitcher throw?");
// // The await keyword pauses the script until the agent gets a response back from the Anthropic API
// const results2 = await agent.invoke(
//   {
//     messages: [
//       {
//         role: "user",
//         content:
//           "What kind of pitch did the pitcher throw (based on the video transcript)?",
//       },
//     ],
//   },
//   { configurable: { thread_id: 1, video_id } }
// );
// console.log(results2.messages.at(-1)?.content);
