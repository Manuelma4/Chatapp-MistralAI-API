'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '@/lib/mistral';

type UiMessage = ChatMessage & { id: string; ts: number };

const defaultSystem = 'You are a concise, helpful assistant.';

export default function Chat() {
  const [messages, setMessages] = useState<UiMessage[]>([
    { role: 'system', content: defaultSystem, id: crypto.randomUUID(), ts: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('open-mistral-7b'); 
  const [temperature, setTemperature] = useState(0.3);
  const [loading, setLoading] = useState(false);
  const [mock, setMock] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const nonSystem = messages.filter(m => m.role !== 'system');

  // --- UX helpers ---
  const scrollToEnd = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToEnd, [loading, nonSystem.length]);

  const autoResize = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = Math.min(180, el.scrollHeight) + 'px';
  };

  const reset = () => {
    setMessages([{ role: 'system', content: defaultSystem, id: crypto.randomUUID(), ts: Date.now() }]);
    setInput('');
    taRef.current?.focus();
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    const next = [
      ...messages,
      { role: 'user' as const, content: text, id: crypto.randomUUID(), ts: Date.now() },
    ];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(({ role, content }) => ({ role, content })), 
          model,
          temperature,
          mock,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');

      const assistant = data?.choices?.[0]?.message?.content ?? 'No content';
      setMessages(m => [
        ...m,
        { role: 'assistant', content: assistant, id: crypto.randomUUID(), ts: Date.now() },
      ]);
    } catch (e: any) {
      setMessages(m => [
        ...m,
        { role: 'assistant', content: `Error: ${e?.message}`, id: crypto.randomUUID(), ts: Date.now() },
      ]);
    } finally {
      setLoading(false);
      taRef.current?.focus();
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="rounded-2xl p-5 mb-6 bg-white border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <h1 className="text-3xl font-semibold tracking-tight">Mistral Next Chat</h1>
        <p className="text-sm text-gray-500 mt-1">Minimal chat using Mistral chat completions.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm flex flex-col gap-1">
            <span className="text-gray-600">Model</span>
            <select
              className="border rounded-xl px-3 py-2 bg-white"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="mistral-large-latest">mistral-large-latest</option>
              <option value="open-mistral-7b">open-mistral-7b</option>
              <option value="codestral-latest">codestral-latest</option>
            </select>
          </label>

          <label className="text-sm flex flex-col gap-1">
            <span className="text-gray-600">Temperature: {temperature.toFixed(2)}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
            />
          </label>

          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={mock}
              onChange={(e) => setMock(e.target.checked)}
            />
            <span className="text-gray-700">Mock API</span>
          </label>
        </div>

        <div className="mt-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
            title="Reset conversation"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white h-[62vh] shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex flex-col">
        <div className="sticky top-0 z-10 px-4 py-2 border-b border-gray-200 bg-white/80 backdrop-blur rounded-t-2xl">
          <span className="text-sm text-gray-500">
            {nonSystem.length === 0 ? 'Start the conversation below…' : 'Conversation'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-3 pb-2">
          {nonSystem.length === 0 && (
            <div className="text-gray-400 text-sm"></div>
          )}

          {nonSystem.map((m) => {
            const isUser = m.role === 'user';
            const time = new Date(m.ts).toLocaleTimeString();
            return (
              <div key={m.id} className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                {/* avatar */}
                {!isUser && (
                  <div className="mr-2 mt-1 h-8 w-8 shrink-0 rounded-full bg-emerald-600 text-white grid place-items-center text-xs font-semibold">
                    A
                  </div>
                )}
                <div
                  className={[
                    'max-w-[78%] rounded-2xl border leading-relaxed shadow-sm px-3 py-2',
                    isUser ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200',
                  ].join(' ')}
                >
                  <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                    {m.role} · {time}
                  </div>
                  <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                    <ReactMarkdown
                    components={{
                        strong: (props) => <strong className="font-semibold" {...props} />,
                        em: (props) => <em className="italic" {...props} />,
                        code: ({ children, ...p }: any) => {
                    const text = String(children ?? '');
                    const isInline = !/\n/.test(text);
                    return isInline ? (
                        <code className="rounded bg-gray-100 px-1 py-0.5 text-[0.9em]" {...p}>{children}</code>
                    ) : (
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-900 text-gray-100 p-3 text-sm">
                    <code {...p}>{children}</code>
                    </pre>
                    );
                    },
                        a: (props) => <a className="text-blue-600 underline" target="_blank" rel="noreferrer" {...props} />,
                        ul: (props) => <ul className="list-disc pl-5 my-2" {...props} />,
                        ol: (props) => <ol className="list-decimal pl-5 my-2" {...props} />,
                        li: (props) => <li className="my-0.5" {...props} />,
                        p:  (props) => <p className="my-1.5" {...props} />,
                    }}
                    >
                    {m.content}
                    </ReactMarkdown>
                </div>
                </div>
                {isUser && (
                  <div className="ml-2 mt-1 h-8 w-8 shrink-0 rounded-full bg-blue-600 text-white grid place-items-center text-xs font-semibold">
                    U
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="mt-2 text-sm text-gray-500 flex items-center gap-1">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse [animation-delay:120ms]">●</span>
              <span className="animate-pulse [animation-delay:240ms]">●</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-gray-200 p-3 rounded-b-2xl">
          <div className="flex items-end gap-2">
            <textarea
              ref={taRef}
              rows={1}
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize(); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              className="flex-1 resize-none border rounded-2xl p-3 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Type a message… (Shift+Enter for newline)"
            />
            <button
              onClick={send}
              disabled={loading}
              className="px-5 py-3 rounded-2xl bg-black text-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium">System prompt</summary>
        <textarea
          className="mt-2 w-full border rounded-2xl p-3 h-24 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
          value={messages[0]?.content}
          onChange={(e) =>
            setMessages([{ role: 'system', content: e.target.value, id: crypto.randomUUID(), ts: Date.now() }, ...messages.slice(1)])
          }
        />
      </details>
    </div>
  );
}
