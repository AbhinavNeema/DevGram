from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer

model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    try:
        model = SentenceTransformer("paraphrase-MiniLM-L3-v2")
        print("Model loaded successfully")
    except Exception as e:
        print(f"Failed to load model: {e}")
        raise
    yield

app = FastAPI(lifespan=lifespan)

class EmbedRequest(BaseModel):
    text: str = Field(..., max_length=10000)

@app.get("/health")
def health():
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {"status": "ok"}

@app.post("/embed")
def embed(req: EmbedRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    try:
        embedding = model.encode(req.text).tolist()
        return {"embedding": embedding}
    except Exception:
        raise HTTPException(status_code=500, detail="Embedding generation failed")