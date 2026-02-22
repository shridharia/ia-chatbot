import { createClient } from "@supabase/supabase-js";
import { openai, EMBEDDING_MODEL } from "./openai";

export interface MatchedDocument {
  id: string;
  content: string;
  url: string;
  title: string | null;
  similarity: number;
}

export async function getRelevantContext(query: string): Promise<MatchedDocument[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return [];
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: embedData } = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query,
  });
  const queryEmbedding = embedData[0].embedding;

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_threshold: 0.3,
    match_count: 5,
  });

  if (error) {
    console.error("RAG search error:", error);
    return [];
  }

  return (data ?? []) as MatchedDocument[];
}
