import chromadb
from app.db.client import get_collection
from typing import List
from app.core.config import settings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Initialize Google Embeddings
embeddings_model = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=settings.GEMINI_API_KEY
)

def split_text(text: str, chunk_size: int = 2000, overlap: int = 500) -> List[str]:
    """
    Split text into chunks using LangChain's RecursiveCharacterTextSplitter
    to respect semantic boundaries.
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=["\n\n", "\n", ".", " ", ""],
        length_function=len,
    )
    return text_splitter.split_text(text)

import time

def store_document_embeddings(text: str, source_id: str):
    collection = get_collection()
    chunks = split_text(text)
    
    if not chunks:
        return

    # Batch process embeddings to avoid Rate Limit (429)
    # Conservative limits: Batch=5, Base Sleep=10s
    batch_size = 5
    print(f"DEBUG: Processing {len(chunks)} chunks in batches of {batch_size}...")
    
    for i in range(0, len(chunks), batch_size):
        batch_chunks = chunks[i:i + batch_size]
        print(f"DEBUG: Embedding batch {i//batch_size + 1}/{(len(chunks)-1)//batch_size + 1}...")

        # Retry logic for 429 errors
        max_retries = 5
        base_delay = 10
        
        for attempt in range(max_retries):
            try:
                batch_embeddings = embeddings_model.embed_documents(batch_chunks)
                
                # Prepare IDs and Metadatas for this batch
                batch_ids = [f"{source_id}_{j}" for j in range(i, i + len(batch_chunks))]
                batch_metadatas = [{"source": source_id, "chunk_index": j} for j in range(i, i + len(batch_chunks))]
                
                # Add to ChromaDB
                collection.add(
                    documents=batch_chunks,
                    embeddings=batch_embeddings,
                    ids=batch_ids,
                    metadatas=batch_metadatas
                )
                
                # Success - break retry loop
                break
                
            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    wait_time = base_delay * (2 ** attempt) # Exponential backoff: 10, 20, 40, 80...
                    print(f"WARN: Rate limit hit. Waiting {wait_time}s before retry (Attempt {attempt+1}/{max_retries})")
                    time.sleep(wait_time)
                else:
                    print(f"ERROR: Failed to embed batch {i}: {e}")
                    raise e
        else:
            # If we exhausted retries
            raise Exception("Max retries exceeded for embedding. API Quota exhausted.")
        
        # Standard sleep between successful batches to be nice to the API
        time.sleep(5)

def query_similar_documents(query: str, n_results: int = 5) -> List[str]: # Increased n_results for better context
    collection = get_collection()
    
    # Must use the same embedding model for the query
    query_embedding = embeddings_model.embed_query(query)
    
    results = collection.query(
        query_embeddings=[query_embedding], # PASS THE COMPUTED EMBEDDING
        n_results=n_results
    )
    
    if results and results['documents']:
        return results['documents'][0]
    return []
