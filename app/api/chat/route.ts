import { NextRequest, NextResponse } from "next/server";
import { openai, CHAT_MODEL } from "@/lib/openai";
import { getRelevantContext } from "@/lib/rag";

const SYSTEM_PROMPT = `You are the IA Digital Agent for Impact Analytics (impactanalytics.ai). You help visitors learn about Impact Analytics's solutions, products, services, and company.

Guidelines:
- Answer questions using the provided context from the Impact Analytics website when available.
- When the context includes relevant information, cite it and include the source URL.
- Format your responses in clear, readable markdown (bold for emphasis, bullet points for lists).
- If you don't have enough context, respond based on general knowledge about Impact Analytics as an AI-native retail/CPG analytics company.
- Keep responses concise but informative.
- When citing sources, format them as: [Source: URL] or include a "Sources" section with clickable links.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: { role: string; content: string }[] };
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const userQuery = lastMessage.content;
    const docs = await getRelevantContext(userQuery);

    const contextBlock =
      docs.length > 0
        ? `\n\nRelevant context from Impact Analytics website:\n${docs
            .map(
              (d) =>
                `- ${d.content}\n  Source: ${d.url}`
            )
            .join("\n\n")}\n\nWhen using this context, include the source URLs in your response where relevant.`
        : "\n\nNo specific context found. Answer based on general knowledge about Impact Analytics (Agentic AI for retail, merchandising, pricing, inventory, etc.).";

    const enrichedSystem = SYSTEM_PROMPT + contextBlock;

    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: "system", content: enrichedSystem },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content ?? "I couldn't generate a response.";
    const sources = docs.map((d) => ({ url: d.url, title: d.title || d.url }));

    return NextResponse.json({ content, sources });
  } catch (err) {
    console.error("Chat API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: message, content: null },
      { status: 500 }
    );
  }
}
