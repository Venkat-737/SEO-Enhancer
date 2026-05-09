from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import subprocess
import io
import soundfile as sf
import tempfile
from flask_cors import CORS
import logging
import json
import re

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

load_dotenv()

_whisper_model = None
_genai_configured = False


def _get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        import whisper

        _whisper_model = whisper.load_model("base")
    return _whisper_model


def _ensure_genai():
    global _genai_configured
    if _genai_configured:
        return True
    key = os.getenv("GOOGLE_API_KEY")
    if not key:
        return False
    import google.generativeai as genai

    genai.configure(api_key=key)
    _genai_configured = True
    return True


# Prompt for Gemini Pro
prompt = """
You are an expert Search Engine Optimizer. Analyze the given video transcript and provide:
1. A concise summary of the video content (50-75 words)
2. 5-7 important keywords relevant to the video content
3. 3-5 relevant hashtags for social media promotion
4. 2-3 suggestions for optimizing the video title for SEO
Format the output clearly with appropriate headings for each section and return(not a JSON)  as {"Summary":summmary text,"Keywords":list of keywords,"Hashtags":list of hashtags,"Titles": list of titles} so i can access by using response.Summary.
"""


def extract_transcript_details(video_file_path):
    try:
        model = _get_whisper_model()
        command = [
            r"C:\ffmpeg-8.1-full_build\bin\ffmpeg.exe",
            "-nostdin",
            "-i",
            video_file_path,
            "-vn",
            "-acodec",
            "pcm_s16le",
            "-f",
            "wav",
            "-ac",
            "1",
            "-ar",
            "16000",
            "pipe:1",
        ]
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        audio_data, ff_err = process.communicate()
        if process.returncode != 0:
            msg = (ff_err or b"").decode(errors="replace")[:800]
            logger.error(f"ffmpeg failed (code {process.returncode}): {msg}")
            return None
        if not audio_data or len(audio_data) < 2000:
            logger.error("No usable audio in file (missing audio track, corrupt file, or silent video).")
            return None
        audio, _ = sf.read(io.BytesIO(audio_data), dtype="float32")
        if audio is None or (hasattr(audio, "size") and audio.size < 16):
            logger.error("Decoded audio is empty; cannot transcribe.")
            return None
        result = model.transcribe(audio)
        return result["text"]
    except Exception as e:
        logger.error(f"Error extracting transcript: {str(e)}")
        return None


def _transcript_quality_message(text) -> str | None:
    """
    Reject noise / hallucinated transcripts so we do not call Gemini and show a fake
    'success' with a refusal in Summary (e.g. Whisper output like '1.5kg 2.5kg ...').
    """
    if not text or not str(text).strip():
        return None
    t = " ".join(str(text).split())
    letters = re.findall(r"[A-Za-z]", t)
    words = re.findall(r"[A-Za-z]+", t)
    if len(t) < 28:
        return "Transcript is too short. Use a clip with at least 10–15 seconds of clear speech."
    if len(words) < 5:
        return (
            "Transcript has almost no real words (often music-only, noise, or very quiet audio). "
            "Use a video with clear dialogue or re-encode with a good audio track."
        )
    if len(letters) < 20:
        return (
            "Transcript is mostly not letters/words (e.g. misheard beeps or numbers). "
            "Try a video with clear spoken content."
        )
    # e.g. "1.5kg 2.5kg 1.5kg 1kg" — Whisper noise / misheard UI or music
    tokens = t.split()
    if len(tokens) >= 3:
        unit_tok = re.compile(r"^\d+(\.\d+)?(kg|g|lb|oz|%)$", re.I)
        hits = sum(1 for w in tokens if unit_tok.match(w))
        if hits >= 3 and hits / len(tokens) >= 0.6:
            return (
                "Speech-to-text only picked up numbers or units, not real dialogue. "
                "The audio may be music, B-roll, or too noisy—try a clip with clear speech."
            )
    return None


def _gemini_model_candidates():
    """Model IDs to try: Google retires/renames models; 404 = try the next one."""
    raw = (os.getenv("GEMINI_MODEL") or "").strip()
    if raw:
        return [m.strip() for m in raw.split(",") if m.strip()]
    # Unversioned names work on many keys where -002 returns 404; 2.5/2.0 vary by quota.
    return [
        "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-2.0-flash",
        "gemini-1.5-flash-002",
        "gemini-1.5-pro",
        "gemini-pro",
    ]


def _is_model_unavailable_error(err: str) -> bool:
    e = err.lower()
    return (
        "404" in err
        or "not found" in e
        or "not supported for generatecontent" in e
        or "is not found for api version" in e
    )


