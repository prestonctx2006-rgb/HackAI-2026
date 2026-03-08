# 1. Import FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# 2. Load your .env file so API keys are available
load_dotenv()

# 3. Create the app — this is the main FastAPI instance
app = FastAPI()

# 4. CORS — allows React Native to talk to this server
# Without this your phone will be blocked from calling the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Your first endpoint
# When React Native calls GET http://192.168.x.x:8080/
# it gets back {"message": "HackAI backend running!"}
@app.get("/")
def home():
    return {"message": "HackAI backend running!"}

# 6. Test endpoint — we'll replace this with real game logic later
# When React Native calls GET http://192.168.x.x:8080/test
# it gets back {"status": "working", "port": 8080}
@app.get("/test")
def test():
    return {"status": "working", "port": 8080}