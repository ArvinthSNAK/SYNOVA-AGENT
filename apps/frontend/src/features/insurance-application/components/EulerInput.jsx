import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';

// ─── Voice state manager ──────────────────────────────────────────────────────
// Structured so real Web Speech API / backend STT can be connected later.
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
export default function EulerInput({ onSend, disabled, placeholder }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

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

  return (
    <div className="euler-input-wrap">
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
      <div className="euler-input-row">
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
