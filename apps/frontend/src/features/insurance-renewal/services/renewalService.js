// SYNOVA — Renewal Service Layer
// All API calls for Journey 3 go through this file.
// Replace mock implementations with real fetch/axios calls when backend is ready.
//
// Integration points:
//   POST /api/renewal/documents        → uploadPolicyDocument()
//   POST /api/renewal/extract          → extractPolicyFromDocument()
//   GET  /api/renewal/extraction/:id   → getExtractionStatus()
//   POST /api/renewal/:id              → createRenewal()
//   PATCH /api/renewal/:id             → updateRenewal()
//   POST /api/renewal/quotes           → requestRenewalQuotes()
//   GET  /api/renewal/quotes/:id       → getRenewalQuoteStatus()
//   POST /api/renewal/quotes/:id/select → selectRenewalQuote()

import {
  policyExtractionMock,
  renewalQuoteResults,
  renewalProviders,
  RENEWAL_ID,
} from '../data/renewalMockData.js';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ─── Renewal CRUD ─────────────────────────────────────────────────────────────

/**
 * POST /api/renewal
 * Creates a renewal application draft.
 */
export async function createRenewal() {
  await delay(300);
  return {
    renewalId: RENEWAL_ID,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
}

/**
 * PATCH /api/renewal/:id
 * Updates renewal data (policy, vehicle, coverage, etc.)
 */
export async function updateRenewal(renewalId, data) {
  await delay(200);
  return { renewalId, ...data, updatedAt: new Date().toISOString() };
}

// ─── Document Upload & OCR ────────────────────────────────────────────────────

/**
 * POST /api/renewal/documents
 * Uploads the existing policy PDF/image.
 * In production: multipart POST to OCR service (Google Vision, Textract, etc.)
 */
export async function uploadPolicyDocument(file) {
  await delay(1200); // Simulate upload time
  return {
    success: true,
    documentId: `PDOC-${Date.now()}`,
    fileName: file?.name || 'policy.pdf',
    fileSize: file?.size || 0,
    mimeType: file?.type || 'application/pdf',
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * POST /api/renewal/extract
 * Triggers OCR extraction on the uploaded document.
 * Simulates staged extraction progress.
 *
 * In production: backend OCR pipeline processes document,
 * updates extraction status, and returns structured fields
 * with confidence scores.
 */
export async function extractPolicyFromDocument(documentId, onStageProgress) {
  // Simulate staged OCR processing with progress callbacks
  const stages = ['upload', 'detect', 'policy', 'vehicle', 'coverage', 'expiry'];

  for (let i = 0; i < stages.length; i++) {
    await delay(800);
    if (onStageProgress) {
      onStageProgress(stages[i], i);
    }
  }

  return {
    success: true,
    extractionId: `EXT-${Date.now()}`,
    extracted: policyExtractionMock,
    completedAt: new Date().toISOString(),
  };
}

// ─── Quote Generation ─────────────────────────────────────────────────────────

/**
 * POST /api/renewal/quotes
 * Submits renewal application and triggers Playwright comparison job.
 * Returns a job ID. Frontend polls getRenewalQuoteStatus() for results.
 *
 * Playwright integration contract:
 * {
 *   renewalId, vehicle, policy, coverage,
 *   providers: ['icici-lombard', 'tata-aig', 'acko']
 * }
 */
export async function requestRenewalQuotes(renewalId, renewalData) {
  await delay(600);
  return {
    jobId: `RJOB-${Date.now()}`,
    renewalId,
    status: 'processing',
    providers: renewalProviders.map((p) => ({ ...p, status: 'queued' })),
    estimatedCompletionMs: 30000,
  };
}

/**
 * GET /api/renewal/quotes/:jobId
 * Polls for renewal quote comparison results.
 * Simulates progressive provider completion (Playwright workers completing one by one).
 */
export async function getRenewalQuoteStatus(jobId, pollCount = 0) {
  await delay(2200);

  const providerStatuses = renewalProviders.map((p, i) => ({
    ...p,
    status: i < pollCount ? 'completed' : i === pollCount ? 'processing' : 'waiting',
  }));

  const allDone = pollCount >= renewalProviders.length;

  return {
    jobId,
    status: allDone ? 'completed' : 'processing',
    providers: providerStatuses,
    results: allDone ? renewalQuoteResults : [],
    completedAt: allDone ? new Date().toISOString() : null,
  };
}

/**
 * POST /api/renewal/quotes/:jobId/select
 * Records the user's selected quote.
 */
export async function selectRenewalQuote(jobId, providerId) {
  await delay(400);
  return {
    success: true,
    jobId,
    selectedProvider: providerId,
    selectedAt: new Date().toISOString(),
    nextStep: 'checkout',
  };
}
