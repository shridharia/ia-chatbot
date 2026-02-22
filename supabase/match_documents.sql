-- Run this in Supabase SQL Editor after schema.sql
-- Enables similarity search for RAG

create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float default 0.5,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  url text,
  title text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    knowledge_base.id,
    knowledge_base.content,
    knowledge_base.url,
    knowledge_base.title,
    1 - (knowledge_base.embedding <=> query_embedding) as similarity
  from knowledge_base
  where knowledge_base.embedding is not null
  order by knowledge_base.embedding <=> query_embedding
  limit match_count;
end;
$$;
