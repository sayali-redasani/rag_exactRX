"""
RAG (Retrieval-Augmented Generation) Pipeline Implementation
This module implements a RAG system using Flask, LangChain, and Pinecone for document processing
and question answering with multiple LLM models.
"""

import os
import time
from time import sleep
import threading
from bs4 import BeautifulSoup as Soup
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, Namespace
from langchain.prompts import PromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders.recursive_url_loader import RecursiveUrlLoader
from langchain_cohere import CohereEmbeddings, ChatCohere
from langchain_core.runnables import (
    RunnableLambda,
    RunnableParallel,
    RunnablePassthrough,
)
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers.string import StrOutputParser
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec

# Initialize Flask application with CORS and SocketIO
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

class QueryNamespace(Namespace):
    def on_connect(self):
        print("Client connected to /query namespace")
    def on_disconnect(self):
        print("Client disconnected from /query namespace") 

socketio.on_namespace(QueryNamespace("/cohere"))

# Initialize Pinecone client and configuration
# pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY')) 
pc = Pinecone(api_key="164f0b12-2fd0-4918-aadc-261844fc6a7c")
spec = ServerlessSpec(cloud='aws', region='us-east-1')
index_name = "jankrumsiek"
tool_answer = ""

# Model configuration parameters
top_k = 3
max_tokens = 500
temperature = 0.0

def get_models():
    """
    Initialize and return available language models.
    Returns:
        dict: Dictionary containing initialized model instances
    """
    return {
        "OpenAI": ChatOpenAI(
            model="gpt-3.5-turbo-0125",
            temperature=temperature,
            streaming=True,
            max_tokens=max_tokens,
        ),
        "OpenAI-GPT4": ChatOpenAI(
            model="gpt-4-turbo",    
            temperature=temperature,
            streaming=True,
            max_tokens=max_tokens,
        ),
        "Cohere": ChatCohere(
            model="command-r-plus",
            temperature=temperature,
            streaming=True,
            max_tokens=max_tokens
        )
    }

models = get_models()

def utf8len(s):
    """Calculate UTF-8 length of string"""
    return len(s.encode('utf-8'))

def get_pinecone_vectorstore(index_name):
    """
    Initialize Pinecone vector store with specified index
    Args:
        index_name (str): Name of the Pinecone index
    Returns:
        PineconeVectorStore: Initialized vector store instance
    """
    embd = CohereEmbeddings(model="embed-english-v2.0")
    vectorstore = PineconeVectorStore(
                    index_name=index_name,
                    embedding=embd
                    )
    return vectorstore

def data_loader(url, max_depth):
    """
    Load data from URL recursively
    Args:
        url (str): Base URL to start scraping
        max_depth (int): Maximum depth for recursive scraping
    Returns:
        list: List of loaded documents
    """
    loader = RecursiveUrlLoader(
                        url=url,
                        max_depth=max_depth,
                        extractor=lambda x: Soup(x, "html.parser").text
                )
    docs = loader.load()
    return docs

def process_docs(_docs, web_url, max_depth):
    """
    Process documents by splitting text and creating embeddings
    Args:
        _docs (list): List of documents to process
        web_url (str): Source URL of documents
        max_depth (int): Maximum depth for processing
    Returns:
        tuple: Processed chunks and metadata
    """
    print("process_docs")
    byte_max = 40960
    screened_docs = []
    discarded_docs = 0
    
    # Initialize text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=9000,
        chunk_overlap=200,  
        length_function=len
    )
    
    for i, doc in enumerate(_docs):
        doc_length = len(doc.page_content.encode('utf-8'))  
        if doc_length <= byte_max:
            screened_docs.append(doc.page_content)
            print(f"Short doc added: {doc.page_content[:100]}...") 
        else:
            chunks = text_splitter.split_text(doc.page_content)
            final_chunks = []
            for chunk in chunks:
                while len(chunk.encode('utf-8')) > byte_max:
                    chunk = chunk[:len(chunk)//2]
                final_chunks.append(chunk)
                
            screened_docs.extend(final_chunks)
            print(f"Long doc split into {len(final_chunks)} chunks.")
    
    discarded_docs = len(_docs) - len(screened_docs)
    return screened_docs, discarded_docs

def upsert_data_pinecone(vectorstore, chunks):
    """
    Upload document chunks to Pinecone vector store
    Args:
        vectorstore: Initialized Pinecone vector store
        chunks: Document chunks to upload
    """
    ids_list = []
    for chunk in chunks:
        # Ensure the metadata (text) fits within the Pinecone size limit
        if len(chunk.encode('utf-8')) <= 40960:
            ids_list.append(vectorstore.add_texts([chunk]))
        else:
            print("Chunk size exceeded Pinecone limit")
    if len(ids_list):
        print("Data stored successfully")
    else:
        print("Problem while upserting data")

@app.route('/link_scraper', methods=['POST'])
def link_scraper():
    """Extract and process links from web pages"""
    data = request.get_json()
    print(data)
    if data and 'link' in data:
        docs = data_loader(data['link'], int(data['maxDepth']))
        chunks, discarded_docs = process_docs(docs, data['link'], int(data['maxDepth']))
        vectorstore = get_pinecone_vectorstore(index_name)
        upsert_data_pinecone(vectorstore, chunks)
        return jsonify({"message": "success"})
    return jsonify({"error": "No link provided"}), 400

def get_pinecone_vectorstore(index_name):
    embd = CohereEmbeddings(model="embed-english-v2.0")
    vectorstore = PineconeVectorStore(
                    index_name=index_name,
                    embedding=embd
                    )
    return vectorstore

def format_docs(docs):
    """Format retrieved documents for LLM input"""
    # st.write(len(docs))
    return "\n\n".join(doc.page_content for doc in docs)

def create_chain(_retriever, selected_model):
    """
    Create a RAG chain with specified retriever and model
    Args:
        _retriever: Document retriever instance
        selected_model: Selected language model
    Returns:
        Chain: Configured RAG chain
    """
    model = models[selected_model]
    print("test")
    print(model)
    prompt = PromptTemplate.from_template(
        """You are an assistant for question-answering tasks. \
        Use the following pieces of retrieved context to answer the question. \
        If you don't know the answer, just say that you don't know. 
        \n\nQuestion: {question} \n\nContext: {context}
        """
        )
    rag_chain = (
        {"context": _retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | model
        | StrOutputParser()
    )
    return rag_chain

def stream_f(query, namespace, chain):
    """
    Stream responses from the RAG chain
    Args:
        query (str): User query
        namespace (str): Pinecone namespace
        chain: RAG chain instance
    """
    full_response = ""
    stream = chain.stream(query)
    for i in stream:
        full_response += i
        socketio.emit('response', {'text': i}, namespace='/cohere')
        print(i)
    sleep(5)
    socketio.emit('response', {'text': "stream ended"}, namespace='/cohere')
    # timestamp = dt.now().strftime("%Y-%m-%d %H:%M:%S")
    # data = [timestamp, query, full_response]  
    return full_response

@app.route("/cohere" , methods=['POST', 'GET'])
def cohere():
    """Handle Cohere model endpoint requests"""
    data = request.get_json()
    prompt = data.get('text')
    # filename = createCSV()
    retriever = get_pinecone_vectorstore(index_name).as_retriever(
        top_k=top_k
    )
    print(retriever)
    rag_chain_cohere = create_chain(retriever, "OpenAI")
    print("rag_chain_cohere")
    response =threading.Thread(target=stream_f, args=(prompt, '/cohere', rag_chain_cohere)).start()
    print(f"thread started: {response}")
    return "success"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)      