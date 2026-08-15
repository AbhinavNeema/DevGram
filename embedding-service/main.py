from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import os
import time

app = FastAPI()

# Load model at startup
print("🚀 Loading MiniLM model...")
start = time.time()
model = SentenceTransformer("sentence-transformers/paraphrase-MiniLM-L3-v2")
print(f"✅ Model loaded in {time.time() - start:.2f}s")

class EmbedRequest(BaseModel):
    text: str


@app.get("/")
def root():
    return {"message": "Embedding service running", "model": "MiniLM-L3-v2"}


@app.get("/health")
def health():
    return {"status": "ok", "model": "loaded"}


@app.post("/embed")
async def embed(req: EmbedRequest):
    try:
        if not req.text or len(req.text.strip()) == 0:
            return {"embedding": []}

        # Limit text length to prevent timeout
        text = req.text[:5000]

        embedding = model.encode(
            text,
            normalize_embeddings=True,
            show_progress_bar=False
        )

        return {
            "embedding": embedding.tolist(),
            "model": "MiniLM-L3-v2"
        }
    except Exception as e:
        print(f"Embedding error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))