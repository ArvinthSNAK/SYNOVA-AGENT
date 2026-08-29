import React from 'react';
import { UserRound } from 'lucide-react';
import ResponseCard from './ResponseCard';

export default function ConversationPanel({ messages, onSelectOption, onNavigate }) {
    return (
        <div className="conversation-panel">
            <div className="welcome-block">
                <span className="welcome-orbit">
                    <span />
                </span>
                <p className="section-kicker">REALTIME VOICE ADVISOR</p>
                <h1>
                    SYNOVA AI<br />
                    <span>Insurance Guide</span>
                </h1>
                <p className="welcome-copy">
                    Speak naturally to find the best policy, renew existing coverage, or calculate quotes with instant form autofill.
                </p>
            </div>

            {messages.map((message) => (
                <div key={message.id} className="conversation-item">
                    {message.text && (
                        <div className="user-message">
                            <UserRound size={15} /> {message.text}
                        </div>
                    )}
                    {message.reply && (
                        <ResponseCard
                            type={message.type}
                            mode={message.mode}
                            text={message.reply}
                            event={message.event}
                            autofillData={message.autofillData}
                            targetUrl={message.targetUrl}
                            isGreeting={message.isGreeting}
                            onSelectOption={onSelectOption}
                            onNavigate={onNavigate}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}