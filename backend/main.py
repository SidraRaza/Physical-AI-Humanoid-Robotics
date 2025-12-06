# C:/Users/ahed8/my-ai-textbook/backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Retrieve allowed origins from environment variable, split by comma
# Default to http://localhost:3000 for local development if FRONTEND_URL is not set
allowed_origins_str = os.getenv("FRONTEND_URL", "http://localhost:3000")
origins = [origin.strip() for origin in allowed_origins_str.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI backend!"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Backend is healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
