from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from firebase_admin import auth, firestore
import datetime


router = APIRouter()


# ── Request models ──────────────────────────────────────────


class SignupRequest(BaseModel):
   username: str
   password: str


class LoginRequest(BaseModel):
   username: str
   password: str


# ── Helper ──────────────────────────────────────────────────


def username_to_email(username: str) -> str:
   return f"{username.lower()}@geoblind.app"


# ── Sign Up ─────────────────────────────────────────────────


@router.post("/signup")
async def signup(body: SignupRequest):
   db = firestore.client()


   # Check if username already taken
   existing = db.collection("accounts").where("username", "==", body.username).get()
   if len(existing) > 0:
       raise HTTPException(status_code=400, detail="Username already taken")


   email = username_to_email(body.username)
   try:
       user = auth.create_user(
           email=email,
           password=body.password,
           display_name=body.username,
       )


       # Store password in Firestore (hackathon only!)
       db.collection("accounts").document(user.uid).set({
        "id": user.uid,
        "username": body.username,
        "password": body.password,
        "createdAt": datetime.datetime.utcnow().isoformat(),
        "stats": {
            "games_played": 0,
            "total_points": 0,
            "avg_accuracy_km": 0,
            "wins": 0,
            "best_guess_km": None,
            "current_streak": 0,
        }
    })


       return {
           "message": "Account created successfully",
           "uid": user.uid,
           "username": body.username,
       }
   except auth.EmailAlreadyExistsError:
       raise HTTPException(status_code=400, detail="Username already taken")
   except Exception as e:
       raise HTTPException(status_code=500, detail=str(e))


# ── Login ────────────────────────────────────────────────────


@router.post("/login")
async def login(body: LoginRequest):
   db = firestore.client()


   # Find account by username
   results = db.collection("accounts").where("username", "==", body.username).get()


   if len(results) == 0:
       raise HTTPException(status_code=404, detail="Username not found")


   account = results[0].to_dict()


   # Compare password directly
   if account.get("password") != body.password:
       raise HTTPException(status_code=401, detail="Incorrect password")


   return {
       "message": "Login successful",
       "uid": account["id"],
       "username": account["username"],
   }


# ── Get User Profile ─────────────────────────────────────────


@router.get("/user/{uid}")
async def get_user(uid: str):
   db = firestore.client()
   try:
       doc = db.collection("accounts").document(uid).get()
       if not doc.exists:
           raise HTTPException(status_code=404, detail="User not found")
       data = doc.to_dict()
       data.pop("password", None)  # don't expose password in profile lookups
       return data
   except Exception as e:
       raise HTTPException(status_code=500, detail=str(e))