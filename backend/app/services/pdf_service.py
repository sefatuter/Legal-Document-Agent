import io
import requests
import pypdf
from fastapi import HTTPException

def extract_text_from_url(url: str) -> str:
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # Check if content type is PDF
        if 'application/pdf' not in response.headers.get('Content-Type', ''):
             # Some servers might not set header correctly, so we try to parse anyway if it looks like PDF
             pass

        with io.BytesIO(response.content) as f:
            reader = pypdf.PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            
            return text.strip()
            
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to download PDF: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")
