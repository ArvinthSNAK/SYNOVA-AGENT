import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Eye, ChevronRight } from 'lucide-react';
import { dashboardData } from '../data/dashboardData.js';
import './DocumentsSummary.css';

const { documents } = dashboardData;

export default function DocumentsSummary() {
  const navigate = useNavigate();

  const handleDownload = (doc) => {
    alert(`Downloading: ${doc.name}.pdf`);
  };

  return (
    <section className="documents-summary" aria-label="Policy documents">
      <div className="docs-header">
        <h3 className="docs-title">Policy Documents</h3>
        <button
          className="docs-view-btn"
          onClick={() => navigate('/documents')}
          aria-label="View all documents"
        >
          All documents <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>

      <div className="docs-list">
        {documents.map((doc) => (
          <div key={doc.id} className="doc-row">
            <div className="doc-icon" aria-hidden="true">
              <FileText size={18} />
            </div>
            <div className="doc-info">
              <div className="doc-name">{doc.name}</div>
              <div className="doc-meta">
                <span className="doc-type">{doc.type}</span>
                <span className="doc-meta-dot" aria-hidden="true">·</span>
                <span className="doc-size">{doc.size}</span>
                <span className="doc-meta-dot" aria-hidden="true">·</span>
                <span className="doc-date">{doc.date}</span>
              </div>
            </div>
            <div className="doc-actions">
              <button
                className="doc-action-btn"
                aria-label={`View ${doc.name}`}
                onClick={() => navigate('/documents')}
                title="View"
              >
                <Eye size={15} aria-hidden="true" />
              </button>
              <button
                className="doc-action-btn doc-action-btn--download"
                aria-label={`Download ${doc.name}`}
                onClick={() => handleDownload(doc)}
                title="Download"
              >
                <Download size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
