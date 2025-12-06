import React from 'react';
import Layout from '@theme/Layout';
import Chatbot from '@site/src/components/Chatbot';
import Heading from '@theme/Heading';

function ChatbotPage(): JSX.Element {
  return (
    <Layout
      title="RAG Chatbot"
      description="Chat with your AI Textbook using RAG.">
      <main>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
          <Heading as="h1">RAG Chatbot</Heading>
          <p>Ask questions about the textbook content, or select text on any page to ask specific questions about it.</p>
          <Chatbot />
        </div>
      </main>
    </Layout>
  );
}

export default ChatbotPage;
