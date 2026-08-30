import React from 'react';
import { ArrowLeft, Sparkles, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SynovaOwlLogo from '../common/SynovaOwlLogo';

export default function AIAgentHeader({ onToggleSpeech, speechEnabled, onResetChat }) {
    const navigate = useNavigate();

    return (
        <header className="ai-agent-header">
            <button className="ai-back-button" onClick={() => navigate('/')} aria-label="Back to Synova">
                <ArrowLeft size={18} />
                <span>SYNOVA</span>
            </button>
            <div className="ai-agent-brand">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <SynovaOwlLogo size={32} showText={false} />
                    <div>
                        <div className="ai-brand-name">SYNOVA VOICE ADVISOR</div>
                        <div className="ai-brand-subtitle">Automated Underwriting & Form Autofill</div>
                    </div>
                </div>
            </div>
            <div className="ai-session-meta">
                <button
                    type="button"
                    onClick={onResetChat}
                    style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        color: '#E2E8F0',
                        borderRadius: 20,
                        padding: '6px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 600,
                    }}
                    title="Start fresh conversation"
                >
                    <RotateCcw size={14} color="#9A9A9A" />
                    <span>New Chat</span>
                </button>
                <button
                    type="button"
                    onClick={onToggleSpeech}
                    style={{
                        background: speechEnabled ? 'rgba(37, 99, 235, 0.12)' : 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#FFFFFF',
                        borderRadius: 20,
                        padding: '6px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 600,
                    }}
                    title={speechEnabled ? 'Voice output enabled' : 'Voice output muted'}
                >
                    {speechEnabled ? <Volume2 size={16} color="#60A5FA" /> : <VolumeX size={16} color="#9A9A9A" />}
                    <span>{speechEnabled ? 'Voice Active' : 'Voice Muted'}</span>
                </button>
                <span className="ai-online"><i /> Online (Port 8011)</span>
            </div>
        </header>
    );
}