import OpenAI from "openai";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing credentials. Please set the OPENAI_API_KEY environment variable.");
    }
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}

// Lazy getter - only initializes when first used (at runtime), not at build time
export const openai = new Proxy({} as OpenAI, {
  get(_, prop) {
    return getOpenAI()[prop as keyof OpenAI];
  },
});

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const CHAT_MODEL = "gpt-4o-mini";
