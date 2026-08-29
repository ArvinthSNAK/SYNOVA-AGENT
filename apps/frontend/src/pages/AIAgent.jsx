import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, Paperclip, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Car, RefreshCw, Volume2, VolumeX, X } from 'lucide-react';
import AIAgentHeader from '../components/ai-agent/AIAgentHeader';
import ConversationPanel from '../components/ai-agent/ConversationPanel';
import UploadZone from '../components/ai-agent/UploadZone';
import VoiceWidget from '../components/ai-agent/VoiceWidget';
import { useAuth } from '../context/AuthContext';
import { askAdvisor, resetAdvisorSession } from '../api/advisorClient';

const responseFor = (action) => ({
    'Buy new insurance': 'I want to buy a new motor insurance policy',
    'Renew existing policy': 'I want to renew my existing insurance policy',
    'Analyze policy': 'Analyze my policy coverage',
    'File a claim': 'I need help filing a claim',
    'Check expiry date': 'When does my policy expire?',
    'Insurance health score': 'Show my insurance health score',
    'Compare policies': 'Compare the best policies for me',
    'See premium trends': 'Show my premium trends'
}[action]);

const getResponseType = (text) => {
    const question = text.toLowerCase();
    if (question.includes('compare') || question.includes('quote') || question.includes('price') || question.includes('premium')) return 'compare';
    if (question.includes('claim') || question.includes('accident') || question.includes('damage')) return 'claim';
    if (question.includes('score') || question.includes('health') || question.includes('protection')) return 'score';
    if (question.includes('expiry') || question.includes('expire') || question.includes('date')) return 'expiry';
    if (question.includes('renew') || question.includes('renewal')) return 'renewal';
    if (question.includes('buy') || question.includes('new insurance') || question.includes('cover')) return 'new';
    if (question.includes('analy') || question.includes('policy')) return 'summary';
    return 'general';
};

const intentToType = (intent, fallback) => ({
    RENEW_INSURANCE: 'renewal',
    CLAIM_ASSISTANCE: 'claim',
    POLICY_COMPARISON: 'compare',
    INSURANCE_HEALTH_SCORE: 'score',
    NEW_INSURANCE: 'new',
    POLICY_QUERY: 'general',
})[intent] || fallback;

