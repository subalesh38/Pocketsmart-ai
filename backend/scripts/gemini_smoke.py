import os
import sys

# Ensure backend root is in PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.gemini_client import generate_json
from app.core.config import settings

def main():
    print("Settings check:")
    print(f"API Key: {'SET' if settings.GOOGLE_API_KEY else 'UNSET'}")
    print(f"Model: {settings.GEMINI_MODEL}")
    
    if not settings.GOOGLE_API_KEY or settings.GOOGLE_API_KEY == "test":
        print("Please set a real GOOGLE_API_KEY in backend/.env before running this script.")
        return

    print("\n--- 1. Plain Text Call ---")
    try:
        # Note: the prompt asks for JSON because the client forces JSON mode
        res = generate_json("Return a JSON object with one key 'hello' and value 'world'.")
        print("Result:", res)
    except Exception as e:
        print("Failed:", e)

    print("\n--- 2. JSON Mode Call ---")
    try:
        import json
        res = generate_json("Generate a JSON list of 3 colors. Format: [\"red\", ...]")
        parsed = json.loads(res)
        print("Parsed JSON:", parsed)
    except Exception as e:
        print("Failed:", e)

    print("\n--- 3. Image + Text Call ---")
    try:
        from PIL import Image
        import io
        img = Image.new('RGB', (100, 100), color = 'red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        
        res = generate_json("What color is this image? Return a JSON object with key 'color'.", image_bytes=img_bytes.getvalue(), mime="image/jpeg")
        print("Result:", res)
    except Exception as e:
        print("Failed:", e)

if __name__ == "__main__":
    main()
