import React, { useRef, useState } from 'react';
import { Check, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UploadZone({ onClose }) {
    const inputRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [done, setDone] = useState(false);
    const startUpload = () => { setProgress(12); const timer = setInterval(() => setProgress((value) => { if (value >= 100) { clearInterval(timer); setDone(true); return 100; } return value + 22; }), 180); };
    return <motion.div className="upload-popover" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (event.dataTransfer.files.length) startUpload(); }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><button className="upload-close" onClick={onClose}>×</button>{done ? <div className="upload-success"><span><Check /></span><b>Policy received</b><small>Ready for SYNOVA analysis.</small></div> : <><div className="upload-icon"><UploadCloud size={24} /></div><b>Drop your policy document here</b><small>or <button onClick={() => inputRef.current?.click()}>Browse files</button></small><input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" hidden onChange={startUpload} /><div className="upload-formats"><span>PDF</span><span>PNG</span><span>JPG</span></div>{progress > 0 && <div className="upload-progress"><i style={{ width: `${progress}%` }} /></div>}</>}</motion.div>;
}