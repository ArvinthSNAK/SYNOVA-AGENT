import React from 'react';
import { motion } from 'framer-motion';
import useStreamingText from '../../hooks/useStreamingText';
import useAutoScroll from '../../hooks/useAutoScroll';

export default function StreamingResponse({ text, active, onComplete }) {
    const { visibleText, isStreaming } = useStreamingText(text, { active, onComplete });
    const endRef = useAutoScroll(visibleText);
    const lines = visibleText.split('\n');
    return <div className="streaming-response">{lines.map((line, index) => <motion.p key={`${index}-${line}`} initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: .38 }}><span>{line || '\u00a0'}</span>{isStreaming && index === lines.length - 1 && <i className="stream-cursor" />}</motion.p>)}<span ref={endRef} /></div>;
}