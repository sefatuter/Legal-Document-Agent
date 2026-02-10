from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.models.schemas import DocumentRequest, DocumentResponse, ChatRequest, ChatResponse
from app.services.pdf_service import extract_text_from_url
from app.services.vector_db import store_document_embeddings
from app.services.rag_service import generate_answer, generate_answer_stream
import uuid
import json

router = APIRouter()

@router.post("/create-knowledge-base", response_model=DocumentResponse)
async def create_knowledge_base(request: DocumentRequest):
    try:
        # 1. Extract Text
        text = extract_text_from_url(request.url)
        
        # 2. Store Embeddings
        doc_id = str(uuid.uuid4())
        store_document_embeddings(text, source_id=doc_id)
        
        return DocumentResponse(
            message="Document processed and embedded successfully",
            document_id=doc_id
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/run-agent")
async def run_agent(request: ChatRequest):
    try:
        # Use StreamingResponse for real-time tokens
        return StreamingResponse(
            generate_answer_stream(request.question),
            media_type="text/plain"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
