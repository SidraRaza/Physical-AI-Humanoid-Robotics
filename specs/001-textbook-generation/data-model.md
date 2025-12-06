# Data Model: AI-Native Textbook with RAG Chatbot

## Entities

### Chapter
Represents a main section of the textbook.
- **Attributes**:
  - `id` (string): Unique identifier for the chapter.
  - `title` (string): Title of the chapter.
  - `content` (string): Full markdown content of the chapter.
  - `order` (integer): Display order of the chapter in the textbook.

### Text Snippet
A segment of text from a chapter, optimized for RAG retrieval.
- **Attributes**:
  - `id` (string): Unique identifier for the text snippet.
  - `content` (string): The actual text segment.
  - `chapter_id` (string): Foreign key referencing the Chapter it belongs to.
  - `embeddings` (vector): Numerical representation of the text content for semantic search.
  - `source_line_start` (integer, optional): Starting line number in the original chapter content.
  - `source_line_end` (integer, optional): Ending line number in the original chapter content.

### User Query
Input from the user to the RAG chatbot.
- **Attributes**:
  - `id` (string): Unique identifier for the query.
  - `text` (string): The user's question.
  - `timestamp` (datetime): When the query was made.
  - `context_text` (string, optional): Text selected by the user to provide additional context.

### Chatbot Response
Output from the RAG chatbot in response to a user query.
- **Attributes**:
  - `id` (string): Unique identifier for the response.
  - `query_id` (string): Foreign key referencing the User Query it answers.
  - `response_text` (string): The chatbot's answer.
  - `source_snippets` (array of strings): IDs of Text Snippets used to generate the response.
  - `timestamp` (datetime): When the response was generated.