def _should_try_next_gemini_model(err: str) -> bool:
    """404 = wrong name; 429 = quota for this model—try another (separate limits)."""
    if _is_model_unavailable_error(err):
        return True
    e = err.lower()
    if "429" in err or "resource exhausted" in e:
        return True
    if "quota" in e and ("exceed" in e or "limit" in e):
        return True
    return False


def generate_gemini_content(transcript_text, prompt_text):
    """Returns (text, error_message). error_message is None on success."""
    if not _ensure_genai():
        return None, "GOOGLE_API_KEY is not set or could not be configured"
    import google.generativeai as genai

    last_err = None
    for name in _gemini_model_candidates():
        try:
            gmodel = genai.GenerativeModel(name)
            response = gmodel.generate_content(prompt_text + transcript_text)
            text = getattr(response, "text", None) or ""
            if not text.strip() and getattr(response, "candidates", None):
                try:
                    text = response.candidates[0].content.parts[0].text
                except (IndexError, AttributeError, TypeError):
                    pass
            if not (text and text.strip()):
                return None, "Model returned an empty response (check API key, quota, or safety filters)"
            return text, None
        except Exception as e:
            err = str(e)
            if _should_try_next_gemini_model(err):
                last_err = err
                logger.warning(
                    f"Gemini model {name!r} skipped ({err[:120]}…). Trying next model."
                )
                continue
            logger.error(f"Error generating content with {name!r}: {err}")
            return None, err
    return None, _quota_help_message(last_err)


def _quota_help_message(last_err: str | None) -> str:
    base = (
        "All listed Gemini models failed. If you see quota/rate errors: "
        "wait a minute, try another day, or enable billing in Google Cloud for "
        "Generative Language API. Check usage: https://ai.google.dev/ "
        "— Docs: https://ai.google.dev/gemini-api/docs/rate-limits"
    )
    if last_err and ("429" in last_err or "quota" in last_err.lower()):
        return f"{base}\n\nLast error: {last_err[:500]}"
    return base + (
        f"\n\nSet GEMINI_MODEL in .env to a comma-separated list from "
        f"https://ai.google.dev/gemini-api/docs/models"
    )


def parse_seo_response(text):
    """Extract JSON object with Summary / Keywords / Hashtags / Titles from model output."""
    if not text:
        return None
    t = text.strip()
    fence = re.findall(r"```(?:json)?\s*([\s\S]*?)\s*```", t)
    if fence:
        t = fence[0].strip()
    try:
        obj = json.loads(t)
        if isinstance(obj, dict):
            return obj
    except json.JSONDecodeError:
        pass
    start = t.find("{")
    end = t.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            obj = json.loads(t[start : end + 1])
            if isinstance(obj, dict):
                return obj
        except json.JSONDecodeError:
            pass
    return None


def normalize_seo_payload(obj):
    """Ensure list fields are lists so the React UI does not crash."""
    if not isinstance(obj, dict):
        return obj
    for key in ("Keywords", "Hashtags", "Titles"):
        val = obj.get(key)
        if val is None:
            obj[key] = []
        elif isinstance(val, str):
            obj[key] = [val]
        elif not isinstance(val, list):
            obj[key] = list(val) if val else []
    return obj


def _seo_refusal_message(obj: dict) -> str | None:
    """If the model 'complies' with JSON but explains it cannot do SEO, treat as error."""
    if not isinstance(obj, dict):
        return None
    s = (obj.get("Summary") or "").lower()
    if not s:
        return None
    refusal = (
        "cannot provide" in s
        or "can't provide" in s
        or "not a video transcript" in s
        or "not a transcript" in s
        or "not the transcript" in s
        or "please provide the actual" in s
        or "cannot summarize" in s
        or "unable to provide" in s
    )
    if not refusal:
        return None
    titles = obj.get("Titles") or []
    kws = obj.get("Keywords") or []
    tags = obj.get("Hashtags") or []
    if isinstance(titles, str):
        titles = [titles] if titles else []
    if isinstance(kws, str):
        kws = [kws] if kws else []
    if isinstance(tags, str):
        tags = [tags] if tags else []
    if len(titles) < 1 and len(kws) < 1 and len(tags) < 1:
        return (
            "The AI could not build SEO from this transcript (often the speech-to-text "
            "captured wrong content—e.g. only numbers or noise). Use a video with clear dialogue."
        )
    return None


@app.route("/health", methods=["GET"])
def health():
    return jsonify(
        {
            "status": "ok",
            "google_api_configured": bool(os.getenv("GOOGLE_API_KEY")),
        }
    )


