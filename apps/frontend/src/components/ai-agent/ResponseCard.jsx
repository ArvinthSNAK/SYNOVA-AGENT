import React from 'react';
import { Check, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import MorphResponse from './MorphResponse';
import VoiceResponse from './VoiceResponse';

const responseText = {
    summary: 'Your current policy is healthy overall. It expires in 42 days, with comprehensive cover of ₹5,00,000. I found one medium-risk gap worth addressing before renewal.',
    renewal: 'Your renewal is worth starting now. You have 42 days remaining, and renewing before expiry should preserve your 20% No Claim Bonus.',
    expiry: 'Your policy expires on 15 Jan 2027. That gives you 42 days to compare renewal options and avoid a break in coverage.',
    new: 'For a new policy, I recommend starting with comprehensive cover and a ₹5,00,000 IDV. I can compare plans after you share your vehicle details.',
    claim: 'Your claim looks straightforward to start. Notify the insurer within 48 hours and keep your FIR, photos, and policy schedule ready.',
    compare: 'I reviewed the available options. ACKO is the strongest value for your current profile, with comparable comprehensive protection at a lower premium.',
    score: 'Your protection is in good shape. Your insurance health score is 82 out of 100, with two small gaps to close before renewal.',
    general: 'I can explain insurance terms, policy coverage, claims, renewals, expiry dates, and insurer comparisons in plain language.',
};

export default function ResponseCard({ type = 'summary', mode = 'text', text }) {
    const response = text || responseText[type] || responseText.general;
    if (mode === 'voice') return <VoiceResponse text={response} />;
    return (
        <motion.div className="response-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="response-card-head"><span><Sparkles size={16} /> SYNOVA ANALYSIS</span><small>Just now</small></div>
            <MorphResponse text={response}>
                {type === 'compare' ? <Comparison /> : type === 'score' ? <Score /> : <Summary type={type} />}
            </MorphResponse>
        </motion.div>
    );
}

function Summary({ type }) {
    const claim = type === 'claim';
    const expiry = type === 'expiry';
    const renewal = type === 'renewal';
    const fresh = type === 'new';
    const general = type === 'general';
    const heading = claim ? 'Your claim, made clearer.' : expiry ? 'Your expiry date, at a glance.' : renewal ? 'A smoother renewal starts here.' : fresh ? 'A strong foundation for new cover.' : general ? 'Here is how I can help.' : 'Your coverage, at a glance.';
    const recommendation = claim ? 'Notify the insurer within 48 hours and keep your FIR, photos, and policy schedule ready.' : expiry ? 'Set a reminder 30 days before expiry so you have time to compare plans.' : renewal ? 'Renew before expiry to preserve your 20% No Claim Bonus and avoid a coverage gap.' : fresh ? 'Share your vehicle details and I will narrow down suitable comprehensive plans.' : general ? 'Ask about one topic at a time for a focused insurance recommendation.' : 'Renew within 30 days to preserve your 20% No Claim Bonus and avoid a coverage gap.';
    return <><h3>{heading}</h3>{!general && <div className="response-stats"><div><span>Coverage</span><strong>₹5,00,000</strong></div><div><span>Expiry</span><strong>15 Jan 2027</strong></div><div><span>Vehicle</span><strong>KA-01-MJ-8821</strong></div></div>}<div className="recommendation"><ShieldCheck size={20} /><div><b>Recommendation</b><p>{recommendation}</p></div></div></>;
}

function Comparison() {
    const providers = [['ACKO', '₹15,200', true], ['ICICI Lombard', '₹16,800', false], ['HDFC ERGO', '₹17,100', false]];
    return <><h3>Three strong options for your renewal.</h3><div className="quote-list">{providers.map(([name, price, best]) => <div className={`quote-row ${best ? 'is-best' : ''}`} key={name}><span className="provider-logo">{name.slice(0, 1)}</span><b>{name}</b><strong>{price}</strong>{best && <em>Recommended</em>}</div>)}</div></>;
}

function Score() {
    return <><h3>Your protection is in good shape.</h3><div className="score-layout"><div className="score-ring"><span>82<small>/100</small></span></div><div><b>Insurance health score</b><p>Strong foundation. A higher personal accident cover and roadside assistance would close your two biggest gaps.</p></div></div><div className="score-tags"><span><Check size={13} /> Comprehensive cover</span><span><TrendingUp size={13} /> NCB preserved</span></div></>;
}