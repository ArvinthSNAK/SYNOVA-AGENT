import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormalEulerAiLogo from './FormalEulerAiLogo';
import InteractiveOwlIcon from './InteractiveOwlIcon';

const CHATBOT_URL = 'http://localhost:8002/api/v1/chat';

const FALLBACK_RESPONSES = {
  compare: "I'd be happy to help you compare policies! Head to the Marketplace and use the Compare checkbox on any products. You can compare up to 4 plans side-by-side. Would you like me to recommend which plans to compare?",
  renew: "Our OCR Renewal Engine can extract your policy data in seconds. Go to **Renew Policy** → upload your PDF → get instant comparison quotes from top insurers.",
  idv: "**IDV (Insured Declared Value)** is the maximum amount your insurer pays on total loss or theft. For a 1-year-old car, optimal IDV = ~85-90% of invoice value. It decreases ~10-15% each year.",
  ncb: "**NCB (No Claim Bonus)** is a discount for claim-free years — 20% after 1 year, up to 50% after 5+ years. The best part: it transfers 100% when you switch insurers!",
  claim: "To file a claim, go to your **Insurance Vault** → select the policy → click 'File Claim'. For motor: report within 24h. For health: cashless at network hospitals or reimbursement within 30 days.",
  default: "I'm Euler, your AI Insurance Copilot! I can help you compare policies, understand coverage, file claims, or find the best rates. What would you like to know?",
};

function getFallbackReply(text) {
  const lower = text.toLowerCase();
  if (lower.includes('compare') || lower.includes('quote') || lower.includes('best rate')) return FALLBACK_RESPONSES.compare;
  if (lower.includes('renew') || lower.includes('pdf') || lower.includes('ocr')) return FALLBACK_RESPONSES.renew;
  if (lower.includes('idv') || lower.includes('insured declared')) return FALLBACK_RESPONSES.idv;
  if (lower.includes('ncb') || lower.includes('no claim bonus')) return FALLBACK_RESPONSES.ncb;
  if (lower.includes('claim') || lower.includes('fnol')) return FALLBACK_RESPONSES.claim;
  return FALLBACK_RESPONSES.default;
}

