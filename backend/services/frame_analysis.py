import os
import cv2

def extract_frames(video_path: str, temp_dir: str, interval_sec: int = 10) -> dict:
    """
    Extract one frame every `interval_sec` seconds.
    Returns basic video stats + saved frame paths.
    Plug in CLIP / Gemini Vision / YOLO on `frame_paths` for deeper analysis.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {"error": "Could not open video"}

    fps          = cap.get(cv2.CAP_PROP_FPS) or 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration_sec = total_frames / fps
    width        = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height       = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    frames_dir = os.path.join(temp_dir, "frames")
    os.makedirs(frames_dir, exist_ok=True)

    frame_paths    = []
    frame_interval = int(fps * interval_sec)
    frame_idx      = 0

    while True:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret:
            break
        out_path = os.path.join(frames_dir, f"frame_{frame_idx}.jpg")
        cv2.imwrite(out_path, frame)
        frame_paths.append(out_path)
        frame_idx += frame_interval

    cap.release()

    return {
        "duration_sec":      round(duration_sec, 2),
        "resolution":        f"{width}x{height}",
        "fps":               round(fps, 2),
        "frames_extracted":  len(frame_paths),
        "frame_paths":       frame_paths,
    }