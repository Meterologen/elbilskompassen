"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";


const transport = new DefaultChatTransport({ api: "/api/chat" });

function Markdown({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (match) {
          return (
            <Link key={i} href={match[2]} className="font-medium text-sky-600 underline hover:text-sky-500">
              {match[1]}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function HomeChat() {
  const { messages, sendMessage, status } = useChat({ transport });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    sendMessage({ text: text.trim() });
    setInput("");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const hasMessages = messages.length > 0;

  return (
    <section className="flex min-h-[75vh] flex-col items-center justify-center px-4 py-16 sm:py-24">
      <div className="w-full max-w-2xl space-y-6 text-center">
        {!hasMessages && (
          <>
            <p className="text-sm font-medium uppercase tracking-widest text-sky-300">
              Elbilskompassen
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Nyfiken på elbil?
              <br />
              <span className="bg-gradient-to-r from-emerald-300 to-sky-400 bg-clip-text text-transparent">
                Börja här.
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-slate-200">
              Räkna på kostnaden, hitta rätt modell och se om bytet är värt det — för just dig.
            </p>
          </>
        )}

        {!hasMessages && (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/kompassen"
              className="rounded-full bg-emerald-500 px-10 py-5 text-xl font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 hover:shadow-xl"
            >
              Starta Elbilskompassen
            </Link>
            <Link
              href="/kalkyl"
              className="rounded-full border-2 border-sky-300/80 bg-white/10 px-10 py-5 text-xl font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Räkna på ekonomin
            </Link>
          </div>
        )}

        {!hasMessages && (
          <p className="text-sm text-slate-400">
            2 minuter. Inga registreringar. Helt gratis.
          </p>
        )}

        {hasMessages && (
          <div className="mx-auto w-full max-w-2xl text-left">
            <div ref={scrollRef} className="max-h-[50vh] space-y-4 overflow-y-auto rounded-2xl border border-sky-300/30 bg-white/5 p-4 backdrop-blur-sm sm:p-6">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-sky-600 text-white"
                        : "border border-sky-300/30 bg-white/90 text-slate-800"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <Markdown text={m.parts?.filter(p => p.type === "text").map(p => p.text).join("") ?? ""} />
                    ) : (
                      m.parts?.filter(p => p.type === "text").map(p => p.text).join("") ?? ""
                    )}
                  </div>
                </div>
              ))}
              {busy && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-sky-300/30 bg-white/90 px-4 py-3">
                    <span className="inline-flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-sky-400 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-sky-400 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-sky-400 [animation-delay:300ms]" />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="mx-auto w-full max-w-2xl">
          <div className="relative">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ställ din fråga här..."
              className="w-full rounded-full border-2 border-sky-300/50 bg-white/95 px-6 py-4 pr-14 text-base text-slate-900 shadow-lg shadow-sky-500/10 backdrop-blur-sm placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-400/20"
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md transition hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500"
              aria-label="Skicka"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95l14.095-5.635a.75.75 0 0 0 0-1.392L3.105 2.288Z" />
              </svg>
            </button>
          </div>
        </form>

        {hasMessages && (
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {["Berätta mer", "Vilka modeller rekommenderar du?", "Hur räknar jag på det?"].map(
              (s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  disabled={busy}
                  className="rounded-full border border-sky-300/40 bg-white/10 px-3 py-1.5 text-xs text-slate-200 backdrop-blur-sm transition hover:border-sky-300/70 hover:bg-white/20 disabled:opacity-40"
                >
                  {s}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}
