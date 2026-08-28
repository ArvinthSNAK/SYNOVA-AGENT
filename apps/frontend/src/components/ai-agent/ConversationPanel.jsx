import React from 'react';
import { UserRound } from 'lucide-react';
import ResponseCard from './ResponseCard';

export default function ConversationPanel({ messages }) {
    return <div className="conversation-panel"><div className="welcome-block"><span className="welcome-orbit"><span /></span><p className="section-kicker">GOOD MORNING, ARVINTH</p><h1>What should we<br /><span>protect next?</span></h1><p className="welcome-copy">I can read the fine print, compare your options, and make insurance feel refreshingly simple.</p></div>{messages.map((message) => <div key={message.id} className="conversation-item"><div className="user-message"><UserRound size={15} /> {message.text}</div>{message.reply && <ResponseCard type={message.type} mode={message.mode} text={message.reply} />}</div>)}</div>;
}