export default function AIAgent() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const accountName = user?.full_name || 'Valued Customer';

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [voiceActive, setVoiceActive] = useState(false);
    const [speakingEnabled, setSpeakingEnabled] = useState(true);
    const [autofillCountdown, setAutofillCountdown] = useState(null);
    const [pendingRedirectUrl, setPendingRedirectUrl] = useState(null);

    // Speak helper using Web Speech API
    const speakReply = useCallback((textToSpeak) => {
        if (!speakingEnabled || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const cleanText = textToSpeak.replace(/[#*•_`[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 1.05;
            utterance.pitch = 1.0;
            utterance.lang = 'en-IN';
            window.speechSynthesis.speak(utterance);
        } catch (e) {}
    }, [speakingEnabled]);

    const handleResetChat = useCallback(() => {
        resetAdvisorSession();
        sessionStorage.removeItem('synova_voice_autofill');
        setAutofillCountdown(null);
        setPendingRedirectUrl(null);
        const welcomeText = `Hi ${accountName}! How can I assist you with your insurance today? Would you like to buy new motor insurance, renew an existing policy, or explore health coverage?`;
        const initialMsg = {
            id: 'welcome-' + Date.now(),
            text: null,
            reply: welcomeText,
            type: 'general',
            mode: 'voice',
            isGreeting: true,
        };
        setMessages([initialMsg]);
        speakReply(welcomeText);
    }, [accountName, speakReply]);

    // Initial clean session setup on mount
    useEffect(() => {
        handleResetChat();
    }, [handleResetChat]);

    // Handle automated redirect countdown
    useEffect(() => {
        if (autofillCountdown === null || !pendingRedirectUrl) return;
        if (autofillCountdown <= 0) {
            navigate(pendingRedirectUrl);
            return;
        }
        const timer = setTimeout(() => {
            setAutofillCountdown(c => (c !== null ? c - 1 : null));
        }, 1000);
        return () => clearTimeout(timer);
    }, [autofillCountdown, pendingRedirectUrl, navigate]);

    const send = async (value, type, mode = 'text') => {
        const text = value?.trim();
        if (!text) return;
        setInput('');
        const id = Date.now();
        const fallbackType = type || getResponseType(text);
        
        // Append user message immediately
        setMessages((items) => [...items, { id, text, type: fallbackType, mode }]);

        try {
            const result = await askAdvisor(text, mode === 'voice' ? 'voice' : 'text', accountName);
            const targetType = intentToType(result.session?.intent, fallbackType);
            
            setMessages((items) =>
                items.map((item) =>
                    item.id === id
                        ? {
                              ...item,
                              reply: result.reply,
                              type: targetType,
                              event: result.event,
                              autofillData: result.autofill_data,
                              targetUrl: result.target_url,
                          }
                        : item
                )
            );

            // Speak response
            if (result.reply) {
                speakReply(result.reply);
            }

            // Handle Autofill completion & auto-navigation
            if (result.event === 'autofill_ready_new' || result.event === 'autofill_ready_renew') {
                if (result.autofill_data) {
                    sessionStorage.setItem('synova_voice_autofill', JSON.stringify(result.autofill_data));
                }
                if (result.target_url) {
                    setPendingRedirectUrl(result.target_url);
                    setAutofillCountdown(3); // Start 3-second auto-redirect countdown
                }
            }
        } catch (error) {
            setMessages((items) =>
                items.map((item) =>
                    item.id === id
                        ? {
                              ...item,
                              reply: 'I could not reach the advisor service. Please verify the SYNOVA voice agent is running on port 8011.',
                          }
                        : item
                )
            );
        }
    };

    const action = (title) => send(responseFor(title) || title, undefined, 'text');
    const startVoice = () => setVoiceActive(true);
    const stopVoice = () => setVoiceActive(false);
    const handleVoiceTranscript = useCallback((transcript) => send(transcript, undefined, 'voice'), []);

    return (
        <div className="ai-agent-page">
            <AIAgentHeader 
                onToggleSpeech={() => setSpeakingEnabled(!speakingEnabled)} 
                speechEnabled={speakingEnabled} 
                onResetChat={handleResetChat}
            />
            
            <main className="ai-agent-main">
                {/* Active Autofill Redirection Banner */}
                {pendingRedirectUrl && (
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            color: '#FFFFFF',
                            padding: '16px 20px',
                            borderRadius: 16,
                            marginBottom: 20,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 8px 24px rgba(5, 150, 105, 0.3)',
                            animation: 'pulse 2s infinite',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <CheckCircle2 size={24} color="#A7F3D0" />
                            <div>
                                <strong style={{ fontSize: 14.5, display: 'block' }}>
                                    ✓ All details captured! Auto-navigating to autofilled form in {autofillCountdown}s...
                                </strong>
                                <span style={{ fontSize: 12, opacity: 0.9 }}>
                                    Form fields will be prefilled automatically from your voice input.
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                                onClick={() => {
                                    setAutofillCountdown(null);
                                    setPendingRedirectUrl(null);
                                }}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    color: '#FFFFFF',
                                    border: '1px solid rgba(255, 255, 255, 0.4)',
                                    padding: '8px 14px',
                                    borderRadius: 10,
                                    fontWeight: 700,
                                    fontSize: 12.5,
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => navigate(pendingRedirectUrl)}
                                style={{
                                    background: '#FFFFFF',
                                    color: '#047857',
                                    border: 'none',
                                    padding: '10px 18px',
                                    borderRadius: 10,
                                    fontWeight: 800,
                                    fontSize: 13,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                <span>Go Now ➔</span>
                            </button>
                        </div>
                    </div>
                )}

                <ConversationPanel messages={messages} onSelectOption={(opt) => send(opt)} onNavigate={(url) => navigate(url)} />
            </main>

            <div className="ai-composer-wrap">
                {uploadOpen && <UploadZone onClose={() => setUploadOpen(false)} />}
                {voiceActive ? (
                    <VoiceWidget active onToggle={stopVoice} onTranscript={handleVoiceTranscript} />
                ) : (
                    <div className="ai-composer">
                        <button className="composer-icon" onClick={() => setUploadOpen((open) => !open)} aria-label="Upload policy">
                            <Paperclip size={19} />
                        </button>
                        <input
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            onKeyDown={(event) => event.key === 'Enter' && send(input)}
                            placeholder="Speak or type: 'Buy new insurance' or 'Renew policy'..."
                        />
                        <span className="composer-ai">
                            <Sparkles size={14} /> AI Voice
                        </span>
                        <VoiceWidget active={false} onToggle={startVoice} />
                        <button className="send-button" onClick={() => send(input)} aria-label="Send message">
                            <ArrowUp size={18} />
                        </button>
                    </div>
                )}
                <p className="composer-note">
                    SYNOVA AI extracts and autofills your vehicle & policy data automatically into official insurer forms.
                </p>
            </div>
        </div>
    );
}