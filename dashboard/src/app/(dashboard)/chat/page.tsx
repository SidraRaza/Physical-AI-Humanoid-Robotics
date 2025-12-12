'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check API connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch(`${API_URL}/health`);
        setIsConnected(res.ok);
      } catch {
        setIsConnected(false);
      }
    };
    checkConnection();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage.text,
          selected_text: null,
        }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();

      const botMessage: Message = {
        id: crypto.randomUUID(),
        type: 'bot',
        text: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'bot',
        text: error.message.includes('Failed to fetch')
          ? 'Unable to connect to the server. Please ensure the backend is running.'
          : `Error: ${error.message}`,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Render message with basic markdown support
  const renderMessage = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3);
        const lines = code.split('\n');
        const lang = lines[0].match(/^\w+$/) ? lines[0] : '';
        const content = lang ? lines.slice(1).join('\n') : code;

        return (
          <pre
            key={i}
            className="bg-slate-800 text-slate-100 rounded-lg p-4 my-3 overflow-x-auto text-sm"
          >
            <code>{content.trim()}</code>
          </pre>
        );
      }

      return (
        <span key={i}>
          {part.split('\n').map((line, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {line.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g).map((seg, k) => {
                if (seg.startsWith('**') && seg.endsWith('**')) {
                  return <strong key={k}>{seg.slice(2, -2)}</strong>;
                }
                if (seg.startsWith('*') && seg.endsWith('*')) {
                  return <em key={k}>{seg.slice(1, -1)}</em>;
                }
                if (seg.startsWith('`') && seg.endsWith('`')) {
                  return (
                    <code
                      key={k}
                      className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-sm"
                    >
                      {seg.slice(1, -1)}
                    </code>
                  );
                }
                return seg;
              })}
            </span>
          ))}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] lg:h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h1 className="font-semibold text-slate-900 dark:text-white">
              AI Learning Assistant
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected === true
                    ? 'bg-emerald-500'
                    : isConnected === false
                    ? 'bg-red-500'
                    : 'bg-slate-400'
                }`}
              />
              {isConnected === true
                ? 'Connected'
                : isConnected === false
                ? 'Disconnected'
                : 'Checking...'}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="btn-ghost btn-sm text-slate-600 dark:text-slate-400"
          >
            Clear Chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-900">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-5xl mb-4">💬</span>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Hello, {session?.user?.name?.split(' ')[0] || 'there'}!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md">
              I'm your AI learning assistant. Ask me anything about deep learning,
              neural networks, or AI concepts from the textbook.
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {[
                'What is deep learning?',
                'Explain neural networks',
                'How does backpropagation work?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                  }}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-400 hover:border-primary-500 hover:text-primary-600 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.type === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : msg.isError
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-bl-md'
                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-md'
              }`}
            >
              <div className="text-sm leading-relaxed">
                {msg.type === 'user' ? msg.text : renderMessage(msg.text)}
              </div>
              <p
                className={`text-xs mt-2 ${
                  msg.type === 'user'
                    ? 'text-primary-200'
                    : 'text-slate-400'
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about deep learning..."
            disabled={loading}
            className="input flex-1"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="btn-primary btn-md px-6"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
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
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
