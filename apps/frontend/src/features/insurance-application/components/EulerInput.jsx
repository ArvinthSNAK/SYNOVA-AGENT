import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Plus, FileText, ShieldCheck, Car, Image as ImageIcon, File } from 'lucide-react';
import './EulerInput.css';

const attachmentOptions = [
  { id: 'vehicle-doc', icon: Car, label: 'Vehicle Document (RC)' },
  { id: 'insurance-policy', icon: ShieldCheck, label: 'Insurance Policy' },
  { id: 'rc', icon: FileText, label: 'Registration Certificate' },
  { id: 'image', icon: ImageIcon, label: 'Upload Image (PNG, JPG)' },
  { id: 'pdf', icon: File, label: 'Upload PDF' },
];

// ─── Voice state manager ──────────────────────────────────────────────────────
function useVoiceInput(onTranscript) {
  const [voiceState, setVoiceState] = useState('idle'); // idle | listening | processing | completed
  const recognitionRef = useRef(null);

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch (e) {}
    recognitionRef.current = null;
    setVoiceState('idle');
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onstart = () => setVoiceState('listening');
        recognition.onresult = (e) => {
          let transcript = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            transcript += e.results[i][0].transcript;
          }
          onTranscript(transcript);
          if (e.results[e.resultIndex]?.isFinal) {
            setVoiceState('completed');
            setTimeout(() => setVoiceState('idle'), 1000);
          }
        };
        recognition.onerror = () => { stopListening(); runSimulated(); };
        recognition.onend = () => { if (voiceState === 'listening') setVoiceState('idle'); };

        recognitionRef.current = recognition;
        recognition.start();
      } catch {
        runSimulated();
      }
    } else {
      runSimulated();
    }
  };

  const runSimulated = () => {
    setVoiceState('listening');
    const sampleText = '2023 Hyundai Creta petrol registered in Bangalore';
    let current = '';
    let i = 0;
    const interval = setInterval(() => {
      if (i < sampleText.length) {
        current += sampleText[i];
        onTranscript(current);
        i++;
      } else {
        clearInterval(interval);
        setVoiceState('completed');
        setTimeout(() => setVoiceState('idle'), 800);
      }
    }, 40);
  };

  const toggle = () => {
    if (voiceState !== 'idle') { stopListening(); return; }
    startListening();
  };

  useEffect(() => () => stopListening(), []);

  return { voiceState, toggle };
}

// ─── Voice state label ────────────────────────────────────────────────────────
function voiceStateLabel(state) {
  if (state === 'listening') return 'Listening...';
  if (state === 'processing') return 'Understanding your vehicle details...';
  if (state === 'completed') return 'Got it.';
  return '';
}

// ─── EulerInput component ─────────────────────────────────────────────────────
export default function EulerInput({ onSend, onDocumentUpload, disabled, placeholder }) {
  const [value, setValue] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const { voiceState, toggle: toggleVoice } = useVoiceInput((transcript) => {
    setValue(transcript);
  });

  const isListening = voiceState !== 'idle';

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachmentClick = () => {
    setShowAttachMenu(false);
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onDocumentUpload) {
      onDocumentUpload(file);
    }
    // reset file input
    e.target.value = '';
  };

  return (
    <div className="euler-input-wrap">
      {/* Voice status banner */}
      {isListening && (
        <div className="euler-voice-banner" aria-live="polite">
          <div className="euler-voice-waveform" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <span>{voiceStateLabel(voiceState)}</span>
        </div>
      )}

      {/* Attachment popover menu */}
      {showAttachMenu && (
        <div className="euler-attach-popup" role="menu" aria-label="Upload document options">
          <div className="euler-attach-popup-header">Upload Document to Euler</div>
          {attachmentOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                className="euler-attach-popup-item"
                role="menuitem"
                onClick={handleAttachmentClick}
              >
                <Icon size={15} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileSelected}
        aria-hidden="true"
      />

      <div className="euler-input-row">
        {/* + Attachment Button */}
        <button
          className={`euler-input-btn euler-input-btn--plus${showAttachMenu ? ' euler-input-btn--plus-active' : ''}`}
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          aria-label="Upload document to Euler"
          title="Upload document"
          type="button"
        >
          <Plus size={18} />
        </button>

        <input
          ref={inputRef}
          type="text"
          className="euler-input-field"
          placeholder={isListening ? 'Listening...' : placeholder || 'Tell Euler about your vehicle...'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isListening}
          aria-label="Message to Euler"
        />

        <button
          className={`euler-input-btn euler-input-btn--voice${isListening ? ' euler-input-btn--active' : ''}`}
          onClick={toggleVoice}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          title={isListening ? 'Stop' : 'Use voice'}
          type="button"
        >
          {isListening ? <MicOff size={15} /> : <Mic size={15} />}
        </button>

        <button
          className="euler-input-btn euler-input-btn--send"
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          aria-label="Send message"
          title="Send"
          type="button"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
