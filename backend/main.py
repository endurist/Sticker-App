import os
import io
import base64
import requests # <--- NEW: To download the AI image
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rembg import remove
from PIL import Image, ImageFilter
import google.generativeai as genai
from openai import OpenAI # <--- NEW: The Artist
from dotenv import load_dotenv

# Ensure proper UTF-8 encoding for Unicode handling
import locale
try:
    locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
except locale.Error:
    # Fallback if locale not available
    locale.setlocale(locale.LC_ALL, 'C.UTF-8')

# Set default encoding to UTF-8
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# Load environment variables from .env file
load_dotenv()

# --- CONFIGURATION ---
# 1. GOOGLE KEY (The Brain)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    print("⚠️  WARNING: GOOGLE_API_KEY environment variable is not set")
    print("The application will start but AI features will not work.")
    print("Set GOOGLE_API_KEY in your environment variables.")
    genai.configure(api_key="dummy_key")  # Prevent immediate crash
else:
    genai.configure(api_key=GOOGLE_API_KEY)

# 2. OPENAI KEY (The Artist)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("⚠️  WARNING: OPENAI_API_KEY environment variable is not set")
    print("The application will start but image generation will not work.")
    print("Set OPENAI_API_KEY in your environment variables.")
    openai_client = None  # Will be checked in endpoints
else:
    openai_client = OpenAI(api_key=OPENAI_API_KEY)

# CITY ASPECTS
# Used to guide the AI's "lens" for concept generation.
# We rotate through these to ensure semantic variety.
CITY_ASPECTS = [
    {
        "dimension": "iconic-landmark",
        "instruction": "A famous building, statue, or physical structure. Focus on a single architectural element."
    },
    {
        "dimension": "local-food",
        "instruction": "A specific local dish, street food, or beverage. Focus on a single serving."
    },
    {
        "dimension": "local-fauna",
        "instruction": "A local animal, pest, or pet associated with the city (e.g., NYC rat, Tokyo Shiba Inu)."
    },
    {
        "dimension": "transportation",
        "instruction": "A vehicle or mode of transit specific to this city (e.g., Yellow Cab, Gondola, Tuk-Tuk)."
    },
    {
        "dimension": "street-object",
        "instruction": "A small object found on the street (e.g., Fire Hydrant, Postbox, Street Sign)."
    },
    {
        "dimension": "local-stereotype",
        "instruction": "A humorous caricature of a typical local resident or tourist behavior."
    }
]

