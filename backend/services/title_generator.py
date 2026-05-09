import os
import json
import re
import google.generativeai as genai

# Configure Gemini once at import time
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
_model = genai.GenerativeModel("gemini-2.5-flash")   # free-tier model

SYSTEM_INSTRUCTION = """You are an expert YouTube SEO strategist.
Return ONLY valid JSON — no markdown fences, no explanation, no preamble.
Schema:
{
  "titles": ["<title1>", "<title2>", "<title3>"],
  "description": "<150-300 word SEO-optimised YouTube description with keywords>",
  "tags": ["<tag1>", "...", "<tag20>"],
  "hashtags": ["#tag1", "#tag2", "#tag3"]
}"""

def generate_seo_content(transcript: str, keywords: list) -> dict:
    kw_list     = ", ".join(k["keyword"] for k in keywords[:10])
    user_prompt = f"""{SYSTEM_INSTRUCTION}

Transcript (excerpt):
{transcript[:3000]}

Top keywords: {kw_list}

Generate 3 click-worthy SEO-optimised YouTube titles, a description, 20 tags, and 3 hashtags."""

    response = _model.generate_content(user_prompt)
    raw      = response.text.strip()

    # Strip accidental markdown fences
    raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Fallback: return raw text in description field
        return {"titles": [], "description": raw, "tags": [], "hashtags": []}