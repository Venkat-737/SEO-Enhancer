import re

ENGAGEMENT_WORDS = {
    "how", "why", "secret", "best", "top", "worst", "never", "always",
    "ultimate", "guide", "tips", "tricks", "hack", "mistake", "truth",
    "exposed", "revealed", "free", "easy", "fast", "proven", "amazing",
    "incredible", "shocking", "unbelievable", "must", "need", "watch",
}

def _title_ctr_score(title: str) -> int:
    """0-30 pts: rewards 40-70 char titles and engagement words."""
    score = 0
    ln    = len(title)
    if 40 <= ln <= 70:
        score += 15
    elif 30 <= ln < 40 or 70 < ln <= 80:
        score += 8
    words  = set(re.findall(r"\w+", title.lower()))
    score += min(len(words & ENGAGEMENT_WORDS) * 5, 15)
    return score

def _keyword_score(keywords: list) -> int:
    """0-25 pts: number + confidence of extracted keywords."""
    if not keywords:
        return 0
    avg_conf    = sum(k["score"] for k in keywords) / len(keywords)
    count_score = min(len(keywords), 10) * 1.5   # up to 15 pts
    conf_score  = avg_conf * 10                   # up to 10 pts
    return round(count_score + conf_score)

def _sentiment_score(sentiment: str, sentiment_score: float) -> int:
    """0-20 pts: positive sentiment scores highest."""
    if sentiment == "POSITIVE":
        return round(sentiment_score * 20)
    return round((1 - sentiment_score) * 10)   # some credit for strong negatives

def _length_score(transcript: str) -> int:
    """0-15 pts: rewards transcripts suggesting 8-20 min videos."""
    word_count    = len(transcript.split())
    estimated_min = word_count / 150   # ~150 wpm speaking rate
    if 8 <= estimated_min <= 20:
        return 15
    elif 5 <= estimated_min < 8 or 20 < estimated_min <= 30:
        return 10
    elif 2 <= estimated_min < 5:
        return 5
    return 2

def _view_range(seo: int) -> str:
    if seo >= 85: return "100K – 500K"
    if seo >= 70: return "50K – 100K"
    if seo >= 55: return "10K – 50K"
    if seo >= 40: return "1K – 10K"
    return "< 1K"

def _reach_label(seo: int) -> str:
    if seo >= 75: return "High"
    if seo >= 50: return "Medium"
    return "Low"

def predict_performance(
    keywords: list,
    title: str,
    sentiment: str,
    transcript: str,
    sentiment_score: float = 0.5,
) -> dict:
    kw     = _keyword_score(keywords)
    ctr    = _title_ctr_score(title)
    sent   = _sentiment_score(sentiment, sentiment_score)
    length = _length_score(transcript)

    seo_score = min(100, round(kw + ctr + sent + length))
    virality  = min(100, round((seo_score + ctr + sent) / 3 + 5))

    return {
        "seo_score":         seo_score,
        "predicted_views":   _view_range(seo_score),
        "reach_probability": _reach_label(seo_score),
        "virality_score":    virality,
        "breakdown": {
            "keyword_score":   kw,
            "title_ctr_score": ctr,
            "sentiment_score": sent,
            "length_score":    length,
        },
    }