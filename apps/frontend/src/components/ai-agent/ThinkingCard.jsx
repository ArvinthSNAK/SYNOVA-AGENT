import React, { useEffect, useState } from 'react';
import { BrainCircuit } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const stages = ['Checking coverage...', 'Checking expiry...', 'Generating recommendations...'];

export default function ThinkingCard() {
    const [stage, setStage] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setStage((current) => (current + 1) % stages.length), 1150);
        return () => clearInterval(timer);
    }, []);
    return <motion.div className="thinking-card premium-thinking" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .98 }} transition={{ layout: { duration: .42 } }}><div className="thinking-brain"><BrainCircuit size={18} /></div><div><b>SYNOVA is analyzing</b><AnimatePresence mode="wait"><motion.small key={stages[stage]} initial={{ opacity: 0, y: 5, filter: 'blur(5px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -5, filter: 'blur(5px)' }} transition={{ duration: .28 }}>{stages[stage]}</motion.small></AnimatePresence></div><div className="thinking-pulse"><span /><span /><span /></div></motion.div>;
}