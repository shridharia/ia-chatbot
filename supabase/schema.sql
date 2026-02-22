-- Enable pgvector extension for embeddings
create extension if not exists vector;

-- Knowledge base table for RAG
create table if not exists knowledge_base (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  content text not null,
  title text,
  embedding vector(1536),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Index for similarity search
create index if not exists knowledge_base_embedding_idx on knowledge_base
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
