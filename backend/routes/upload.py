import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from services.transcription import extract_transcript
from services.frame_analysis import extract_frames
from services.seo_analysis import analyze_seo
from services.title_generator import generate_seo_content
from services.prediction import predict_performance

upload_bp = Blueprint("upload", __name__)

ALLOWED_EXTENSIONS = {"mp4", "mov", "avi"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route("/upload", methods=["POST"])
def upload_video():
    if "video" not in request.files:
        return jsonify({"error": "No video file provided"}), 400

    video = request.files["video"]
    if video.filename == "" or not allowed_file(video.filename):
        return jsonify({"error": "Invalid file type. Allowed: mp4, mov, avi"}), 400

    filename = secure_filename(video.filename)
    upload_dir = current_app.config["UPLOAD_FOLDER"]
    temp_dir   = current_app.config["TEMP_FOLDER"]
    os.makedirs(upload_dir, exist_ok=True)
    os.makedirs(temp_dir,   exist_ok=True)

    video_path = os.path.join(upload_dir, filename)
    video.save(video_path)

    try:
        # 1. Speech extraction
        transcript = extract_transcript(video_path, temp_dir)

        # 2. Frame analysis
        frame_insights = extract_frames(video_path, temp_dir)

        # 3. NLP SEO analysis
        seo_data = analyze_seo(transcript)

        # 4. AI-generated titles, description, tags (Gemini)
        generated = generate_seo_content(transcript, seo_data["keywords"])

        # 5. Performance prediction
        prediction = predict_performance(
            keywords=seo_data["keywords"],
            title=generated["titles"][0] if generated["titles"] else "",
            sentiment=seo_data["sentiment"],
            sentiment_score=seo_data["sentiment_score"],
            transcript=transcript,
        )

        return jsonify({
            "transcript":             transcript,
            "frame_insights":         frame_insights,
            "seo_analysis":           seo_data,
            "generated_content":      generated,
            "performance_prediction": prediction,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(video_path):
            os.remove(video_path)