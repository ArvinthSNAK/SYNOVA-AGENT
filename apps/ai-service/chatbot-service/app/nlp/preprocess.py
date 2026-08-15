"""
app/nlp/preprocess.py

Lightweight text cleanup before a message is sent to OpenAI or the
intent detector. Kept dependency-free on purpose; swap in spaCy/NLTK
later if you need lemmatization, stopword removal, etc.
"""

import re


def clean_text(text: str) -> str:
    text = text.strip()
    text = re.sub(r"\s+", " ", text)  # collapse repeated whitespace
    return text
