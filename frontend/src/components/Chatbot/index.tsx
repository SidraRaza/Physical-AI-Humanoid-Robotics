import React, { useState, useEffect, useCallback } from 'react';
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

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://sidraraza.github.io/Physical-AI-Humanoid-Robotics' // Replace with your actual GitHub Pages backend URL
  : 'http://localhost:8000';

function Chatbot(): JSX.Element {
  const [query, setQuery] = useState<string>('');
  const [messages, setMessages] = useState<Array<{type: 'user' | 'bot'; text: string; sources?: SourceDocument[]; selectedText?: string}>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setSelectedText(selection.toString());
    } else {
      setSelectedText(null);
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

    const userMessage = selectedText ? `(Selected text: "${selectedText}") ${query}` : query;
    setMessages(prev => [...prev, { type: 'user', text: userMessage, selectedText: selectedText || undefined }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.response, sources: data.source_documents }]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { type: 'bot', text: `Error: ${error.message}` }]);
    } finally {
      setLoading(false);
      setQuery('');
      setSelectedText(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className={styles.chatbotContainer}>
      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div key={index} className={clsx(styles.message, msg.type === 'user' ? styles.userMessage : styles.botMessage)}>
            <p>{msg.text}</p>
            {msg.sources && msg.sources.length > 0 && (
              <div className={styles.sources}>
                <strong>Sources:</strong>
                <ul>
                  {msg.sources.map((source, srcIndex) => (
                    <li key={srcIndex}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      {selectedText && (
        <div className={styles.selectedTextPreview}>
          Selected: "{selectedText}"
          <button onClick={() => setSelectedText(null)}>Clear Selection</button>
        </div>
      )}
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question or type something..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
