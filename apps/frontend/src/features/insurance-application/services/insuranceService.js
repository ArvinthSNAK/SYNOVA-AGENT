// SYNOVA — Insurance Application Service Layer
// All API interactions go through this file.
// Backend (including Playwright automation) can be integrated by replacing
// mock implementations with real fetch/axios calls.

import {
  vehicleExtractionMock,
  documentExtractionMock,
  quoteProviders,
  mockQuoteResults,
  APPLICATION_ID,
} from '../data/insuranceMockData.js';

// ─── Simulated network delay ──────────────────────────────────────────────────
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ─── Application CRUD ─────────────────────────────────────────────────────────

/**
 * POST /api/insurance/applications
 * Creates a new application draft and returns an application ID.
 */
export async function createApplication() {
  await delay(400);
  return {
    applicationId: APPLICATION_ID,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
}

/**
 * PATCH /api/insurance/applications/:id
 * Updates application data (vehicle, coverage, etc.)
 */
export async function updateApplication(applicationId, data) {
  await delay(200);
  return { applicationId, ...data, updatedAt: new Date().toISOString() };
}

// ─── AI Extraction ────────────────────────────────────────────────────────────

/**
 * POST /api/insurance/extract
 * Sends natural language text to backend NLP; returns structured vehicle data.
 * In production, this calls an LLM or fine-tuned extraction model.
 */
export async function extractVehicleFromText(text) {
  await delay(1800); // Simulate AI processing time
  // In production: POST to /api/insurance/extract { text }
  // The backend uses Gemini/GPT to parse vehicle info from natural language
  return {
    success: true,
    extracted: vehicleExtractionMock,
    confidence: {
      make: 0.98,
      model: 0.97,
      year: 0.99,
      fuelType: 0.95,
      city: 0.92,
    },
  };
}

// ─── Document Processing ──────────────────────────────────────────────────────

/**
 * POST /api/insurance/documents
 * Uploads a vehicle document (RC) and returns extracted fields.
 * In production, this calls a Vision/OCR service.
 */
export async function uploadAndExtractDocument(file) {
  await delay(2500); // Simulate upload + OCR processing
  // In production: multipart form POST to /api/insurance/documents
  return {
    success: true,
    documentId: `DOC-${Date.now()}`,
    fileName: file?.name || 'document.pdf',
    extracted: documentExtractionMock,
  };
}

// ─── Quote Generation ─────────────────────────────────────────────────────────

/**
 * POST /api/insurance/quotes
 * Submits the completed application and triggers the Playwright comparison job.
 * Returns a job ID. Frontend polls GET /api/insurance/quotes/:id for results.
 *
 * Future Playwright integration:
 *   Backend receives this request → spawns Playwright workers per provider
 *   → fills forms on ICICI Lombard / TATA AIG / Acko mock sites
 *   → extracts premium + IDV → stores results → notifies frontend
 */
export async function requestQuotes(applicationId, applicationData) {
  await delay(500);
  return {
    jobId: `JOB-${Date.now()}`,
    applicationId,
    status: 'processing',
    providers: quoteProviders.map((p) => ({ ...p, status: 'queued' })),
    estimatedCompletionMs: 30000,
  };
}

/**
 * GET /api/insurance/quotes/:jobId
 * Polls for quote comparison results.
 * Simulates progressive provider completion.
 */
export async function getQuoteStatus(jobId, pollCount = 0) {
  await delay(2000);

  // Simulate sequential provider completion
  const providerStatuses = quoteProviders.map((p, i) => ({
    ...p,
    status: i < pollCount ? 'completed' : i === pollCount ? 'processing' : 'waiting',
  }));

  const allDone = pollCount >= quoteProviders.length;

  return {
    jobId,
    status: allDone ? 'completed' : 'processing',
    providers: providerStatuses,
    results: allDone ? mockQuoteResults : [],
    completedAt: allDone ? new Date().toISOString() : null,
  };
}
