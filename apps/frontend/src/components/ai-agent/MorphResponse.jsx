import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ThinkingCard from './ThinkingCard';
import StreamingResponse from './StreamingResponse';

export default function MorphResponse({ text, children }) {
    const [streaming, setStreaming] = useState(false);
    const [complete, setComplete] = useState(false);
    const handleComplete = useCallback(() => { setComplete(true); setStreaming(false); }, []);
    useEffect(() => { const timer = setTimeout(() => setStreaming(true), 1400); return () => clearTimeout(timer); }, []);
    return <motion.div layout className="morph-response"><AnimatePresence mode="popLayout" initial><>{!streaming && !complete && <ThinkingCard key="thinking" />}{(streaming || complete) && <motion.div key="response" layout initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .42 }}><StreamingResponse text={text} active={streaming} onComplete={handleComplete} />{complete && children}</motion.div>}</></AnimatePresence></motion.div>;
}
