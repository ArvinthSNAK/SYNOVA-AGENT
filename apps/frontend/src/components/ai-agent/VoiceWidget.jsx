import React, { useEffect, useState } from 'react';
import { Mic, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VoiceWidget({ active, onToggle, onTranscript }) {
    const [speaking, setSpeaking] = useState(false);
    const [status, setStatus] = useState('Listening...');
    useEffect(() => {
        if (!active) return undefined;
        const timer = setInterval(() => setSpeaking((value) => !value), 2600);
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setStatus('Microphone ready');
            return () => clearInterval(timer);
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';
        recognition.onstart = () => setStatus('Listening...');
        recognition.onerror = () => setStatus('Still listening...');
        recognition.onend = () => {
            if (active) {
                try { recognition.start(); } catch (error) { /* recognition is already restarting */ }
            }
        };
        recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            if (result?.isFinal) {
                const transcript = result[0]?.transcript?.trim();
                if (transcript) onTranscript?.(transcript);
            }
        };
        try { recognition.start(); } catch (error) { setStatus('Microphone ready'); }
        return () => {
            clearInterval(timer);
            recognition.onend = null;
            recognition.stop();
        };
    }, [active, onTranscript]);
    if (!active) return <button className="voice-button" onClick={onToggle} aria-label="Start voice assistant"><Mic size={19} /></button>;
    return <motion.div className="voice-widget" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }}><div className="waveform">{[12, 25, 38, 20, 46, 28, 16, 34, 22].map((height, index) => <i key={index} style={{ height }} />)}</div><div><b>SYNOVA {speaking ? 'Speaking...' : status}</b><small>Speak naturally. The mic stays on until you stop.</small></div><button onClick={onToggle} aria-label="Stop voice assistant"><X size={17} /></button></motion.div>;
}