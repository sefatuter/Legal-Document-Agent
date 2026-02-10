from google import genai
from google.genai import types
from app.core.config import settings
from app.services.vector_db import query_similar_documents
from app.models.schemas import ChatResponse, Citation

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def _construct_prompt(query: str, context_text: str) -> str:
    return f"""
        You are an expert Legal AI Assistant specialized in statutory analysis.
        Your task is to answer the user's question by relying STRICTLY and EXCLUSIVELY on the provided Context.
        
        ### Language:
        - Use clear, formal, and precise legal context language.
        - Avoid interpretative or evaluative language unless the Context itself does so.

        ### Mandatory Rules (Violation is NOT allowed):
        1. Use ONLY the information explicitly stated in the Context.
        2. Do NOT rely on general legal knowledge, constitutional principles, case law, doctrine, or assumptions unless they are expressly mentioned in the Context.
        3. If any section below is NOT explicitly supported by the Context, you MUST write:
        "The provided document does not contain information on this point."
        4. Do NOT infer, summarize broadly, or generalize beyond the literal meaning of the text.
        5. Language Rule (Strict):
        The answer MUST be written in the same language as the Context.
        - If the Context is primarily in Turkish, the answer MUST be in Turkish.
        - If the Context is primarily in English, the answer MUST be in English.
        - Do NOT mix languages.

        Context:
        {context_text}

        Question:
        {query}

        Answer:
        """

def generate_answer(query: str) -> ChatResponse:
    # 1. Retrieve relevant documents
    context_chunks = query_similar_documents(query)
    context_text = "\n\n".join(context_chunks)
    
    # 2. Construct Prompt
    prompt = _construct_prompt(query, context_text)
    
    try:
        # 3. Call Gemini 2.5 Flash Lite
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        
        answer_text = response.text
        
        citations = []
        if context_chunks:
             citations.append(Citation(source="Document context", page_number=1, text_snippet=context_chunks[0][:50] + "..."))

        return ChatResponse(
            answer=answer_text,
            citations=citations
        )
        
    except Exception as e:
        return ChatResponse(
            answer=f"Error generating response: {str(e)}",
            citations=[]
        )

def generate_answer_stream(query: str):
    """
    Generator function to stream the answer chunk by chunk.
    Matching the 'Stream JSON Response' requirement from architecture diagram.
    """
    try:
        # 1. Retrieve relevant documents (Blocking operation)
        context_chunks = query_similar_documents(query)
        context_text = "\n\n".join(context_chunks)
        
        # 2. Construct Prompt
        prompt = _construct_prompt(query, context_text)

        # 3. Stream Response from Gemini
        response = client.models.generate_content_stream(
            model='gemini-2.5-flash',
            contents=prompt
        )
        
        for chunk in response:
            if chunk.text:
                # SSE Format: data: <content>\n\n
                yield chunk.text
                
    except Exception as e:
        yield f"Error generating response: {str(e)}"
