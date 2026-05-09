import os
import whisper
from moviepy import VideoFileClip

def extract_transcript(video_path: str, temp_dir: str) -> str:
    """Extract audio from video and transcribe with Whisper."""
    audio_path = os.path.join(temp_dir, "audio.wav")

    try:
        clip = VideoFileClip(video_path)
        if clip.audio is None:
            return ""

        clip.audio.write_audiofile(audio_path, logger=None)
        clip.close()

        model = whisper.load_model("base")
        result = model.transcribe(audio_path)

        return result["text"].strip()

    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)