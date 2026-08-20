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
  Upload,
  Camera,
  File,
  Image as ImageIcon,
  Car,
} from 'lucide-react';
import { dashboardData, getDaysUntilExpiry } from '../data/dashboardData.js';
import './EulerChat.css';

const { user, policy } = dashboardData;
const daysRemaining = getDaysUntilExpiry(policy.expiryDate);

const quickActions = [
  { id: 'new', icon: Sparkles, label: 'New Insurance', route: '/new-insurance' },
  { id: 'renew', icon: RefreshCcw, label: 'Renew Policy', route: '/renewal' },
  { id: 'coverage', icon: ShieldCheck, label: 'My Coverage', route: '/policies' },
  { id: 'policy', icon: FileText, label: 'View Policy', route: '/policies' },
];

const attachmentOptions = [
  { id: 'vehicle-doc', icon: Car, label: 'Vehicle Document' },
  { id: 'insurance-policy', icon: ShieldCheck, label: 'Insurance Policy' },
  { id: 'rc', icon: FileText, label: 'Registration Certificate' },
  { id: 'image', icon: ImageIcon, label: 'Upload Image' },
  { id: 'pdf', icon: File, label: 'Upload PDF' },
];

// Voice state machine
const VOICE_STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  ERROR: 'error',
};

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
  const [voiceState, setVoiceState] = useState(VOICE_STATES.IDLE);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [ocrState, setOcrState] = useState(null); // null | 'uploading' | 'processing' | 'extracting' | 'completed' | 'error'

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      scrollToBottom();
    } else {
      stopVoiceRecognition();
      setShowAttachMenu(false);
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
    setVoiceState(VOICE_STATES.IDLE);
  };

  // Toggle Voice — Real-time voice UX
  const toggleVoiceInput = () => {
    if (voiceState !== VOICE_STATES.IDLE) {
      stopVoiceRecognition();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setVoiceState(VOICE_STATES.LISTENING);
        };

        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setInputValue(transcript);
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
          setVoiceState(VOICE_STATES.ERROR);
          setTimeout(() => {
            stopVoiceRecognition();
            runSimulatedVoiceInput();
          }, 1000);
        };

        recognition.onend = () => {
          if (voiceState === VOICE_STATES.LISTENING) {
            setVoiceState(VOICE_STATES.PROCESSING);
            setTimeout(() => setVoiceState(VOICE_STATES.IDLE), 800);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        runSimulatedVoiceInput();
      }
    } else {
      runSimulatedVoiceInput();
    }
  };

  // Simulated Voice Input Fallback
  const runSimulatedVoiceInput = () => {
    setVoiceState(VOICE_STATES.LISTENING);

    const sampleQueries = [
      "Can you explain my ICICI Lombard auto insurance coverage?",
      "When does my policy expire and how do I renew?",
      "How do I start a new insurance application?",
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
        setVoiceState(VOICE_STATES.PROCESSING);
        setTimeout(() => setVoiceState(VOICE_STATES.IDLE), 600);
      }
    }, 45);
  };

  // Attachment handling
  const handleAttachment = (option) => {
    setShowAttachMenu(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate OCR flow
    setOcrState('uploading');
    const userMsg = {
      id: `user-upload-${Date.now()}`,
      role: 'user',
      content: `📄 Uploaded: ${file.name}`,
      type: 'upload',
    };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      setOcrState('processing');
      setTimeout(() => {
        setOcrState('extracting');
        setTimeout(() => {
          setOcrState('completed');
          const eulerMsg = {
            id: `euler-ocr-${Date.now()}`,
            role: 'euler',
            content: `I found a vehicle document.\n\n**Extracted Information:**\n• Registration: **KA-01-XX-0000**\n• Make: **Hyundai**\n• Model: **Creta**\n• Variant: **SX(O) Turbo**\n• Year: **2023**\n\nWould you like me to use these details for your new insurance application?`,
            type: 'ocr-result',
            actions: ['Use Details', 'Review', 'Cancel'],
          };
          setMessages((prev) => [...prev, eulerMsg]);
          setTimeout(() => setOcrState(null), 1500);
        }, 1200);
      }, 1000);
    }, 800);

    // Reset file input
    e.target.value = '';
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

  const getVoiceLabel = () => {
    switch (voiceState) {
      case VOICE_STATES.LISTENING: return 'Listening...';
      case VOICE_STATES.PROCESSING: return 'Thinking...';
      case VOICE_STATES.SPEAKING: return 'Euler is responding...';
      case VOICE_STATES.ERROR: return 'Something went wrong';
      default: return 'Talk to Euler';
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
            <div className="euler-chat-subtitle">Insurance Assistant</div>
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
              {/* OCR action buttons */}
              {msg.actions && (
                <div className="euler-ocr-actions">
                  {msg.actions.map((action) => (
                    <button
                      key={action}
                      className={`euler-ocr-action-btn${action === 'Use Details' ? ' euler-ocr-action-btn--primary' : ''}`}
                      onClick={() => {
                        if (action === 'Use Details') {
                          onClose();
                          navigate('/new-insurance');
                        }
                      }}
                    >
                      {action}
                    </button>
                  ))}
                </div>
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

      {/* OCR Progress Toast */}
      {ocrState && (
        <div className="euler-ocr-toast" aria-live="assertive">
          <div className={`euler-ocr-progress euler-ocr-progress--${ocrState}`}>
            <div className="euler-ocr-spinner" />
            <span>
              {ocrState === 'uploading' && 'Uploading document...'}
              {ocrState === 'processing' && 'Processing document...'}
              {ocrState === 'extracting' && 'Extracting information...'}
              {ocrState === 'completed' && '✓ Extraction complete'}
              {ocrState === 'error' && '✕ Extraction failed'}
            </span>
          </div>
        </div>
      )}

      {/* Voice Status */}
      {voiceState !== VOICE_STATES.IDLE && (
        <div className="euler-voice-toast" aria-live="assertive">
          <div className={`euler-voice-indicator euler-voice-indicator--${voiceState}`}>
            {voiceState === VOICE_STATES.LISTENING && (
              <div className="euler-voice-waves" aria-hidden="true">
                <span /><span /><span /><span /><span />
              </div>
            )}
            {voiceState === VOICE_STATES.PROCESSING && (
              <div className="euler-voice-pulse" aria-hidden="true" />
            )}
            {voiceState === VOICE_STATES.ERROR && (
              <X size={14} />
            )}
          </div>
          <span className="euler-voice-toast-text">{getVoiceLabel()}</span>
          {voiceState === VOICE_STATES.ERROR && (
            <button className="euler-voice-retry" onClick={toggleVoiceInput}>Try Again</button>
          )}
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
          placeholder={voiceState === VOICE_STATES.LISTENING ? "Listening..." : "Ask Euler anything..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Message input"
        />
        <button
          className={`euler-chat-voice${voiceState !== VOICE_STATES.IDLE ? ' euler-chat-voice--active' : ''}`}
          onClick={toggleVoiceInput}
          aria-label={voiceState !== VOICE_STATES.IDLE ? "Stop voice" : "Start voice"}
          title={voiceState !== VOICE_STATES.IDLE ? "Stop" : "Voice input"}
        >
          {voiceState !== VOICE_STATES.IDLE ? <MicOff size={16} /> : <Mic size={16} />}
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
  if (lower.includes('upload') || lower.includes('document') || lower.includes('extract')) {
    return `You can upload documents using the **+** button next to the input field.\n\nI support:\n• Vehicle Registration Certificate\n• Existing Insurance Policy\n• Aadhaar Card\n• Photos of documents\n\nI'll extract the details automatically and help fill your application.`;
  }
  return `I'm here to help with your auto insurance.\n\nI can explain your coverage, help with renewal, assist with a new policy, or answer any questions about your ICICI Lombard policy.`;
}
