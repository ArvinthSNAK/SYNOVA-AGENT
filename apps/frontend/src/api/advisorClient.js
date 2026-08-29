import { isLocalEnvironment } from '../utils/endpointHelper';

const isLocal = isLocalEnvironment();

const ADVISOR_URLS = [
    import.meta.env.VITE_ADVISOR_URL,
    !isLocal ? '/voice-agent' : null,
    'http://127.0.0.1:8011',
    'http://localhost:8011',
].filter(Boolean);

export function getSessionId() {
    let sessionId = sessionStorage.getItem('synova_advisor_session');
    if (!sessionId) {
        sessionId = globalThis.crypto?.randomUUID?.() || `synova-${Date.now()}`;
        sessionStorage.setItem('synova_advisor_session', sessionId);
    }
    return sessionId;
}

export function resetAdvisorSession() {
    const newSessionId = globalThis.crypto?.randomUUID?.() || `synova-${Date.now()}`;
    sessionStorage.setItem('synova_advisor_session', newSessionId);
    return newSessionId;
}

export async function askAdvisor(transcript, source = 'text', customerName = null) {
    let lastError = null;
    let finalCustomerName = customerName;
    if (!finalCustomerName) {
        try {
            const savedUser = localStorage.getItem('synova_user');
            if (savedUser) {
                finalCustomerName = JSON.parse(savedUser)?.full_name;
            }
        } catch (e) {}
    }

    for (const url of ADVISOR_URLS) {
        try {
            const response = await fetch(`${url}/v1/turns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: getSessionId(),
                    transcript,
                    source,
                    customer_name: finalCustomerName || undefined,
                }),
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (err) {
            lastError = err;
        }
    }

    throw lastError || new Error('Advisor request failed on all configured endpoints.');
}