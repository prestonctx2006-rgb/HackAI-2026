from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
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

# ── Sign Up ─────────────────────────────────────────────────

@router.post("/signup")
async def signup(body: SignupRequest):
    db = firestore.client()
    email = username_to_email(body.username)
    try:
        user = auth.create_user(
            email=email,
            password=body.password,
            display_name=body.username,
        )
        db.collection("accounts").document(user.uid).set({
            "id": user.uid,
            "username": body.username,
            "createdAt": datetime.datetime.utcnow().isoformat(),
        })
        custom_token = auth.create_custom_token(user.uid)
        return {
            "message": "Account created successfully",
            "uid": user.uid,
            "token": custom_token.decode("utf-8"),
        }
    except auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=400, detail="Username already taken")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Login ───────────────────────────────────────────────────

@router.post("/login")
async def login(body: LoginRequest):
    db = firestore.client()
    email = username_to_email(body.username)
    try:
        user = auth.get_user_by_email(email)
        custom_token = auth.create_custom_token(user.uid)
        doc = db.collection("accounts").document(user.uid).get()
        profile = doc.to_dict() if doc.exists else {}
        return {
            "message": "Login successful",
            "uid": user.uid,
            "token": custom_token.decode("utf-8"),
            "username": profile.get("username", ""),
        }
    except auth.UserNotFoundError:
        raise HTTPException(status_code=404, detail="Username not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Get User Profile ────────────────────────────────────────

@router.get("/user/{uid}")
async def get_user(uid: str):
    db = firestore.client()
    try:
        doc = db.collection("accounts").document(uid).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        return doc.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Helper to convert username to a hidden email
def username_to_email(username: str) -> str:
    return f"{username.lower()}@geoblind.app"