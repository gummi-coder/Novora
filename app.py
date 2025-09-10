"""
Ultra-simple FastAPI app for Render deployment
"""
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Novora MVP API is running!"}

@app.get("/health")
def health():
    return {"status": "healthy", "message": "API is working"}

@app.get("/api/v1/health")
def api_health():
    return {"status": "healthy", "api_version": "v1"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
