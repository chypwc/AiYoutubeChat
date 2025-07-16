# AI Chat with YouTube Video

A full-stack application that allows users to chat with an AI assistant about the content of a YouTube video. The system leverages vector search, embeddings, and a PostgreSQL database to provide context-aware answers based on video transcripts.
![](./image.png)

---

## Features

- **Chat UI**: Modern, responsive chat interface (React + Vite)
- **AI Backend**: Node.js server using OpenAI and LangChain for embeddings and vector search
- **YouTube Integration**: Scrapes and indexes YouTube video transcripts
- **PostgreSQL + pgvector**: Stores and searches embeddings efficiently
- **Webhook Support**: Receives data from Bright Data or other scrapers
- **Genezio Deployment**: Easily deploy backend and frontend to the cloud

---

## Architecture

```
[User]
  │
  ▼
[React Frontend]  ←→  [Node.js Backend (Express)]  ←→  [PostgreSQL + pgvector]
                                      ↑
                                      │
                        [Bright Data Webhook / YouTube Scraper]
```

---

## Database Setup: Local vs. Deployment

This project supports two database environments:

- **Local Development:** Uses a local PostgreSQL instance (with `pgvector` extension) via Docker Compose.
- **Production/Deployment:** Uses [Neon](https://neon.tech/) (a fully managed, serverless PostgreSQL database online) for cloud deployments.

### Local PostgreSQL (with pgvector)

- Make sure Docker is installed.
- Start the database:
  ```sh
  cd postgres
  docker-compose up -d
  ```
- Ensure the `pgvector` extension is enabled in your local database.
- Example `DATABASE_URL` for local:
  ```
  DATABASE_URL=postgresql://user:password@localhost:5432/yourdb
  ```

### Neon Database (for Deployment)

- [Sign up for Neon](https://neon.tech/) and create a new project.
- Enable the `pgvector` extension in your Neon database (see Neon docs).
- Get your Neon connection string from the Neon dashboard.
- Example `DATABASE_URL` for Neon:
  ```
  DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
  ```
- Use this connection string in your deployment environment (e.g., Genezio backend environment variables).

---

## Getting Started

### 1. Clone the Repository

```sh
git clone <repo-url>
cd rag_nodejs
```

### 2. Backend Setup

```sh
cd server
npm install
```

- Copy `.env.example` to `.env` and fill in your environment variables (see below).

### 3. Frontend Setup

```sh
cd ../client
npm install
```

### 4. Environment Variables

#### Backend (`server/.env`):

```
API_URL=<your-backend-url> # e.g. http://localhost:3000 or your Genezio function URL
BRIGHTDATA_API_KEY=<your-brightdata-api-key>
DATABASE_URL=<your-local-or-neon-connection-string>
```

#### Frontend (`client/.env`):

```
VITE_API_URL=<your-backend-url>
```

---

## Running Locally

### Start Backend

```sh
cd server
npm run dev
```

### Start Frontend

```sh
cd client
npm run dev
```

The frontend will be available at [http://localhost:5173](http://localhost:5173) by default.

---

## Deployment with Genezio

1. Install the Genezio CLI:
   ```sh
   npm install -g genezio
   ```
2. Deploy:
   ```sh
   genezio deploy
   ```
3. The deployed function URL will be available in the CLI output and injected into your environment variables as `API_URL` and `VITE_API_URL`.
4. **Set your Neon `DATABASE_URL` in the Genezio backend environment for production deployments.**

---

## Usage

- Start a new chat and ask questions about the YouTube video.
- The backend will fetch or use indexed transcript data, perform vector search, and respond contextually.

## Reference

This project is inspired by and learned from the [notJust-dev/AIChatWithYoutube](https://github.com/notJust-dev/AIChatWithYoutube) repository and the corresponding notJust.dev YouTube channel.

Additional resource:
https://www.notjust.dev/blog/langgraph-ai-agent-genezio
