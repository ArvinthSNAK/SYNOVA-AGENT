import os
import json
from typing import List, Dict, Any, Optional
import numpy as np
from . import llm_client

STORE_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'rag_store.json')


def _ensure_store_dir():
    d = os.path.dirname(STORE_PATH)
    os.makedirs(d, exist_ok=True)


def _load_store() -> Dict[str, Any]:
    _ensure_store_dir()
    if not os.path.exists(STORE_PATH):
        return {"documents": []}
    with open(STORE_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def _save_store(store: Dict[str, Any]):
    _ensure_store_dir()
    with open(STORE_PATH, 'w', encoding='utf-8') as f:
        json.dump(store, f, ensure_ascii=False)


async def add_documents(docs: List[Dict[str, Any]]):
    """Add documents to the store. Each doc: {id?: str, text: str, metadata?: dict}.
    Computes embeddings and persists them."""
    store = _load_store()
    texts = [d['text'] for d in docs]
    embeddings = await llm_client.get_embeddings(texts)

    for doc, emb in zip(docs, embeddings):
        entry = {
            "id": doc.get('id') or f"doc-{len(store['documents']) + 1}",
            "text": doc['text'],
            "metadata": doc.get('metadata') or {},
            "embedding": emb,
        }
        store['documents'].append(entry)

    _save_store(store)


def _cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


async def retrieve(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """Return top_k documents most similar to the query text."""
    store = _load_store()
    if not store.get('documents'):
        return []

    query_embs = await llm_client.get_embeddings([query])
    if not query_embs:
        return []
    q = np.array(query_embs[0], dtype=float)

    docs = store['documents']
    scores = []
    for doc in docs:
        emb = np.array(doc.get('embedding', []), dtype=float)
        scores.append(_cosine_sim(q, emb))

    idx_sorted = np.argsort(scores)[::-1]
    results = []
    for i in idx_sorted[:top_k]:
        d = docs[int(i)].copy()
        d['score'] = float(scores[int(i)])
        results.append(d)
    return results
