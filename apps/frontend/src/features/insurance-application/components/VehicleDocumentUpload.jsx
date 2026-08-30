import React, { useRef, useState } from 'react';
import { Upload, FileText, Check, AlertCircle, X, ChevronRight, Edit2 } from 'lucide-react';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE_MB = 10;

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VehicleDocumentUpload({
  onUpload,
  extractionStatus,
  extractedData,
  vehicle,
  onEditManually,
  onContinue,
  vehicleComplete,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [localFile, setLocalFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const handleFile = (file) => {
    if (!file) return;
    setFileError('');

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Please upload a PDF, JPG, or PNG file.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File must be smaller than ${MAX_SIZE_MB} MB.`);
      return;
    }

    setLocalFile(file);
    onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  // ─── Upload idle state ────────────────────────────────────────────────────
  if (!localFile && extractionStatus === 'idle') {
    return (
      <div className="vdu-panel">
        <div
          className={`vdu-dropzone${dragOver ? ' vdu-dropzone--drag' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragOver(false)}
          role="button"
          tabIndex={0}
          aria-label="Upload vehicle document. Click or drag and drop."
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="vdu-file-input"
            onChange={(e) => handleFile(e.target.files[0])}
            aria-label="Select vehicle document file"
          />
          <div className="vdu-dropzone-icon" aria-hidden="true">
            <Upload size={22} />
          </div>
          <div className="vdu-dropzone-title">Upload RC / Vehicle Document</div>
          <div className="vdu-dropzone-sub">Drag & drop or click to browse</div>
          <div className="vdu-dropzone-types">PDF · JPG · PNG · Max 10 MB</div>
        </div>

        {fileError && (
          <div className="vdu-error" role="alert">
            <AlertCircle size={13} />
            {fileError}
          </div>
        )}

        <p className="vdu-security-note">
          Your document is securely processed. Only information required for your insurance application is used.
        </p>

        <button className="vdu-manual-link" onClick={onEditManually} type="button">
          Enter vehicle details manually instead
        </button>
      </div>
    );
  }

  // ─── Uploading ────────────────────────────────────────────────────────────
  if (extractionStatus === 'uploading') {
    return (
      <div className="vdu-panel">
        <div className="vdu-processing">
          <div className="vdu-processing-file">
            <FileText size={18} aria-hidden="true" />
            <span>{localFile?.name}</span>
            <span className="vdu-file-size">{formatFileSize(localFile?.size || 0)}</span>
          </div>
          <div className="vdu-processing-status">
            <div className="vdu-spinner" aria-hidden="true" />
            <span>Uploading...</span>
          </div>
          <div className="vdu-progress-bar"><div className="vdu-progress-fill vdu-progress-fill--uploading" /></div>
        </div>
      </div>
    );
  }

  // ─── Processing / OCR ─────────────────────────────────────────────────────
  if (extractionStatus === 'processing') {
    return (
      <div className="vdu-panel">
        <div className="vdu-processing">
          <div className="vdu-processing-file">
            <FileText size={18} aria-hidden="true" />
            <span>{localFile?.name}</span>
          </div>
          <div className="vdu-processing-status">
            <div className="vdu-spinner" aria-hidden="true" />
            <span>Reading document...</span>
          </div>
          <div className="vdu-progress-bar"><div className="vdu-progress-fill vdu-progress-fill--processing" /></div>
        </div>
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (extractionStatus === 'error') {
    return (
      <div className="vdu-panel">
        <div className="vdu-error-state" role="alert">
          <AlertCircle size={20} />
          <h4>We couldn't read this document.</h4>
          <p>The file may be unclear or unsupported. Try uploading another file or enter your details manually.</p>
          <div className="vdu-error-actions">
            <button className="vi-btn vi-btn--secondary" onClick={() => { setLocalFile(null); }} type="button">
              Upload Another
            </button>
            <button className="vi-btn vi-btn--primary" onClick={onEditManually} type="button">
              Enter Manually
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Completed: show extracted fields ─────────────────────────────────────
  if (extractionStatus === 'completed' && extractedData) {
    return (
      <div className="vdu-panel">
        <div className="vdu-completed-header">
          <Check size={14} className="vdu-complete-check" aria-hidden="true" />
          <span>Information extracted</span>
        </div>

        <div className="vdu-extracted-fields">
          {[
            ['Registration Number', 'registrationNumber'],
            ['Make', 'make'],
            ['Model', 'model'],
            ['Year', 'year'],
            ['Fuel Type', 'fuelType'],
            ['Variant', 'variant'],
          ].map(([label, key]) => (
            <div key={key} className="vi-extraction-row">
              <span className="vi-extraction-label">{label}</span>
              <div className="vi-extraction-value-wrap">
                {vehicle[key] ? (
                  <>
                    <Check size={11} className="vi-check" aria-hidden="true" />
                    <span className="vi-extraction-value">{vehicle[key]}</span>
                  </>
                ) : (
                  <span className="vi-extraction-missing">Not found</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="vi-actions">
          <button className="vi-btn vi-btn--secondary" onClick={onEditManually} type="button">
            <Edit2 size={13} /> Edit Details
          </button>
          <button
            className="vi-btn vi-btn--primary"
            onClick={onContinue}
            disabled={!vehicleComplete}
            type="button"
          >
            Continue to Coverage <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
