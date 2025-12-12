import React from 'react';
import Layout from '@theme/Layout';
import Chatbot from '@site/src/components/Chatbot';
import Heading from '@theme/Heading';

const pageStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 1.5rem 3rem',
    maxWidth: '100%',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
    maxWidth: '600px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    letterSpacing: '-0.03em',
    marginBottom: '0.75rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--ifm-color-emphasis-700)',
    lineHeight: 1.6,
    margin: 0,
  },
  chatWrapper: {
    width: '100%',
    maxWidth: '800px',
  },
};

function ChatbotPage(): JSX.Element {
  return (
    <Layout
      title="AI Chatbot"
      description="Chat with your AI Textbook using RAG. Ask questions about deep learning concepts.">
      <main>
        <div style={pageStyles.container}>
          <div style={pageStyles.header}>
            <Heading as="h1" style={pageStyles.title}>AI Learning Assistant</Heading>
            <p style={pageStyles.subtitle}>
              Ask questions about the textbook content and get instant, contextual answers.
              You can also select text on any page to ask specific questions about it.
            </p>
          </div>
          <div style={pageStyles.chatWrapper}>
            <Chatbot />
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default ChatbotPage;
