'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Chatbot Page - Modern chat UI with message bubbles, typing indicators, and smooth animations
 */
export default function ChatbotPage() {
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
            className="bg-slate-800 text-slate-100 rounded-xl p-4 my-3 overflow-x-auto text-sm font-mono"
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
                      className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-sm font-mono"
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col h-[calc(100vh-200px)]">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-white font-bold text-lg">AI</span>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Learning Assistant</h1>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      isConnected === true
                        ? 'bg-emerald-500'
                        : isConnected === false
                        ? 'bg-red-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  {isConnected === true
                    ? 'Connected to knowledge base'
                    : isConnected === false
                    ? 'Disconnected'
                    : 'Connecting...'}
                </div>
              </div>
            </div>
            <motion.button
              onClick={clearChat}
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear Chat
            </motion.button>
          </motion.div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-4 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center py-12"
              >
                <motion.div
                  className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mb-6"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-4xl">🤖</span>
                </motion.div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Hello, {session?.user?.name?.split(' ')[0] || 'there'}!
                </h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
                  I'm your AI learning assistant. Ask me anything about deep learning,
                  neural networks, or AI concepts from the textbook.
                </p>
                <div className="flex flex-wrap gap-3 justify-center max-w-lg">
                  {[
                    'What is deep learning?',
                    'Explain neural networks',
                    'How does backpropagation work?',
                  ].map((suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                      }}
                      className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`flex mb-6 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-md shadow-lg'
                        : msg.isError
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-bl-md'
                        : 'bg-slate-100 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-bl-md shadow-sm'
                    }`}
                  >
                    <div className="text-sm leading-relaxed">
                      {msg.type === 'user' ? msg.text : renderMessage(msg.text)}
                    </div>
                    <p
                      className={`text-xs mt-2 ${
                        msg.type === 'user'
                          ? 'text-indigo-100'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start mb-6"
              >
                <div className="bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full" />
                    <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full" />
                    <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full" />
                    <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about deep learning, AI, or textbook content..."
                disabled={loading}
                className="flex-1 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <motion.button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl disabled:opacity-50 flex items-center font-medium shadow-sm"
                whileHover={{ scale: loading || !input.trim() ? 1 : 1.02 }}
                whileTap={{ scale: loading || !input.trim() ? 1 : 0.98 }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin"></span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </span>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
