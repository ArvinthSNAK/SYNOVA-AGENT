import React from 'react';
import { ArrowLeft, CircleUserRound, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AIAgentHeader() {
    const navigate = useNavigate();

    return (
        <header className="ai-agent-header">
            <button className="ai-back-button" onClick={() => navigate('/')} aria-label="Back to Synova">
                <ArrowLeft size={18} />
                <span>SYNOVA</span>
            </button>
            <div className="ai-agent-brand">
                <div className="ai-brand-mark"><Sparkles size={17} /></div>
                <div>
                    <div className="ai-brand-name">SYNOVA AI</div>
                    <div className="ai-brand-subtitle">Your Personal Insurance Advisor</div>
                </div>
            </div>
            <div className="ai-session-meta">
                <span className="ai-online"><i /> Online</span>
                <span className="ai-session-label">Session 0248</span>
                <CircleUserRound size={20} />
            </div>
        </header>
    );
}