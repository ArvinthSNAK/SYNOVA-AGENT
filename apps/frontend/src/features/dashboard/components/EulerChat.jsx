import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Send,
  Mic,
  MicOff,
  Sparkles,
  ShieldCheck,
  RefreshCcw,
  FileText,
  Circle,
  Volume2,
} from 'lucide-react';
import { dashboardData, getDaysUntilExpiry } from '../data/dashboardData.js';
import './EulerChat.css';

const { user, policy } = dashboardData;
const daysRemaining = getDaysUntilExpiry(policy.expiryDate);

const quickActions = [
  { id: 'new', icon: Sparkles, label: 'Find New Insurance', route: '/new-insurance' },
  { id: 'renew', icon: RefreshCcw, label: 'Renew My Policy', route: '/renewal' },
  { id: 'coverage', icon: ShieldCheck, label: 'Explain My Coverage', route: '/policies' },
  { id: 'policy', icon: FileText, label: 'View My Policy', route: '/policies' },
];

const initialMessages = [
  {
    id: 'euler-greeting',
    role: 'euler',
    content: `Good ${getGreeting()}, ${user.name}.\n\nYour ${policy.insurer} policy expires in **${daysRemaining} days**. Would you like me to help you prepare your renewal?\n\nYou currently have **comprehensive coverage** with zero-depreciation and roadside assistance on your Hyundai Creta.`,
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function renderMessage(content) {
  return content
    .split('**')
    .map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
}

export default function EulerChat({ open, onClose }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      scrollToBottom();
    } else {
      stopVoiceRecognition();
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      stopVoiceRecognition();
    };
  }, []);

  // Escape to close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = (overrideText) => {
    const text = (overrideText !== undefined ? overrideText : inputValue).trim();
    if (!text) return;

    const userMsg = { id: `user-${Date.now()}`, role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate Euler response
    setTimeout(() => {
      const eulerResponse = generateEulerResponse(text);
      setMessages((prev) => [
        ...prev,
        { id: `euler-${Date.now()}`, role: 'euler', content: eulerResponse },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  // Stop voice recognition
  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setVoiceStatus('');
  };

  // Toggle Voice Input
  const toggleVoiceInput = () => {
    if (isListening) {
      stopVoiceRecognition();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceStatus('Listening... Speak into mic');
        };

        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setInputValue(transcript);
          setVoiceStatus(`Captured: "${transcript}"`);
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
          stopVoiceRecognition();
          runSimulatedVoiceInput();
        };

        recognition.onend = () => {
          setIsListening(false);
          setVoiceStatus('');
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        runSimulatedVoiceInput();
      }
    } else {
      // Fallback voice simulation if browser Web Speech API is unssupported
      runSimulatedVoiceInput();
    }
  };

  // Simulated Voice Input Fallback
  const runSimulatedVoiceInput = () => {
    setIsListening(true);
    setVoiceStatus('Listening... (Voice mode active)');

    const sampleQueries = [
      "Can you explain my ICICI Lombard auto insurance coverage?",
      "When does my policy expire and how do I renew?",
      "How do I start a new insurance application for my vehicle?",
    ];
    const chosenQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];

    let currentText = "";
    let charIndex = 0;

    const interval = setInterval(() => {
      if (charIndex < chosenQuery.length) {
        currentText += chosenQuery[charIndex];
        setInputValue(currentText);
        charIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsListening(false);
          setVoiceStatus('');
        }, 600);
      }
    }, 45);
  };

  const handleQuickAction = (action) => {
    onClose();
    navigate(action.route);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open) return null;

  return (
    <div
      className="euler-chat-panel"
      role="dialog"
      aria-label="Euler Insurance Assistant"
      aria-modal="true"
    >
      {/* Header */}
      <div className="euler-chat-header">
        <div className="euler-chat-brand">
          <div className="euler-chat-logo" aria-hidden="true">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="euler-chat-name">Euler</div>
            <div className="euler-chat-subtitle">Your Insurance Assistant</div>
          </div>
        </div>
        <div className="euler-chat-status" aria-label="Euler is online">
          <Circle size={7} fill="var(--color-success)" color="var(--color-success)" aria-hidden="true" />
          <span>Online</span>
        </div>
        <button
          className="euler-chat-close"
          onClick={onClose}
          aria-label="Close Euler assistant"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="euler-chat-messages" aria-live="polite" aria-label="Conversation">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`euler-message euler-message--${msg.role}`}
          >
            {msg.role === 'euler' && (
              <div className="euler-message-avatar" aria-hidden="true">
                <Sparkles size={12} />
              </div>
            )}
            <div className="euler-message-bubble">
              {msg.content.split('\n').map((line, i) =>
                line ? <p key={i}>{renderMessage(line)}</p> : <br key={i} />
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="euler-message euler-message--euler" aria-label="Euler is typing">
            <div className="euler-message-avatar" aria-hidden="true">
              <Sparkles size={12} />
            </div>
            <div className="euler-typing-indicator">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Status Toast */}
      {isListening && (
        <div className="euler-voice-toast">
          <div className="euler-voice-pulse-icon">
            <Volume2 size={15} />
          </div>
          <span className="euler-voice-toast-text">{voiceStatus || 'Listening... Speak now'}</span>
        </div>
      )}

      {/* Quick Actions */}
      <div className="euler-quick-actions" aria-label="Quick actions">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              className="euler-quick-btn"
              onClick={() => handleQuickAction(action)}
              aria-label={action.label}
            >
              <Icon size={13} aria-hidden="true" />
              {action.label}
            </button>
          );
        })}
      </div>

      {/* Input */}
      <div className="euler-chat-input-wrap">
        <input
          ref={inputRef}
          type="text"
          className="euler-chat-input"
          placeholder={isListening ? "Listening to your voice..." : "Ask Euler anything..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Message input"
        />
        <button
          className={`euler-chat-voice${isListening ? ' euler-chat-voice--active' : ''}`}
          onClick={toggleVoiceInput}
          aria-label={isListening ? "Stop voice recording" : "Start voice recording"}
          title={isListening ? "Stop voice recording" : "Start voice recording"}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
        <button
          className="euler-chat-send"
          onClick={() => handleSend()}
          disabled={!inputValue.trim()}
          aria-label="Send message"
          title="Send"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

function generateEulerResponse(text) {
  const lower = text.toLowerCase();
  if (lower.includes('renew') || lower.includes('renewal')) {
    return `Your policy expires in **${daysRemaining} days**.\n\nI can help you renew your ${policy.insurer} policy instantly with the same details. Your NCB of **${policy.ncb}%** will be preserved.\n\nShall I take you to the renewal page?`;
  }
  if (lower.includes('coverage') || lower.includes('cover')) {
    return `Your comprehensive auto insurance covers:\n\n**Own Damage** · **Third Party Liability** · **Theft** · **Natural Disaster** · **Personal Accident**\n\nAdd-ons: Zero Depreciation, Roadside Assistance, Engine Protection.`;
  }
  if (lower.includes('claim')) {
    return `You have **0 active claims** this year, which qualifies you for a **${policy.ncb}% NCB** on renewal.\n\nTo file a new claim, I can guide you through the process step by step.`;
  }
  if (lower.includes('premium') || lower.includes('price')) {
    return `Your current annual premium is **₹18,450** for comprehensive coverage.\n\nFor your Hyundai Creta, this covers an IDV of **₹8.4L** with a deductible of **₹2,000**.`;
  }
  if (lower.includes('new') || lower.includes('another policy')) {
    return `I can help you explore new auto insurance options.\n\nTell me about the new vehicle, and I'll compare suitable plans from leading insurers.`;
  }
  return `I'm here to help with your auto insurance.\n\nI can explain your coverage, help with renewal, assist with a new policy, or answer any questions about your ICICI Lombard policy.`;
}
