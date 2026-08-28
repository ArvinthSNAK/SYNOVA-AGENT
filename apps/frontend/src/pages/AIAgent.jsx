import React, { useCallback, useState } from 'react';
import { ArrowUp, Paperclip, Sparkles } from 'lucide-react';
import QuickActions from '../components/ai-agent/QuickActions';
import AIAgentHeader from '../components/ai-agent/AIAgentHeader';
import ConversationPanel from '../components/ai-agent/ConversationPanel';
import UploadZone from '../components/ai-agent/UploadZone';
import VoiceWidget from '../components/ai-agent/VoiceWidget';
import { askAdvisor } from '../api/advisorClient';

const responseFor = (action) => ({ 'Buy new insurance': 'I want to explore new insurance', 'Renew existing policy': 'Help me renew my existing policy', 'Analyze policy': 'Analyze my policy coverage', 'File a claim': 'I need help filing a claim', 'Check expiry date': 'When does my policy expire?', 'Insurance health score': 'Show my insurance health score', 'Compare policies': 'Compare the best policies for me', 'See premium trends': 'Show my premium trends' }[action]);

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
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [voiceActive, setVoiceActive] = useState(false);
    const send = async (value, type, mode = 'text') => { const text = value?.trim(); if (!text) return; setInput(''); const id = Date.now(); const fallbackType = type || getResponseType(text); setMessages((items) => [...items, { id, text, type: fallbackType, mode }]); try { const result = await askAdvisor(text, mode === 'voice' ? 'voice' : 'text'); setMessages((items) => items.map((item) => item.id === id ? { ...item, reply: result.reply, type: intentToType(result.session?.intent, fallbackType) } : item)); } catch (error) { setMessages((items) => items.map((item) => item.id === id ? { ...item, reply: 'I could not reach the advisor service. Please check that the SYNOVA voice agent is running on port 8011.' } : item)); } };
    const action = (title) => send(responseFor(title), undefined, 'text');
    const startVoice = () => setVoiceActive(true);
    const stopVoice = () => setVoiceActive(false);
    const handleVoiceTranscript = useCallback((transcript) => send(transcript, undefined, 'voice'), []);
    return <div className="ai-agent-page"><AIAgentHeader /><main className="ai-agent-main"><ConversationPanel messages={messages} /><QuickActions onAction={action} /></main><div className="ai-composer-wrap">{uploadOpen && <UploadZone onClose={() => setUploadOpen(false)} />}{voiceActive ? <VoiceWidget active onToggle={stopVoice} onTranscript={handleVoiceTranscript} /> : <div className="ai-composer"><button className="composer-icon" onClick={() => setUploadOpen((open) => !open)} aria-label="Upload policy"><Paperclip size={19} /></button><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && send(input)} placeholder="Ask SYNOVA anything about your insurance..." /><span className="composer-ai"><Sparkles size={14} /> AI</span><VoiceWidget active={false} onToggle={startVoice} /><button className="send-button" onClick={() => send(input)} aria-label="Send message"><ArrowUp size={18} /></button></div>}<p className="composer-note">SYNOVA AI can make mistakes. Always verify important policy details.</p></div></div>;
}