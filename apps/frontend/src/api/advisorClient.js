const ADVISOR_URL = import.meta.env.VITE_ADVISOR_URL || 'http://localhost:8011';

function getSessionId() {
    let sessionId = sessionStorage.getItem('synova_advisor_session');
    if (!sessionId) {
        sessionId = globalThis.crypto?.randomUUID?.() || `synova-${Date.now()}`;
        sessionStorage.setItem('synova_advisor_session', sessionId);
    }
    return sessionId;
}

export async function askAdvisor(transcript, source = 'text') {
    const response = await fetch(`${ADVISOR_URL}/v1/turns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: getSessionId(), transcript, source }),
    });
    if (!response.ok) throw new Error(`Advisor request failed with ${response.status}`);
    return response.json();
}