import React from 'react';
import { Check, ShieldCheck, Sparkles, TrendingUp, Car, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import MorphResponse from './MorphResponse';
import VoiceResponse from './VoiceResponse';

export default function ResponseCard({
    type = 'summary',
    mode = 'text',
    text,
    event,
    autofillData,
    targetUrl,
    onNavigate,
    onSelectOption,
    isGreeting,
}) {
    if (mode === 'voice' && !event?.startsWith('autofill') && !isGreeting && event !== 'ask_renewal_pdf') {
        return <VoiceResponse text={text} />;
    }

    return (
        <motion.div className="response-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="response-card-head">
                <span>
                    <Sparkles size={16} /> SYNOVA ADVISOR
                </span>
                <small>Live</small>
            </div>

            <div style={{ margin: '14px 0', fontSize: 13.5, lineHeight: 1.6, color: '#1E293B' }}>
                <FormattedText text={text} />
            </div>

            {/* If Initial Greeting: Show Quick Choice Pills */}
            {isGreeting && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                    <button
                        type="button"
                        onClick={() => onSelectOption?.('I want to buy a new motor insurance policy')}
                        style={{
                            padding: '8px 14px',
                            borderRadius: 20,
                            border: '1px solid #93C5FD',
                            background: '#EFF6FF',
                            color: '#1D4ED8',
                            fontSize: 12.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        <Car size={15} />
                        <span>Buy New Motor Insurance</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectOption?.('I want to renew my existing insurance policy')}
                        style={{
                            padding: '8px 14px',
                            borderRadius: 20,
                            border: '1px solid #C7D2FE',
                            background: '#EEF2FF',
                            color: '#4338CA',
                            fontSize: 12.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        <RefreshCw size={14} />
                        <span>Renew Existing Policy</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectOption?.('I want to explore health insurance')}
                        style={{
                            padding: '8px 14px',
                            borderRadius: 20,
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            color: '#1C1C1C',
                            fontSize: 12.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        🏥 Health Insurance
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectOption?.('I want to explore term life insurance')}
                        style={{
                            padding: '8px 14px',
                            borderRadius: 20,
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            color: '#1C1C1C',
                            fontSize: 12.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        🛡️ Term Life Insurance
                    </button>
                </div>
            )}

            {/* If Renewal PDF Question: Show Yes / No Choice Pills */}
            {(event === 'ask_renewal_pdf' || text?.toLowerCase().includes('do you have your previous policy pdf')) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                    <button
                        type="button"
                        onClick={() => onSelectOption?.('Yes, I have my previous policy PDF')}
                        style={{
                            padding: '8px 14px',
                            borderRadius: 20,
                            border: '1px solid #10B981',
                            background: '#ECFDF5',
                            color: '#065F46',
                            fontSize: 12.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        📄 Yes, I have policy PDF
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectOption?.('No, enter details manually')}
                        style={{
                            padding: '8px 14px',
                            borderRadius: 20,
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            color: '#475569',
                            fontSize: 12.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        ✍️ No, enter details manually
                    </button>
                </div>
            )}

            {/* If Autofill Data Ready: Show Extracted Data Table and Proceed Button */}
            {(event === 'autofill_ready_new' || event === 'autofill_ready_renew' || autofillData) && (
                <div
                    style={{
                        marginTop: 16,
                        padding: 16,
                        borderRadius: 12,
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#059669', fontWeight: 700, fontSize: 13 }}>
                        <CheckCircle2 size={16} />
                        <span>Extracted Data for Automatic Form Population</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 14 }}>
                        {autofillData?.vehicle_registration && (
                            <div style={{ padding: '8px 10px', background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                                <small style={{ color: '#6B6B6B', display: 'block', fontSize: 10, fontWeight: 600 }}>REGISTRATION</small>
                                <strong style={{ color: '#1E293B', fontSize: 12.5 }}>{autofillData.vehicle_registration}</strong>
                            </div>
                        )}
                        {autofillData?.vehicle_make && (
                            <div style={{ padding: '8px 10px', background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                                <small style={{ color: '#6B6B6B', display: 'block', fontSize: 10, fontWeight: 600 }}>MAKE & MODEL</small>
                                <strong style={{ color: '#1E293B', fontSize: 12.5 }}>{autofillData.vehicle_make} {autofillData.vehicle_model}</strong>
                            </div>
                        )}
                        {autofillData?.idv && (
                            <div style={{ padding: '8px 10px', background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                                <small style={{ color: '#6B6B6B', display: 'block', fontSize: 10, fontWeight: 600 }}>INSURED VALUE (IDV)</small>
                                <strong style={{ color: '#059669', fontSize: 12.5 }}>₹{parseInt(autofillData.idv, 10).toLocaleString('en-IN')}</strong>
                            </div>
                        )}
                        {autofillData?.ncb_percent !== undefined && (
                            <div style={{ padding: '8px 10px', background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                                <small style={{ color: '#6B6B6B', display: 'block', fontSize: 10, fontWeight: 600 }}>NCB DISCOUNT</small>
                                <strong style={{ color: '#2563EB', fontSize: 12.5 }}>{autofillData.ncb_percent}%</strong>
                            </div>
                        )}
                        {autofillData?.previous_insurer && (
                            <div style={{ padding: '8px 10px', background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                                <small style={{ color: '#6B6B6B', display: 'block', fontSize: 10, fontWeight: 600 }}>PREVIOUS INSURER</small>
                                <strong style={{ color: '#1E293B', fontSize: 12.5 }}>{autofillData.previous_insurer}</strong>
                            </div>
                        )}
                    </div>

                    {targetUrl && (
                        <button
                            type="button"
                            onClick={() => onNavigate?.(targetUrl)}
                            style={{
                                width: '100%',
                                padding: '12px 18px',
                                borderRadius: 10,
                                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                                color: '#FFFFFF',
                                fontSize: 13.5,
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                            }}
                        >
                            <span>
                                {event === 'autofill_ready_renew' ? 'Proceed to Instant Renewal (Autofilled)' : 'Proceed to Compare Quotes (Autofilled)'}
                            </span>
                            <ArrowRight size={16} />
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
}

function FormattedText({ text }) {
    if (!text) return null;
    const lines = text.split('\n');
    return (
        <div>
            {lines.map((line, idx) => {
                if (!line.trim()) return <div key={idx} style={{ height: 6 }} />;
                
                // Parse bold **text**
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                    <p key={idx} style={{ margin: '2px 0' }}>
                        {parts.map((p, pIdx) => {
                            if (p.startsWith('**') && p.endsWith('**')) {
                                return <strong key={pIdx} style={{ color: '#0F172A' }}>{p.slice(2, -2)}</strong>;
                            }
                            return p;
                        })}
                    </p>
                );
            })}
        </div>
    );
}