STYLES = [
    "classic bold vector sticker",
    "satirical caricature illustration",
    "funny cartoon style",
    "bold line art with flat colors",
    "retro souvenir decal style"
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    city: str
    history: list[str] = []

def process_sticker_image(image_data):
    """Takes raw bytes, removes background, adds white border"""
    input_image = Image.open(io.BytesIO(image_data)).convert("RGBA")
    
    # Remove Background
    cutout = remove(input_image)
    
    # Create White Border
    alpha = cutout.getchannel('A')
    border_mask = alpha.filter(ImageFilter.MaxFilter(15))
    white_layer = Image.new("RGBA", cutout.size, (255, 255, 255, 255))
    white_layer.putalpha(border_mask)
    
    # Composite
    final_sticker = Image.alpha_composite(white_layer, cutout)
    
    output_buffer = io.BytesIO()
    final_sticker.save(output_buffer, format="PNG")
    return output_buffer.getvalue()

def generate_concept(city: str, aspect: dict, history: list[str]) -> str:
    """STEP 1: GENERATE CONCEPT (Text Model)
    Generates a sophisticated, detailed visual concept with multiple creative elements."""
    prompt = f"""
        Role: Master Creative Director for a premium sticker design studio.

        Task: Design a sophisticated, multi-layered visual concept for a premium sticker.

        CITY FOCUS: {city}
        THEME CATEGORY: {aspect['dimension']} - {aspect['instruction']}

        AVOID these concepts (already generated):
        {chr(10).join(f"- {h}" for h in history)}

        REQUIREMENTS - Create a complex visual scene with:

        🎭 COMPOSITION ELEMENTS (2-4 elements combined):
        - Main subject with specific details, colors, and characteristics
        - Supporting elements that enhance the scene
        - Background details that add context or humor
        - Small accent details that make it memorable

        🎨 STYLISTIC APPROACH:
        - Blend realistic details with cartoon exaggeration
        - Add contemporary cultural references or modern twists
        - Include subtle humor, irony, or clever wordplay
        - Make it visually striking and shareable

        🌟 CREATIVE CONSTRAINTS:
        - Must be instantly recognizable as {city}-related
        - Should work well as a small sticker format
        - Include at least one surprising or unexpected element
        - Balance familiarity with creative innovation

        EXAMPLES OF COMPLEX CONCEPTS:
        - "A majestic Statue of Liberty wearing oversized sunglasses and holding a coffee cup, with tiny tourists taking selfies at her feet"
        - "A bright yellow NYC taxi cab with a pizza delivery sign on top, driven by a cartoon rat wearing a chauffeur hat"
        - "The Eiffel Tower at sunset, decorated with LED lights and tiny drones flying around it like fireflies"

        Return ONLY the detailed visual description (15-25 words maximum).
        Make it vivid, specific, and ready for AI image generation.
    """

    try:
        gemini_model = genai.GenerativeModel('gemini-2.5-flash')
        response = gemini_model.generate_content(prompt)
        concept = response.text.strip()

        # Ensure proper Unicode encoding
        concept = concept.encode('utf-8').decode('utf-8')

        # Ensure it's not too short - if it's under 10 words, ask for a more detailed version
        if len(concept.split()) < 10:
            follow_up_prompt = f"""
                The concept "{concept}" is too simple. Please expand it into a more detailed,
                complex visual scene with multiple elements, humor, and specific details.
                Make it 15-25 words and much more creative and sophisticated.
            """
            follow_up_response = gemini_model.generate_content(follow_up_prompt)
            concept = follow_up_response.text.strip()
            # Ensure proper Unicode encoding for follow-up response
            concept = concept.encode('utf-8').decode('utf-8')

        return concept
    except Exception as e:
        print(f"Concept generation failed, falling back to generic aspect: {e}")
        return aspect["instruction"]

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Backend is running"}

@app.exception_handler(UnicodeEncodeError)
async def unicode_error_handler(request, exc):
    return {"error": "Unicode encoding error", "message": "Please try again or use a different city"}

@app.post("/generate")
async def generate_sticker(request: PromptRequest):
    print(f"1. User asked for: {request.city}")

    # Check if API keys are configured
    if not GOOGLE_API_KEY or GOOGLE_API_KEY == "dummy_key":
        raise Exception("Google API key not configured. Please set GOOGLE_API_KEY environment variable.")

    if not openai_client:
        raise Exception("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.")

    # Select random aspect
    import random
    aspect = random.choice(CITY_ASPECTS)
    print(f"2. Using aspect: {aspect['dimension']}")

    # STEP 1: Generate a unique concept string
    concept_description = generate_concept(request.city, aspect, request.history)
    print(f"3. Generated Concept for {request.city} ({aspect['dimension']}): {concept_description}")

    # Select random style
    import random
    random_style = random.choice(STYLES)
    print(f"4. Using style: {random_style}")

    # STEP 2: Create the image prompt based on the concept
    creative_prompt = f"""
        Create a premium quality souvenir sticker with sophisticated design.

        CONCEPT: {concept_description}

        CITY: {request.city}

        DESIGN REQUIREMENTS:
        - Style: {random_style}
        - Vector art with clean lines and vibrant flat colors
        - Blend realistic details with cartoon exaggeration
        - Include humor, irony, or clever visual elements
        - Contemporary and culturally relevant

        TECHNICAL SPECIFICATIONS:
        - Die-cut sticker format (no rectangular borders)
        - Thick white outline around entire design
        - Pure white background (#FFFFFF)
        - High contrast for clean printing
        - Centered composition, no cropping
        - Optimized for 2-3 inch sticker size

        QUALITY STANDARDS:
        - Sharp, professional illustration
        - Colorful and eye-catching
        - Instantly recognizable and shareable
        - Perfect for urban fashion and streetwear
    """

    # Ensure creative prompt is properly encoded and sanitized
    creative_prompt = creative_prompt.encode('utf-8').decode('utf-8')
    print(f"Original prompt length: {len(creative_prompt)}")

    # Replace problematic Unicode characters that cause HTTP header encoding issues
    creative_prompt = creative_prompt.replace('\xa0', ' ')  # Non-breaking space
    creative_prompt = creative_prompt.replace('\u200b', '')  # Zero-width space
    creative_prompt = creative_prompt.replace('\ufeff', '')  # BOM character

    # Test if the prompt can be safely encoded for HTTP transmission
    try:
        creative_prompt.encode('ascii')
        print("Prompt is ASCII-safe")
    except UnicodeEncodeError as e:
        print(f"Prompt contains non-ASCII characters, sanitizing: {e}")
        # Log the problematic characters for debugging
        problematic_chars = [c for c in creative_prompt if ord(c) > 127]
        print(f"Problematic characters found: {[f'{c}({ord(c)})' for c in problematic_chars[:5]]}")

        # Keep only ASCII characters and common punctuation
        import string
        safe_chars = string.ascii_letters + string.digits + string.punctuation + ' \n\t'
        creative_prompt = ''.join(c for c in creative_prompt if c in safe_chars)
        print(f"Prompt sanitized to ASCII-only, new length: {len(creative_prompt)}")

    print(f"5. Final prompt (sanitized): {creative_prompt.strip()}")

    # --- STEP B: DALL-E 3 (The Artist) ---
    print("6. Asking DALL-E to paint it...")
    try:
        image_response = openai_client.images.generate(
            model="dall-e-3",
            prompt=creative_prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )

        image_url = image_response.data[0].url
        print(f"Generated image URL: {image_url}")

        # Download the image from OpenAI
        print("7. Downloading image...")
        img_data = requests.get(image_url).content
        print(f"Downloaded {len(img_data)} bytes of image data")

    except UnicodeEncodeError as e:
        print(f"Unicode encoding error in OpenAI request: {e}")
        raise Exception("Unicode encoding error in prompt - please try again or use a different city name")
    except Exception as e:
        print(f"Error with OpenAI API: {e}")
        # Try to provide a more detailed error message
        if "content_policy" in str(e).lower():
            raise Exception("Content policy violation - try a different city or concept")
        else:
            raise Exception(f"OpenAI API error: {str(e)}")

    # --- STEP C: PROCESS (The Factory) ---
    print("8. Cutting out sticker...")
    processed_sticker = process_sticker_image(img_data)

    if not processed_sticker or len(processed_sticker) == 0:
        print("ERROR: Image processing failed - empty result")
        raise Exception("Image processing failed")

    base64_image = base64.b64encode(processed_sticker).decode('utf-8')
    print(f"Processed image size: {len(processed_sticker)} bytes")
    print(f"Base64 length: {len(base64_image)}")

    print("9. Done! Sending to frontend.")
    response_data = {
        "prompt": creative_prompt,
        "concept": concept_description,
        "image": f"data:image/png;base64,{base64_image}"
    }

    # Ensure all response data is properly encoded
    for key, value in response_data.items():
        if isinstance(value, str):
            response_data[key] = value.encode('utf-8').decode('utf-8')

    print(f"Response data keys: {list(response_data.keys())}")
    print(f"Image data length: {len(response_data['image'])}")
    return response_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)