import asyncio
import base64
import os
from elevenlabs.client import ElevenLabs
from groq import Groq

load_dotenv()

eleven = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

async def generate_language_hint(country: str) -> dict:
    # Step 1 — get a phrase in that country's language from Groq
    prompt = f"Give me one short common phrase (5-10 words) in the native language of {country}. Return ONLY the phrase, nothing else. No translation, no explanation."
    
    response = await asyncio.to_thread(
        groq_client.chat.completions.create,
        model="llama-3.1-8b-instant",
        max_tokens=50,
        messages=[{"role": "user", "content": prompt}]
    )
    phrase = response.choices[0].message.content.strip()

    # Step 2 — convert to speech with ElevenLabs
    audio = eleven.text_to_speech.convert(
        voice_id="JBFqnCBsd6RMkjVDRZzb",
        text=phrase,
        model_id="eleven_multilingual_v2",
    )

    # Step 3 — encode as base64 to send over API
    audio_bytes = b"".join(audio)
    audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

    return {
        "audio": audio_b64,
        "phrase": phrase,
        "country": country
    }