import { useEffect, useRef } from 'react';

export default function useAutoScroll(dependency) {
    const ref = useRef(null);
    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [dependency]);
    return ref;
}