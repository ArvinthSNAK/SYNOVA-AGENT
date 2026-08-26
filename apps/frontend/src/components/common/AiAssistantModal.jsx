import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function EulerOwlIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 1. Owl Head & Body with Iconic Ear Horns */}
      <path
        d="M4.5 8L6.8 3.8C8.3 4.7 10.1 5.2 12 5.2C13.9 5.2 15.7 4.7 17.2 3.8L19.5 8C20.8 10.8 20.8 14.2 19.5 17.2C18.2 20.2 15.2 22 12 22C8.8 22 5.8 20.2 4.5 17.2C3.2 14.2 3.2 10.8 4.5 8Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 2. Iconic Owl Eyebrow / Facial Mask Arc */}
      <path
        d="M5.5 7.5C7.2 6.2 10.2 6.8 12 9.2C13.8 6.8 16.8 6.2 18.5 7.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* 3. Left Eye: Large Disc & Pupil */}
      <circle cx="8.5" cy="12" r="2.8" stroke={color} strokeWidth="1.5" />
      <circle cx="8.5" cy="12" r="1.3" fill={color} />

      {/* 4. Right Eye: Large Disc & Pupil */}
      <circle cx="15.5" cy="12" r="2.8" stroke={color} strokeWidth="1.5" />
      <circle cx="15.5" cy="12" r="1.3" fill={color} />

      {/* 5. Center Beak */}
      <path
        d="M12 11.5L10.4 14.5H13.6L12 11.5Z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
      />

      {/* 6. Wing Creases */}
      <path
        d="M4.8 13.5C5.8 16.5 7.5 19 9.5 20.8"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M19.2 13.5C18.2 16.5 16.5 19 14.5 20.8"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* 7. Chest Feather Plumage */}
      <path
        d="M10.2 17C11 17.8 13 17.8 13.8 17"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M10.8 19.2C11.4 19.8 12.6 19.8 13.2 19.2"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* 8. Little Perching Talons */}
      <path
        d="M9 22V23.5M10.5 22V23.5 M13.5 22V23.5M15 22V23.5"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AiAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am Euler. I can analyze your policy coverage, compare live quotes across providers, or help you maximize your renewal savings.',
      time: 'Just now',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const suggestedPrompts = [
    { label: 'Compare 4 live quotes', action: 'compare', target: '/new-insurance' },
    { label: 'Analyze policy PDF', action: 'renew', target: '/renew-insurance' },
    { label: 'Calculate optimal IDV', action: 'idv' },
    { label: 'What is NCB transfer?', action: 'ncb' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "I'm analyzing your request against current insurer algorithms...";
      const lower = text.toLowerCase();

      if (lower.includes('compare') || lower.includes('quote') || lower.includes('best rate')) {
        replyText = "I've loaded multi-insurer rates for your profile. ICICI Lombard and ACKO currently offer the strongest motor and health combinations with up to 18% renewal savings. Would you like to view the live comparison?";
      } else if (lower.includes('renew') || lower.includes('pdf') || lower.includes('upload') || lower.includes('ocr')) {
        replyText = "Our Vision OCR engine can extract your policy schedule in under 3 seconds. Just upload your existing policy PDF on the Renewals page to compare matching terms.";
      } else if (lower.includes('idv')) {
        replyText = "Insured Declared Value (IDV) is the maximum sum assured for total loss or theft. For a 2-year-old vehicle, optimal market IDV is typically 80% of original invoice value.";
      } else if (lower.includes('ncb')) {
        replyText = "No Claim Bonus (NCB) transfers 100% to your new insurer upon switching! A 20% to 50% NCB discount significantly reduces your own-damage premium.";
      } else {
        replyText = `Understood. Euler analyzes your insurance coverage, monitors expiration dates, and dynamically identifies lower rates across top insurers. Let me know if you want to explore new quotes or renewals.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  const handlePromptClick = (p) => {
    if (p.target) {
      navigate(p.target);
      setIsOpen(false);
    } else {
      handleSend(p.label);
    }
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
            fontWeight: 700,
            boxShadow: '0 8px 30px rgba(108, 99, 255, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <EulerOwlIcon size={20} color="#FFFFFF" />
          <span>Ask Euler</span>
        </button>
      </div>

      {/* Slide-over Chat Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 84,
            right: 28,
            width: 'min(420px, calc(100vw - 32px))',
            height: 540,
            background: '#FFFFFF',
            borderRadius: 24,
            border: '1px solid rgba(11, 31, 58, 0.12)',
            boxShadow: '0 24px 70px rgba(11, 31, 58, 0.18)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '18px 20px',
              background: 'linear-gradient(135deg, #0B1F3A 0%, #1565C0 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <EulerOwlIcon size={22} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>Euler AI Copilot</div>
                <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.75)' }}>Autonomous Policy Intelligence</div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '16px 18px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              background: '#F8FAFD',
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {m.sender === 'ai' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <EulerOwlIcon size={14} color="var(--ai-accent)" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ai-accent)' }}>Euler</span>
                  </div>
                )}
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: m.sender === 'user' ? 'var(--primary-navy)' : '#FFFFFF',
                    color: m.sender === 'user' ? '#FFFFFF' : 'var(--text-heading)',
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    boxShadow: '0 2px 8px rgba(11, 31, 58, 0.04)',
                    border: m.sender === 'user' ? 'none' : '1px solid rgba(11, 31, 58, 0.08)',
                  }}
                >
                  {m.text}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--text-dim)',
                    marginTop: 4,
                    textAlign: m.sender === 'user' ? 'right' : 'left',
                  }}
                >
                  {m.time}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#FFFFFF', borderRadius: 14, fontSize: 12, color: 'var(--text-muted)' }}>
                <EulerOwlIcon size={15} color="var(--ai-accent)" />
                <span>Euler is analyzing policies...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          <div style={{ padding: '10px 14px', background: '#FFFFFF', borderTop: '1px solid rgba(11, 31, 58, 0.06)', display: 'flex', gap: 6, overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (p.target) {
                    navigate(p.target);
                    setIsOpen(false);
                  } else {
                    handleSend(p.label);
                  }
                }}
                style={{
                  background: 'var(--bg-tinted)',
                  border: '1px solid rgba(21, 101, 192, 0.15)',
                  borderRadius: 9999,
                  padding: '6px 12px',
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: 'var(--blue-primary)',
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '12px 14px',
              background: '#FFFFFF',
              borderTop: '1px solid rgba(11, 31, 58, 0.08)',
              display: 'flex',
              gap: 8,
            }}
          >
            <input
              type="text"
              className="input-field"
              style={{ padding: '8px 14px', fontSize: 13, borderRadius: 9999 }}
              placeholder="Ask anything about policies or claims..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <button
              type="submit"
              className="btn-pill-primary"
              style={{ padding: '8px 16px', fontSize: 13, borderRadius: 9999 }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
