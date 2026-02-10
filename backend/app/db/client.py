import chromadb
from app.core.config import settings

def get_chroma_client():
    return chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)

def get_collection(name: str = "legal_documents"):
    client = get_chroma_client()
    return client.get_or_create_collection(name=name)
