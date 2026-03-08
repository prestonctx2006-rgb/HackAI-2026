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
import datetime
import firebase_admin
from firebase_admin import credentials, firestore, db as realtime_db
from groq import Groq
from pydantic import BaseModel
from typing import Optional
import math

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

# ── Helper functions ──────────────────────────────────────────

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

async def build_game_data():
    """Generate game clues, retrying if any clue is missing."""
    while True:
        city, country = await get_random_city()
        if not city or not country:
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

        return {
            "city": city["name"],
            "lat": city["lat"],
            "lng": city["lng"],
            "country": country["name"],
            "country_id": city["country_id"],
            "timer_end": (datetime.datetime.utcnow() + datetime.timedelta(seconds=40)).isoformat() + "Z",
            "clues": {
                "image": final_image,
                "flag": final_flag,
                "fact": final_fact
            },
            "image_is_fake": image_is_fake,
            "flag_is_fake": flag_is_fake,
            "fact_is_fake": fact_is_fake,
        }

# ── Basic ─────────────────────────────────────────────────────

@app.get("/")
def home():
    return {"message": "HackAI backend running!"}

@app.get("/images")
async def get_images_endpoint(lat: float, lng: float):
    return await get_images(lat, lng)

# ── Room + Game (same code) ───────────────────────────────────

@app.post("/create-room")
async def create_room():
    code = generate_game_code()

    # Build game data and store in Realtime DB under same code
    game_data = await build_game_data()
    realtime_db.reference(f"/games/{code}").set(game_data)

    # Create room in Realtime DB under same code
    realtime_db.reference(f"/rooms/{code}").set({
        "code": code,
        "playerCount": 1,
        "status": "waiting",
    })

    return {"code": code, "role": "image"}

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
    roles = {1: "image", 2: "flag", 3: "fact"}
    role = roles[new_count]

    room_ref.update({"playerCount": new_count})

    if new_count == 3:
        room_ref.update({"status": "starting"})

    return {"code": code, "playerCount": new_count, "role": role}

@app.post("/leave-room/{code}")
async def leave_room(code: str):
    room_ref = realtime_db.reference(f"/rooms/{code}")
    room = room_ref.get()

    if not room:
        return {"message": "Room already gone"}

    new_count = room.get("playerCount", 1) - 1

    if new_count <= 0:
        room_ref.delete()
        realtime_db.reference(f"/games/{code}").delete()
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

# ── Game ──────────────────────────────────────────────────────

@app.get("/game/{code}")
def get_game(code: str):
    game_ref = realtime_db.reference(f"/games/{code.upper()}")
    game = game_ref.get()
    if not game:
        return {"error": "Game not found"}
    return game


class SubmitPinRequest(BaseModel):
    uid: str
    lat: Optional[float] = None
    lng: Optional[float] = None

def haversine(lat1, lng1, lat2, lng2) -> float:
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def distance_to_points(distance_km: float) -> int:
    if distance_km <= 100: return 1000
    elif distance_km <= 500: return 800
    elif distance_km <= 1000: return 600
    elif distance_km <= 2000: return 400
    elif distance_km <= 5000: return 200
    else: return 100

@app.post("/game/{code}/submit")
async def submit_pin(code: str, body: SubmitPinRequest):
    game_ref = realtime_db.reference(f"/games/{code.upper()}")
    game = game_ref.get()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    real_lat = game.get("lat")
    real_lng = game.get("lng")

    if body.lat is None or body.lng is None:
        points = 0
        distance_km = None
    else:
        distance_km = haversine(body.lat, body.lng, real_lat, real_lng)
        points = distance_to_points(distance_km)
    
    # 1. Fetch the username first (assuming users are stored in /users/{uid})
    user_ref = realtime_db.reference(f"/users/{body.uid}").get()
    username = user_ref.get("username", "Anonymous") if user_ref else "Anonymous"

    # Store in Realtime DB under submissions
    realtime_db.reference(f"/games/{code.upper()}/submissions/{body.uid}").set({
        "uid": body.uid,
        "username": username,
        "lat": body.lat,
        "lng": body.lng,
        "distance_km": distance_km,
        "points": points,
        "submitted_at": datetime.datetime.utcnow().isoformat(),
    })

    return {"points": points, "distance_km": distance_km}

@app.get("/game/{code}/results")
async def get_results(code: str):
    game_ref = realtime_db.reference(f"/games/{code.upper()}")
    game = game_ref.get()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    submissions_data = game.get("submissions", {})
    submissions = list(submissions_data.values()) if submissions_data else []

    valid = [s for s in submissions if s.get("distance_km") is not None]
    winner_uid = min(valid, key=lambda s: s["distance_km"])["uid"] if valid else None

    # Update stats in Firestore for each player
    for submission in submissions:
        uid = submission["uid"]
        distance_km = submission.get("distance_km")
        points = submission.get("points", 0)
        is_winner = uid == winner_uid

        try:
            user_ref = db.collection("accounts").document(uid)
            user_data = user_ref.get().to_dict()
            stats = user_data.get("stats", {})

            games_played = stats.get("games_played", 0) + 1
            total_points = stats.get("total_points", 0) + max(points, 0)
            total_distance = stats.get("total_distance_km", 0) + (distance_km or 0)
            wins = stats.get("wins", 0) + (1 if is_winner else 0)
            current_streak = (stats.get("current_streak", 0) + 1) if is_winner else 0
            best_guess = stats.get("best_guess_km")
            if distance_km is not None:
                best_guess = distance_km if best_guess is None else min(best_guess, distance_km)

            user_ref.update({
                "stats.games_played": games_played,
                "stats.total_points": total_points,
                "stats.total_distance_km": total_distance,
                "stats.avg_accuracy_km": total_distance / games_played,
                "stats.wins": wins,
                "stats.current_streak": current_streak,
                "stats.best_guess_km": best_guess,
            })
        except Exception as e:
            print(f"Failed to update stats for {uid}: {e}")

    return {
        "city": game.get("city"),
        "country": game.get("country"),
        "real_lat": game.get("lat"),
        "real_lng": game.get("lng"),
        "image_is_fake": game.get("image_is_fake"),
        "flag_is_fake": game.get("flag_is_fake"),
        "fact_is_fake": game.get("fact_is_fake"),
        "submissions": submissions,
        "winner_uid": winner_uid,
    }