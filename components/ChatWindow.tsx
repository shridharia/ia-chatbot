"use client";

import { useState, useRef, useEffect } from "react";
import { SourcesSection } from "./SourcesSection";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { url: string; title: string | null }[];
}

const GREETING =
  "Hi there! I'm your IA Digital Agent – here to help you know more about Impact Analytics. How can I assist you today?";

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: GREETING,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError(null);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data: { content?: string; sources?: { url: string; title: string | null }[]; error?: string };
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid response from server. Please try again.");
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content ?? "I couldn't generate a response.",
        sources: data.sources,
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Request timed out. The AI may be busy. Please try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    send();
    return false;
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-200 bg-[#2563eb] px-4 py-3 dark:border-zinc-700">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
          IA
        </div>
        <div className="flex-1">
          <div className="font-semibold text-white">IA Digital Agent</div>
          <div className="flex items-center gap-1.5 text-xs text-white/90">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            Online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2563eb]/10 text-xs font-bold text-[#2563eb]">
                IA
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.role === "user"
                  ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-600 dark:text-zinc-100"
                  : "bg-[#2563eb]/10 text-zinc-800 dark:bg-[#2563eb]/20 dark:text-zinc-100"
              }`}
            >
              <div className="whitespace-pre-wrap text-sm [&>strong]:font-semibold">
                {msg.content}
              </div>
              {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                <SourcesSection sources={msg.sources} />
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2563eb]/10 text-xs font-bold text-[#2563eb]">
              IA
            </div>
            <div className="rounded-2xl bg-[#2563eb]/10 px-4 py-2.5">
              <span className="animate-pulse text-sm text-zinc-600">Thinking...</span>
              <p className="mt-1 text-xs text-zinc-500">
                First response may take 15–30 seconds
              </p>
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about Impact Analytics"
            autoComplete="off"
            disabled={loading}
            className="flex-1 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f97316] text-white transition hover:bg-[#ea580c] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Send"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
        <a
          href="https://www.impactanalytics.ai/contact-us"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs text-[#f97316] hover:underline"
        >
          Talk to an Expert →
        </a>
      </div>
    </div>
  );
}
