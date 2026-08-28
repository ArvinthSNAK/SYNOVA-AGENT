import React from 'react';
import { Activity, BarChart3, CalendarClock, FileSearch, FileWarning, GitCompareArrows, Plus, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const actions = [
    { title: 'Buy new insurance', detail: 'Find a plan built for you', icon: Plus },
    { title: 'Renew existing policy', detail: 'Avoid a coverage gap', icon: RefreshCcw },
    { title: 'Analyze policy', detail: 'See what is really covered', icon: FileSearch },
    { title: 'File a claim', detail: 'Get step-by-step guidance', icon: FileWarning },
    { title: 'Check expiry date', detail: 'Stay ahead of renewals', icon: CalendarClock },
    { title: 'Insurance health score', detail: 'Measure your protection', icon: Activity },
    { title: 'Compare policies', detail: 'Make the smarter switch', icon: GitCompareArrows },
    { title: 'See premium trends', detail: 'Understand your pricing', icon: BarChart3 },
];

export default function QuickActions({ onAction }) {
    return (
        <section className="quick-actions">
            <div className="section-kicker">START WITH A SIGNAL</div>
            <div className="quick-actions-grid">
                {actions.map(({ title, detail, icon: Icon }, index) => (
                    <motion.button key={title} className="quick-action-card" onClick={() => onAction(title)} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.055, duration: 0.35 }} whileHover={{ y: -4, scale: 1.015 }} whileTap={{ scale: 0.98 }}>
                        <span className="quick-action-icon"><Icon size={19} /></span>
                        <span><strong>{title}</strong><small>{detail}</small></span>
                    </motion.button>
                ))}
            </div>
        </section>
    );
}