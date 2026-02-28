from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import os

app = FastAPI()

print("🚀 Loading MiniLM model...")
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
print("✅ Model loaded.")

class EmbedRequest(BaseModel):
    text: str


@app.get("/")
def root():
    return {"message": "Embedding service running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/embed")
async def embed(req: EmbedRequest):
    try:
        embedding = model.encode(
            req.text,
            normalize_embeddings=True
        )
        return {
            "embedding": embedding.tolist()
        }
    except Exception as e:
        return {"error": str(e)}