export default function AiAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am **Euler**, your AI Insurance Copilot powered by OpenAI. I can analyze policy terms, compare live quotes, explain coverage in plain English, or help you maximize NCB savings. What can I help you with today?',
      time: 'Just now',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const suggestedPrompts = [
    { label: '🚗 Best motor insurance?', action: 'ask' },
    { label: '🏥 Compare health plans', action: 'ask' },
    { label: '📋 How to file a claim?', action: 'ask' },
    { label: '💰 What is NCB?', action: 'ask' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && isConnected === null) {
      fetch('http://localhost:8002/health', { signal: AbortSignal.timeout(3000) })
        .then(r => r.ok ? setIsConnected(true) : setIsConnected(false))
        .catch(() => setIsConnected(false));
    }
  }, [isOpen, isConnected]);

  const buildHistory = (msgs) => {
    return msgs
      .filter(m => m.id !== 1)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
  };

  const renderMessageText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part.split('\n').map((line, j, arr) => (
        <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
      ));
    });
  };

  const sendToAPI = async (text, currentMessages) => {
    if (isConnected !== false) {
      try {
        const history = buildHistory(currentMessages.slice(0, -1));
        const res = await fetch(CHATBOT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, history }),
          signal: AbortSignal.timeout(20000),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.reply) {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now() + 1,
                sender: 'ai',
                text: data.reply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            setIsTyping(false);
            setIsConnected(true);
            return;
          }
        }
      } catch (err) {
        setIsConnected(false);
        console.warn('Euler chatbot service offline, using fallback.');
      }
    }

    await new Promise(r => setTimeout(r, 700));
    const replyText = getFallbackReply(text);
    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + 2,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOffline: true,
      },
    ]);
    setIsTyping(false);
  };

  const handleSend = (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => {
      const updated = [...prev, userMsg];
      sendToAPI(text, updated);
      return updated;
    });

    if (!textToSend) setInputVal('');
    setIsTyping(true);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 999 }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn-pill-ai"
          style={{
            padding: '12px 22px',
            fontSize: 14,
            fontWeight: 800,
            boxShadow: '0 8px 30px rgba(139, 127, 168, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <InteractiveOwlIcon size={40} />
          <span>Ask Euler</span>
        </button>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 84,
            right: 28,
            width: 'min(440px, calc(100vw - 32px))',
            height: 560,
            background: '#FFFFFF',
            borderRadius: 24,
            border: '1px solid rgba(28, 28, 28, 0.12)',
            boxShadow: '0 24px 70px rgba(28, 28, 28, 0.18)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUpFade 0.22s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #6E6285 0%, #5B5171 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                <FormalEulerAiLogo size={24} color="#FFFFFF" glowColor="#8B7FA8" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15.5, letterSpacing: '-0.01em' }}>
                  Euler AI Copilot
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span
                    style={{
                      width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
                      background: isConnected === true ? '#4CAF50' : isConnected === false ? '#FF9800' : '#8B7FA8',
                    }}
                  />
                  {isConnected === true ? 'GPT-4o-mini · Online' : isConnected === false ? 'Offline Mode' : 'Connecting...'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                title="Clear chat"
                onClick={() =>
                  setMessages([{
                    id: Date.now(),
                    sender: 'ai',
                    text: 'Chat cleared! How can I help you with your insurance needs today?',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  }])
                }
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 4 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: 4 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Offline Banner */}
          {isConnected === false && (
            <div style={{
              background: 'linear-gradient(90deg, #FF9800, #F57C00)',
              color: '#FFF', fontSize: 11, fontWeight: 700,
              padding: '5px 16px', textAlign: 'center', letterSpacing: '0.02em',
            }}>
              ⚡ Offline mode — start the chatbot service with your OpenAI key for full AI
            </div>
          )}

          {/* Messages */}
          <div style={{
            flex: 1, padding: '14px 16px', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 12, background: '#EBEBEB',
          }}>
            {messages.map((m) => (
              <div key={m.id} style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%', display: 'flex', flexDirection: 'column',
              }}>
                {m.sender === 'ai' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                    <FormalEulerAiLogo size={14} color="var(--ai-accent)" glowColor="#8B7FA8" />
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ai-accent)' }}>
                      Euler AI{m.isOffline ? ' (Offline)' : ''}
                    </span>
                  </div>
                )}
                <div style={{
                  padding: '11px 15px',
                  borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.sender === 'user' ? 'var(--primary-navy)' : '#FFFFFF',
                  color: m.sender === 'user' ? '#FFFFFF' : 'var(--text-heading)',
                  fontSize: 13.5, lineHeight: 1.6,
                  boxShadow: '0 2px 8px rgba(28,28,28,0.06)',
                  border: m.sender === 'user' ? 'none' : '1px solid rgba(28,28,28,0.08)',
                  wordBreak: 'break-word',
                }}>
                  {renderMessageText(m.text)}
                </div>
                <div style={{
                  fontSize: 10, color: 'var(--text-dim)', marginTop: 3,
                  textAlign: m.sender === 'user' ? 'right' : 'left',
                }}>
                  {m.time}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{
                alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 13px', background: '#FFFFFF', borderRadius: 14,
                fontSize: 12, color: 'var(--text-muted)', border: '1px solid rgba(28,28,28,0.08)',
              }}>
                <FormalEulerAiLogo size={15} color="var(--ai-accent)" glowColor="#8B7FA8" />
                <span>Euler is thinking</span>
                <span style={{ display: 'flex', gap: 3 }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: 'var(--ai-accent)', opacity: 0.7, display: 'inline-block',
                      animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          <div style={{
            padding: '7px 12px', background: '#FFFFFF',
            borderTop: '1px solid rgba(28,28,28,0.06)',
            display: 'flex', gap: 6, overflowX: 'auto', whiteSpace: 'nowrap',
          }}>
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.label)}
                style={{
                  background: 'var(--bg-tinted)',
                  border: '1px solid rgba(28,28,28,0.15)',
                  borderRadius: 9999, padding: '5px 11px',
                  fontSize: 11, fontWeight: 600,
                  color: 'var(--blue-primary)', cursor: 'pointer',
                  whiteSpace: 'nowrap', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--blue-primary)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-tinted)'; e.currentTarget.style.color = 'var(--blue-primary)'; }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={e => { e.preventDefault(); handleSend(); }}
            style={{
              padding: '10px 12px', background: '#FFFFFF',
              borderTop: '1px solid rgba(28,28,28,0.08)',
              display: 'flex', gap: 8, alignItems: 'center',
            }}
          >
            <input
              type="text"
              className="input-field"
              style={{ padding: '9px 14px', fontSize: 13, borderRadius: 9999, flex: 1 }}
              placeholder="Ask about policies, claims, IDV, NCB..."
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              disabled={isTyping}
            />
            <button
              type="submit"
              className="btn-pill-primary"
              disabled={isTyping || !inputVal.trim()}
              style={{
                padding: '9px 18px', fontSize: 13, borderRadius: 9999,
                opacity: isTyping || !inputVal.trim() ? 0.5 : 1, transition: 'opacity 0.15s',
                cursor: isTyping || !inputVal.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%           { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}
