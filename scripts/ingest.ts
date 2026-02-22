/**
 * Ingestion script: Parse IA-website live URLs.csv and populate Supabase knowledge_base.
 * Run with: npm run ingest
 *
 * Requires: .env.local with OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";

const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 200;
const EMBEDDING_MODEL = "text-embedding-3-small";

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

function stripHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!supabaseUrl || !serviceKey || !openaiKey) {
    console.error(
      "Missing env vars. Ensure .env.local has: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY"
    );
    process.exit(1);
  }

  const csvPath = path.join(
    process.cwd(),
    "IA-website live URLs.txt"
  );
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const openai = new OpenAI({ apiKey: openaiKey });

  const raw = fs.readFileSync(csvPath, "utf-8");
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as { "Webflow Live Page URLs": string; Content: string }[];

  console.log(`Parsed ${records.length} rows from CSV.`);

  // Clear existing (optional - remove if you want to append)
  const { error: deleteErr } = await supabase.from("knowledge_base").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteErr) {
    console.warn("Could not clear existing rows:", deleteErr.message);
  } else {
    console.log("Cleared existing knowledge_base rows.");
  }

  let totalChunks = 0;
  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const url = row["Webflow Live Page URLs"]?.trim();
    const content = row["Content"]?.trim();
    if (!url || !content) continue;

    const cleanContent = stripHtmlEntities(content);
    const title = cleanContent.slice(0, 200).split("|")[0]?.trim() || url;
    const chunks = chunkText(cleanContent);

    for (const chunk of chunks) {
      let embedding: number[];
      try {
        const embed = await openai.embeddings.create({
          model: EMBEDDING_MODEL,
          input: chunk,
        });
        embedding = embed.data[0].embedding;
      } catch (embedErr) {
        console.error(`Embedding error for ${url}:`, embedErr);
        continue;
      }
      const { error: insertErr } = await supabase.from("knowledge_base").insert({
        url,
        content: chunk,
        title,
        embedding,
        metadata: { source: "csv" },
      });

      if (insertErr) {
        console.error(`Insert error for ${url}:`, insertErr.message);
      } else {
        totalChunks++;
      }
    }

    if ((i + 1) % 20 === 0) {
      console.log(`Processed ${i + 1}/${records.length} pages, ${totalChunks} chunks.`);
    }
  }

  console.log(`Done. Ingested ${totalChunks} chunks from ${records.length} pages.`);
}

main().catch(console.error);
