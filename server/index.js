import express from "express";
import cors from "cors";
import { agent } from "./agent.js";
import { addYTVideoToVectorStore } from "./embeddings.js";

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json({ limit: "200mb" }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/generate", async (req, res) => {
  const { query, thread_id } = req.body;
  console.log(query, thread_id);

  const results = await agent.invoke(
    {
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
    },
    { configurable: { thread_id } }
  );

  res.send(results.messages.at(-1)?.content);
});

app.post("/webhook", async (req, res) => {
  console.log("Webhook received:", req.body);
  try {
    await Promise.all(
      req.body.map(async (video) => addYTVideoToVectorStore(video))
    );
    res.send("OK");
  } catch (err) {
    console.error("Error processing webhook:", err);
    res.status(500).send("Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// curl -X POST http://localhost:3000/generate \
// -H "Content-Type: application/json" -d '{
// "query": "What will people learn from the video based on the transcript?",
// "video_id": "Q7mS1VHm3Yw",
// "thread_id": 1}'
