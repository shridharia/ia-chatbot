# IA Digital Agent Chatbot

A contextual chatbot for Impact Analytics (impactanalytics.ai) built with Next.js, Supabase, and OpenAI.

## Features

- **Contextual responses** – Answers questions about Impact Analytics services, products, and solutions
- **Source links** – Provides links to relevant pages on the website
- **Phase 1:** Standalone web app
- **Phase 2:** Embeddable widget for impactanalytics.ai

## Tech Stack

- **Next.js 16** – App Router, TypeScript, Tailwind CSS
- **Supabase** – PostgreSQL + pgvector for embeddings
- **OpenAI** – GPT-4o-mini for chat, text-embedding-3-small for RAG

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

Required:
- `OPENAI_API_KEY` – From [platform.openai.com](https://platform.openai.com)
- `NEXT_PUBLIC_SUPABASE_URL` – Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` – For ingestion script (server-side only)

### 3. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Enable the **pgvector** extension in Database → Extensions
3. Run the schema in `supabase/schema.sql` in the SQL Editor

### 4. Ingest knowledge base

Populate the knowledge base from the CSV file:

```bash
npm run ingest
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  page.tsx           # Chat UI
  api/chat/          # Chat API route
  embed/             # Embeddable widget (Phase 2)
lib/
  supabase.ts
  openai.ts
  rag.ts
scripts/
  ingest.ts          # CSV → Supabase ingestion
```

## Data Source

`IA-website live URLs.txt` – CSV with Impact Analytics website URLs and content used for RAG context.
