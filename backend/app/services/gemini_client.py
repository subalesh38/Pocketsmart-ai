import logging
import time
from google import genai
from google.genai import types
from google.genai.errors import APIError
from app.core.config import settings
from app.core.errors import AppError

logger = logging.getLogger(__name__)

def get_client() -> genai.Client:
    return genai.Client(
        api_key=settings.GOOGLE_API_KEY, 
        http_options={'timeout': 30000}
    )

def generate_json(prompt: str, image_bytes: bytes | None = None, mime: str | None = None) -> str:
    client = get_client()
    # Use a union-typed list so both str and Part are accepted
    parts: list[str | types.Part] = [prompt]
    
    if image_bytes:
        parts.append(types.Part.from_bytes(
            data=image_bytes, 
            mime_type=mime or "image/jpeg"
        ))
        
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=0.4,
    )
    
    max_retries = 1
    for attempt in range(max_retries + 1):
        try:
            resp = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=parts,  # type: ignore[arg-type]
                config=config,
            )
            if not resp.text:
                raise AppError(code="AI_UNAVAILABLE", message="AI returned empty response")
            return resp.text
        except APIError as e:
            if attempt < max_retries:
                time.sleep(1)
                continue
            logger.error("Gemini API Error after retry: %s", str(e))
            raise AppError(code="AI_UNAVAILABLE", message="AI service is currently unavailable", status_code=503)
        except AppError:
            raise
        except Exception as e:
            if attempt < max_retries:
                time.sleep(1)
                continue
            logger.error("Unexpected Gemini Error: %s", str(e))
            raise AppError(code="AI_UNAVAILABLE", message="AI service is currently unavailable", status_code=503)
    
    # Unreachable — all paths either return or raise — but satisfies the type checker
    raise AppError(code="AI_UNAVAILABLE", message="AI service is currently unavailable", status_code=503)
