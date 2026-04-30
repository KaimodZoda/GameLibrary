import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from core.engine import GameSearchEngine

load_dotenv()

app = FastAPI(title="GameLLM Search Service")

# Initialize Search Engine
engine = GameSearchEngine()

class SearchQuery(BaseModel):
    query: str
    top_k: int = 5

class RecommendationRequest(BaseModel):
    user_preferences: str
    history: list[str] = []

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/search")
async def semantic_search(search: SearchQuery):
    try:
        results = await engine.search(search.query, search.top_k)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend")
async def get_recommendations(request: RecommendationRequest):
    try:
        recommendations = await engine.recommend(request.user_preferences, request.history)
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
