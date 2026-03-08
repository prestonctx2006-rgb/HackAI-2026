from random import choice
import random
import string

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import httpx
import firebase_admin
from firebase_admin import credentials, firestore
import google.generativeai as genai

# Load .env FIRST before anything else
load_dotenv()

# Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# In memory game storage
games = {}

# Create the app
app = FastAPI()

# 4. CORS — allows React Native to talk to this server
# Without this your phone will be blocked from calling the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# When React Native calls GET http://192.168.x.x:8080/
# it gets back {"message": "HackAI backend running!"}
@app.get("/")
def home():
    return {"message": "HackAI backend running!"}

#One of the options
@app.get("/images")
async def get_images(lat: float, lng: float):
    token = os.getenv("MAPILLARY_TOKEN")
    
    offset = 0.005  # roughly a few blocks in each direction
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

# One of the options
async def generate_fact(city_name: str, country_name: str, fake: bool):
    model = genai.GenerativeModel("gemini-2.0-flash")
    
    if fake:
        prompt = f"Give me one fake but believable fact about {city_name}, {country_name}. One sentence only. Do not mention it is fake."
    else:
        prompt = f"Give me one short interesting fact about {city_name}, {country_name}. One sentence only."
    
    response = model.generate_content(prompt)
    return response.text.strip()

# Fetch a random city and its country from Firestore
async def get_random_city():
    cities = [doc.to_dict() for doc in db.collection("cities").stream()]
    
    if not cities:
        return None, None
    
    city = choice(cities)
    country_doc = db.collection("countries").document(city["country_id"]).get()
    country = country_doc.to_dict()
    
    return city, country

def generate_game_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

@app.post("/create-game")
async def create_game():
    # 1. Get random city and country
    city, country = await get_random_city()
    if not city:
        return {"error": "No cities found"}

    # 2. Determine which clue is fake
    fake_target = choice(["image", "flag", "fact"])
    image_is_fake = fake_target == "image"
    flag_is_fake = fake_target == "flag"
    fact_is_fake = fake_target == "fact"

    # 3. Fetch real Mapillary image
    real_image = await get_images(city["lat"], city["lng"])

    # 4. Get fake image if needed (from a different random city)
    if image_is_fake:
        other_city, _ = await get_random_city()
        fake_image = await get_images(other_city["lat"], other_city["lng"])
        final_image = fake_image.get("url") or real_image.get("url")
    else:
        final_image = real_image.get("url")

    # 5. Get flag colors (fake = different country's flag)
    if flag_is_fake:
        all_countries = [doc.to_dict() for doc in db.collection("countries").stream()]
        other_countries = [c for c in all_countries if c["id"] != country["id"]]
        fake_country = choice(other_countries)
        final_flag = fake_country["flag_colors"]
    else:
        final_flag = country["flag_colors"]

    # 6. Generate fact (real or fake)
    final_fact = await generate_fact(city["name"], country["name"], fake=fact_is_fake)

    # 7. Store game
    code = generate_game_code()
    games[code] = {
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

    return {"game_code": code}