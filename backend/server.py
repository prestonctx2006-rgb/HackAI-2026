from routes.auth import router as auth_router
from random import choice
import random
import string
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import httpx
import firebase_admin
from firebase_admin import credentials, firestore, db as realtime_db
from groq import Groq

# Load .env FIRST before anything else
load_dotenv()

# Groq
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': os.getenv("FIREBASE_DB_URL")
})
db = firestore.client()

# Create the app
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth
app.include_router(auth_router, prefix="/auth")

# ── Helper functions (defined BEFORE endpoints that use them) ──

def generate_game_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

async def get_random_city():
    cities = [doc.to_dict() for doc in db.collection("cities").stream()]
    if not cities:
        return None, None
    city = choice(cities)
    country_doc = db.collection("countries").document(city["country_id"]).get()
    country = country_doc.to_dict()
    return city, country

async def get_images(lat: float, lng: float):
    token = os.getenv("MAPILLARY_TOKEN")
    offset = 0.005
    params = {
        "access_token": token,
        "fields": "id,thumb_1024_url,captured_at",
        "bbox": f"{lng-offset},{lat-offset},{lng+offset},{lat+offset}",
        "limit": 5
    }
    async with httpx.AsyncClient() as client:
        response = await client.get("https://graph.mapillary.com/images", params=params)
    data = response.json().get("data", [])
    if not data:
        return {"error": "No images found for this location"}
    random_image = choice(data)
    return {"url": random_image["thumb_1024_url"]}

async def generate_fact(city_name: str, country_name: str, fake: bool):
    if fake:
        prompt = f"Give me one fake but believable fact about {city_name}, {country_name}. One sentence only. Do not mention it is fake. Do not mention the city name, country name, or any other place names. Write it as 'This city...' or 'This place...'"
    else:
        prompt = f"Give me one short interesting fact about {city_name}, {country_name}. One sentence only. Do not mention the city name, country name, or any other place names. Write it as 'This city...' or 'This place...'"

    response = await asyncio.to_thread(
        groq_client.chat.completions.create,
        model="llama-3.1-8b-instant",
        max_tokens=100,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()

# ── Basic endpoints ──────────────────────────────────────────

@app.get("/")
def home():
    return {"message": "HackAI backend running!"}

# ── Room Management (Realtime Database) ─────────────────────

@app.post("/create-room")
async def create_room():
    code = generate_game_code()
    room_ref = realtime_db.reference(f"/rooms/{code}")
    room_ref.set({
        "code": code,
        "playerCount": 1,
        "status": "waiting",
    })
    return {"code": code}

@app.post("/join-room/{code}")
async def join_room(code: str):
    room_ref = realtime_db.reference(f"/rooms/{code}")
    room = room_ref.get()

    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    player_count = room.get("playerCount", 0)
    if player_count >= 3:
        raise HTTPException(status_code=400, detail="Room is full")

    new_count = player_count + 1
    room_ref.update({"playerCount": new_count})

    if new_count == 3:
        room_ref.update({"status": "starting"})

    return {"code": code, "playerCount": new_count}

@app.post("/leave-room/{code}")
async def leave_room(code: str):
    room_ref = realtime_db.reference(f"/rooms/{code}")
    room = room_ref.get()

    if not room:
        return {"message": "Room already gone"}

    new_count = room.get("playerCount", 1) - 1

    if new_count <= 0:
        room_ref.delete()
        return {"message": "Room deleted"}

    room_ref.update({"playerCount": new_count})
    return {"message": "Left room", "playerCount": new_count}

@app.get("/room-status/{code}")
async def room_status(code: str):
    room_ref = realtime_db.reference(f"/rooms/{code}")
    room = room_ref.get()

    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    return room

# ── Game Management (Realtime Database) ─────────────────────

@app.get("/game/{code}")
def get_game(code: str):
    game_ref = realtime_db.reference(f"/games/{code.upper()}")
    game = game_ref.get()
    if not game:
        return {"error": "Game not found"}
    return game

@app.get("/images")
async def get_images_endpoint(lat: float, lng: float):
    return await get_images(lat, lng)

@app.post("/create-game")
async def create_game():
    while True:
        city, country = await get_random_city()
        if not city:
            continue

        fake_target = choice(["image", "flag", "fact"])
        image_is_fake = fake_target == "image"
        flag_is_fake = fake_target == "flag"
        fact_is_fake = fake_target == "fact"

        real_image = await get_images(city["lat"], city["lng"])

        if image_is_fake:
            other_city, _ = await get_random_city()
            fake_image = await get_images(other_city["lat"], other_city["lng"])
            final_image = fake_image.get("url") or real_image.get("url")
        else:
            final_image = real_image.get("url")

        if flag_is_fake:
            all_countries = [doc.to_dict() for doc in db.collection("countries").stream()]
            other_countries = [c for c in all_countries if c["id"] != country["id"]]
            fake_country = choice(other_countries)
            final_flag = fake_country["flag_colors"]
        else:
            final_flag = country["flag_colors"]

        final_fact = await generate_fact(city["name"], country["name"], fake=fact_is_fake)

        if not final_image or not final_flag or not final_fact:
            continue

        code = generate_game_code()

        # Store in Realtime Database instead of in-memory dict
        game_data = {
            "city": city["name"],
            "country": country["name"],
            "country_id": city["country_id"],
            "clues": {
                "image": final_image,
                "flag": final_flag,
                "fact": final_fact
            },
            "image_is_fake": image_is_fake,
            "flag_is_fake": flag_is_fake,
            "fact_is_fake": fact_is_fake,
        }
        realtime_db.reference(f"/games/{code}").set(game_data)

        return {"game_code": code}