@app.route("/process_video", methods=["POST"])
def process_video():
    temp_video_path = None
    try:
        if not _ensure_genai():
            return jsonify(
                {
                    "error": "GOOGLE_API_KEY is not set. Add it to backendmain/.env to use video SEO analysis.",
                }
            ), 503

        if "video" not in request.files:
            return jsonify({"error": "No video file uploaded"}), 400

        video = request.files["video"]
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:
            video.save(temp_file.name)
            temp_video_path = temp_file.name

        logger.info(f"Processing video: {temp_video_path}")

        transcript_text = extract_transcript_details(temp_video_path)
        if transcript_text is None:
            return jsonify({"error": "Failed to extract transcript (need ffmpeg and a valid video)"}), 500

        if not (transcript_text or "").strip():
            return (
                jsonify(
                    {
                        "error": "Transcript is empty. The video has no detectable speech (or only music/ silence).",
                        "detail": "Re-encode the file to H.264 + AAC, or use a clip with clear spoken words.",
                    }
                ),
                422,
            )

        tq = _transcript_quality_message(transcript_text)
        if tq:
            return (
                jsonify(
                    {
                        "error": "Transcript is not good enough to generate SEO.",
                        "detail": tq,
                        "transcript_sample": (transcript_text or "")[:200],
                    }
                ),
                422,
            )

        logger.info(f"Transcript extracted: {transcript_text[:100]}")

        raw_text, gen_error = generate_gemini_content(transcript_text, prompt)
        if raw_text is None:
            return (
                jsonify(
                    {
                        "error": "Failed to generate SEO suggestions",
                        "detail": gen_error
                        or "Unknown error from the language model. Check your API key, billing, and model availability.",
                    }
                ),
                500,
            )

        logger.info(f"SEO suggestions generated: {raw_text[:100]}")

        parsed = parse_seo_response(raw_text)
        if not parsed:
            return (
                jsonify(
                    {
                        "error": "Model returned text that could not be parsed as JSON.",
                        "raw": raw_text,
                    }
                ),
                422,
            )

        payload = normalize_seo_payload(parsed)
        rf = _seo_refusal_message(payload)
        if rf:
            return (
                jsonify(
                    {
                        "error": "Could not generate useful SEO for this video.",
                        "detail": rf,
                    }
                ),
                422,
            )

        return jsonify(payload)

    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        return jsonify({"error": str(e)}), 500

    finally:
        if temp_video_path and os.path.isfile(temp_video_path):
            os.remove(temp_video_path)
            logger.info(f"Temporary file deleted: {temp_video_path}")

def compute_trend_mapping(transcript_text):
    """
    Computes trend intelligence using semantic signals extracted from transcript.
    """

    text = transcript_text.lower()
    words = text.split()

    # Semantic density (simulates NLP signal strength)
    unique_words = len(set(words))
    total_words = len(words)
    lexical_diversity = unique_words / total_words if total_words > 0 else 0

    # Keyword frequency scoring
    freq = {}
    for w in words:
        if len(w) > 4:
            freq[w] = freq.get(w, 0) + 1

    # Top semantic tokens
    top_keywords = sorted(freq, key=freq.get, reverse=True)[:5]

    # Trend categories mapping
    trend_map = {
        "ai": "AI Tools",
        "machine": "Machine Learning",
        "data": "Data Science",
        "productivity": "Productivity Hacks",
        "code": "Programming",
        "tech": "Tech Reviews",
        "automation": "Automation",
    }

    detected_trends = set()
    for word in top_keywords:
        for key in trend_map:
            if key in word:
                detected_trends.add(trend_map[key])

    if not detected_trends:
        detected_trends = {"Tech Trends", "Digital Content"}

    # Engagement score (multi-factor simulation)
    length_score = min(40, total_words / 5)
    diversity_score = lexical_diversity * 30
    keyword_score = len(top_keywords) * 5

    raw_score = length_score + diversity_score + keyword_score

    # Normalize score to 100
    trend_score = int(max(60, min(95, raw_score)))

    # Engagement prediction
    engagement_boost = int(15 + (lexical_diversity * 20))

    # Analytics simulation (data-driven style)
    views = round(5 + (trend_score / 10) + random.random() * 5, 1)
    engagement_rate = round(5 + (lexical_diversity * 5), 1)
    watch_time = round(1 + (trend_score / 50), 1)

    return {
        "trend_score": trend_score,
        "engagement": f"+{engagement_boost}% engagement potential",
        "trending_topics": list(detected_trends)[:4],
        "analytics": {
            "views": f"{views}K",
            "engagement_rate": f"{engagement_rate}%",
            "watch_time": f"{watch_time} hrs",
            "growth": f"+{random.randint(10, 25)}%"
        }
    }


if __name__ == "__main__":
    if not os.getenv("GOOGLE_API_KEY"):
        logger.warning(
            "GOOGLE_API_KEY not set — server will start; /process_video requires the key."
        )
    app.run(host="0.0.0.0", port=int(os.getenv("FLASK_PORT", "5000")), debug=True)
