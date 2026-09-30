import os
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from .prompt import IBVAP_SYSTEM_PROMPT

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def api_chat(req: ChatRequest):
    load_dotenv() # Reload env in case it was just saved
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return JSONResponse(
            status_code=500, 
            content={"error": "Gemini API key not configured or sdk missing"}
        )
        
    try:
        from google import genai
        from google.genai import types
        gemini_client = genai.Client(api_key=api_key)
        
        response = gemini_client.models.generate_content(
            model='gemini-3.6-flash',
            contents=req.message,
            config=types.GenerateContentConfig(
                system_instruction=IBVAP_SYSTEM_PROMPT
            )
        )
        return {"reply": response.text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
