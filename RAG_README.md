# RAG Pipeline Documentation

## Overview
This is a Retrieval-Augmented Generation (RAG) pipeline implementation using Flask, LangChain, and Pinecone. The system processes documents, creates embeddings, and provides an API endpoint for question answering using various LLM models.

## Features
- Document processing and embedding generation
- Vector storage using Pinecone
- Multiple LLM model support (OpenAI GPT-3.5, GPT-4, Cohere)
- Streaming responses
- Web scraping capabilities
- RESTful API endpoints

## Requirements
- Python 3.8+
- Flask
- LangChain
- Pinecone
- BeautifulSoup4
- OpenAI API key
- Pinecone API key
- Cohere API key (optional)

## Environment Variables
```bash
PINECONE_API_KEY=your_pinecone_key
OPENAI_API_KEY=your_openai_key
COHERE_API_KEY=your_cohere_key  # Optional
```

## Installation
1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage
1. Set up environment variables
2. Start the Flask server:
   ```bash
   python rag_pipeline.py
   ```
3. The server will run on `http://localhost:5000`

## API Endpoints
- `/cohere` - Process queries using the Cohere model
- Additional endpoints for document processing and querying

## Configuration
- Default index name: "jankrumsiek"
- Vector store: Pinecone (AWS us-east-1)
- Top k results: 3
- Max tokens: 500
- Temperature: 0.0

## Models
- OpenAI GPT-3.5 Turbo
- OpenAI GPT-4 Turbo
- Cohere Command-R Plus

## Architecture
1. Document Processing
   - URL scraping
   - Text splitting
   - Embedding generation
2. Vector Storage
   - Pinecone integration
   - Namespace management
3. Query Processing
   - Retrieval from vector store
   - LLM response generation
   - Streaming response handling

## Frontend Setup
1. Install dependencies:
   ```bash
   npm --force install
   ```
2. Start the React development server:
   ```bash
   npm start
   ```
The frontend will be available at `http://localhost:3000`

## Demo
A video demonstration of the application can be found in the `screenshots/demo.mp4` file, which shows the key features and functionality of the RAG pipeline in action.
