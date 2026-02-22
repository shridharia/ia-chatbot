let _openai: InstanceType<typeof import("openai").default> | null = null;

function getOpenAI() {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing credentials. Please set the OPENAI_API_KEY environment variable.");
    }
    // Dynamic require - OpenAI package only loads at request time, never at build
    const OpenAI = require("openai").default;
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}

// Lazy getter - only initializes when first used (at runtime), not at build time
export const openai = new Proxy({} as InstanceType<typeof import("openai").default>, {
  get(_, prop) {
    return getOpenAI()![prop as keyof ReturnType<typeof getOpenAI>];
  },
});

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const CHAT_MODEL = "gpt-4o-mini";
