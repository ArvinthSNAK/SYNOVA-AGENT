import React, { useEffect, useState } from 'react';
import { AudioLines, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VoiceResponse({ text }) {
    const [speaking, setSpeaking] = useState(false);

    useEffect(() => {
        if (!('speechSynthesis' in window)) return undefined;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-IN';
        utterance.rate = 0.96;
        utterance.pitch = 1;
        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        return () => window.speechSynthesis.cancel();
    }, [text]);

    return <motion.div className="voice-response" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="voice-response-head"><span><AudioLines size={16} /> SYNOVA {speaking ? 'SPEAKING' : 'VOICE REPLY'}</span><Volume2 size={15} /></div>
        <div className="voice-response-wave">{[16, 27, 38, 23, 44, 30, 19, 35, 24, 40, 17].map((height, index) => <i key={index} style={{ height }} />)}</div>
        <p>{text}</p>
    </motion.div>;
}