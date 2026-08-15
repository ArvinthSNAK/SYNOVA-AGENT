"""
app/intents/detector.py

Very small keyword-based intent classifier. It's intentionally simple —
the point is to show WHERE intent detection plugs into the pipeline.
Later you can replace `detect_intent` with a call to a real NLU model
(e.g. a fine-tuned classifier, or an OpenAI function-calling response)
without touching any other file.
"""

_INTENT_KEYWORDS = {
    "greeting": ["hi", "hello", "hey", "good morning", "good evening"],
    "goodbye": ["bye", "goodbye", "see you", "talk later"],
    "pricing": ["price", "cost", "plan", "subscription"],
    "support": ["help", "issue", "problem", "not working", "error"],
}


def detect_intent(message: str) -> str:
    lowered = message.lower()
    for intent, keywords in _INTENT_KEYWORDS.items():
        if any(kw in lowered for kw in keywords):
            return intent
    return "general"
