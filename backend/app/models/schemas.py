from pydantic import BaseModel
from typing import List, Optional

class DocumentRequest(BaseModel):
    url: str

class DocumentResponse(BaseModel):
    message: str
    document_id: str

class ChatRequest(BaseModel):
    question: str
    chat_history: Optional[List[dict]] = []

class Citation(BaseModel):
    source: str
    page_number: int
    text_snippet: str

class ChatResponse(BaseModel):
    answer: str
    citations: List[Citation]
