// npm i express cors @types/express
import express from "express";
import cors from "cors";
import { agent } from "./agent.js";

const app = express();
const PORT = 3000;

app.use(express.json()); // to parse JSON bodies
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

// curl -X POST http://localhost:3000/generate \
// -H "Content-Type: application/json" -d '{
// "query": "What will people learn from the video based on the transcript?",
// "video_id": "Q7mS1VHm3Yw",
// "thread_id": 1}'
app.post("/generate", async (req, res) => {
  const { query, video_id, thread_id } = req.body;
  console.log("query: ", query);
  console.log("video_id: ", video_id);

  // The await keyword pauses the script until the agent gets a response back from the Anthropic API
  const results = await agent.invoke(
    {
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
    },
    { configurable: { thread_id, video_id } }
  );

  // .at(-1) always retrieves the last element
  // ? (The Optional Chaining Operator)
  // It checks if the value to its left (results.messages.at(-1)) is null or undefined.
  const response = results.messages.at(-1)?.content;

  res.send(response);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
