"""
Ultra-simple FastAPI app for Render deployment
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Novora MVP API",
    description="Simple MVP API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Novora MVP API is running!"}

@app.get("/health")
async def health():
    return {"status": "healthy", "message": "API is working"}

@app.get("/api/v1/health")
async def api_health():
    return {"status": "healthy", "api_version": "v1"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
