import { useEffect, useState } from 'react';

export default function useStreamingText(text, { active = false, interval = 42, onComplete } = {}) {
    const [visibleText, setVisibleText] = useState(active ? '' : text);
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        if (!active) {
            setVisibleText(text);
            setIsStreaming(false);
            return undefined;
        }

        let cancelled = false;
        const words = text.trim().split(/\s+/);
        let index = 0;
        setVisibleText('');
        setIsStreaming(true);
        const timer = setInterval(() => {
            if (cancelled) return;
            index += 1;
            setVisibleText(words.slice(0, index).join(' '));
            if (index >= words.length) {
                clearInterval(timer);
                setIsStreaming(false);
                onComplete?.();
            }
        }, interval);

        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [active, interval, onComplete, text]);

    return { visibleText, isStreaming };
}