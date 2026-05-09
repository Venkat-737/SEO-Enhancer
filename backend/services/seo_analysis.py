from keybert import KeyBERT
from transformers import pipeline
import spacy

# Load models once at import time
_kw_model      = None
_sentiment_pipe = None
_nlp           = None

def _get_models():
    global _kw_model, _sentiment_pipe, _nlp
    if _kw_model is None:
        _kw_model = KeyBERT()
    if _sentiment_pipe is None:
        _sentiment_pipe = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english"
        )
    if _nlp is None:
        _nlp = spacy.load("en_core_web_sm")
    return _kw_model, _sentiment_pipe, _nlp

def analyze_seo(transcript: str) -> dict:
    if not transcript or len(transcript.strip()) < 20:
        return {
            "keywords":        [],
            "topics":          [],
            "sentiment":       "NEUTRAL",
            "sentiment_score": 0.5,
        }

    kw_model, sentiment_pipe, nlp = _get_models()

    # Keyword extraction
    raw_kw   = kw_model.extract_keywords(
        transcript,
        keyphrase_ngram_range=(1, 3),
        stop_words="english",
        top_n=15,
    )
    keywords = [{"keyword": kw, "score": round(score, 4)} for kw, score in raw_kw]

    # Named entity / topic detection
    doc    = nlp(transcript[:5000])
    topics = list({
        ent.text for ent in doc.ents
        if ent.label_ in ("ORG", "PERSON", "PRODUCT", "GPE", "EVENT")
    })

    # Sentiment (DistilBERT, truncated to ~512 tokens)
    result          = sentiment_pipe(transcript[:1000])[0]
    sentiment_label = result["label"]
    sentiment_score = round(result["score"], 4)

    return {
        "keywords":        keywords,
        "topics":          topics[:10],
        "sentiment":       sentiment_label,
        "sentiment_score": sentiment_score,
    }