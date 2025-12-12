import React, { useState, useEffect, useCallback, useRef } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

interface SourceDocument {
  title: string;
  url: string;
  excerpt: string;
}

interface ChatResponse {
  response: string;
  source_documents: SourceDocument[];
}

interface Message {
  type: 'user' | 'bot';
  text: string;
  sources?: SourceDocument[];
  selectedText?: string;
  isError?: boolean;
}

// Configuration - customize based on your deployment
const getApiUrl = (): string => {
  // Check for runtime config first
  if (typeof window !== 'undefined' && (window as any).__API_URL__) {
    return (window as any).__API_URL__;
  }
  // Default to localhost for development
  return 'http://localhost:8000';
};

function Chatbot(): JSX.Element {
  const [query, setQuery] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check API connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        setIsConnected(response.ok);
      } catch {
        setIsConnected(false);
      }
    };
    checkConnection();
  }, []);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
    };
  }, [handleSelection]);

  const sendMessage = async () => {
    if (!query.trim() && !selectedText) return;

    const userMessage = selectedText
      ? `[Selected: "${selectedText.slice(0, 100)}${selectedText.length > 100 ? '...' : ''}"] ${query}`
      : query;

    setMessages(prev => [...prev, {
      type: 'user',
      text: userMessage,
      selectedText: selectedText || undefined
    }]);
    setLoading(true);

    try {
      const response = await fetch(`${getApiUrl()}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          selected_text: selectedText,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      setMessages(prev => [...prev, {
        type: 'bot',
        text: data.response,
        sources: data.source_documents
      }]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: error.message.includes('Failed to fetch')
          ? 'Unable to connect to the server. Please ensure the backend is running.'
          : `Error: ${error.message}`,
        isError: true
      }]);
    } finally {
      setLoading(false);
      setQuery('');
      setSelectedText(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSelectedText(null);
  };

  // Simple markdown-like rendering for bot messages
  const renderMessageText = (text: string) => {
    // Split by code blocks first
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3);
        const firstLine = code.split('\n')[0];
        const isLanguage = firstLine && !firstLine.includes(' ');
        const codeContent = isLanguage ? code.slice(firstLine.length + 1) : code;

        return (
          <pre key={index} className={styles.codeBlock}>
            <code>{codeContent.trim()}</code>
          </pre>
        );
      }

      // Handle inline formatting
      return (
        <span key={index}>
          {part.split('\n').map((line, lineIdx) => (
            <React.Fragment key={lineIdx}>
              {lineIdx > 0 && <br />}
              {line.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g).map((segment, segIdx) => {
                if (segment.startsWith('**') && segment.endsWith('**')) {
                  return <strong key={segIdx}>{segment.slice(2, -2)}</strong>;
                }
                if (segment.startsWith('*') && segment.endsWith('*')) {
                  return <em key={segIdx}>{segment.slice(1, -1)}</em>;
                }
                if (segment.startsWith('`') && segment.endsWith('`')) {
                  return <code key={segIdx} className={styles.inlineCode}>{segment.slice(1, -1)}</code>;
                }
                return segment;
              })}
            </React.Fragment>
          ))}
        </span>
      );
    });
  };

  return (
    <div className={styles.chatbotContainer}>
      {/* Header */}
      <div className={styles.chatHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>🤖</span>
          <span className={styles.headerTitle}>AI Assistant</span>
          <span className={clsx(styles.statusDot, isConnected === true && styles.connected, isConnected === false && styles.disconnected)} />
        </div>
        {messages.length > 0 && (
          <button className={styles.clearButton} onClick={clearChat} title="Clear chat">
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className={styles.messagesContainer}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
            <p className={styles.emptyTitle}>Start a conversation</p>
            <p className={styles.emptySubtitle}>
              Ask questions about deep learning, AI, or select text from the textbook to get explanations.
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={clsx(
              styles.message,
              msg.type === 'user' ? styles.userMessage : styles.botMessage,
              msg.isError && styles.errorMessage
            )}
          >
            <div className={styles.messageContent}>
              {msg.type === 'bot' ? renderMessageText(msg.text) : <p>{msg.text}</p>}
            </div>

            {msg.sources && msg.sources.length > 0 && (
              <div className={styles.sources}>
                <strong>📚 Sources:</strong>
                <ul>
                  {msg.sources.map((source, srcIndex) => (
                    <li key={srcIndex}>
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        {source.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className={clsx(styles.message, styles.botMessage)}>
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected text preview */}
      {selectedText && (
        <div className={styles.selectedTextPreview}>
          <span className={styles.selectedLabel}>📝 Selected:</span>
          <span className={styles.selectedContent}>
            "{selectedText.slice(0, 80)}{selectedText.length > 80 ? '...' : ''}"
          </span>
          <button onClick={() => setSelectedText(null)} className={styles.clearSelection}>
            ✕
          </button>
        </div>
      )}

      {/* Input */}
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={selectedText ? "Ask about the selected text..." : "Ask a question about deep learning..."}
          disabled={loading}
          className={styles.chatInput}
        />
        <button
          onClick={sendMessage}
          disabled={loading || (!query.trim() && !selectedText)}
          className={styles.sendButton}
        >
          {loading ? (
            <span className={styles.sendingIcon}>⏳</span>
          ) : (
            <span className={styles.sendIcon}>➤</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
