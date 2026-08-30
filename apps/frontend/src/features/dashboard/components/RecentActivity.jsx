import React from 'react';
import { ClipboardList, FileText, ShieldCheck } from 'lucide-react';
import { dashboardData } from '../data/dashboardData.js';
import './RecentActivity.css';

const { activity } = dashboardData;

const activityIconMap = {
  application: ClipboardList,
  document: FileText,
  policy: ShieldCheck,
};

const activityColorMap = {
  application: 'var(--color-primary)',
  document: 'var(--color-text-muted)',
  policy: 'var(--color-success)',
};

export default function RecentActivity() {
  return (
    <section className="recent-activity" aria-label="Recent activity">
      <h3 className="activity-title">Recent Activity</h3>

      <div className="activity-list" role="list">
        {activity.map((item, index) => {
          const Icon = activityIconMap[item.type] || ClipboardList;
          const color = activityColorMap[item.type] || 'var(--color-primary)';

          return (
            <div key={item.id} className="activity-item" role="listitem">
              {/* Timeline connector */}
              {index < activity.length - 1 && (
                <div className="activity-connector" aria-hidden="true" />
              )}

              <div className="activity-icon" style={{ color }} aria-hidden="true">
                <Icon size={14} />
              </div>

              <div className="activity-content">
                <div className="activity-label">{item.label}</div>
                {item.detail && (
                  <div className="activity-detail">{item.detail}</div>
                )}
              </div>

              <div className="activity-date">{item.dateLabel}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
