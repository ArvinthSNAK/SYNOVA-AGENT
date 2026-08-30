// SYNOVA — Application Draft Persistence
// Single source of truth for localStorage. Keys are centralized here.

const DRAFT_KEY = 'synova_insurance_draft_v1';

export function saveDraft(state) {
  try {
    const draftPayload = {
      applicationId: state.applicationId,
      currentStep: state.currentStep,
      vehicle: state.vehicle,
      coverage: state.coverage,
      userConfirmed: state.userConfirmed,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftPayload));
  } catch (e) {
    // localStorage may be unavailable (private mode, storage full, etc.)
    console.warn('[SYNOVA] Could not save draft:', e);
  }
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Only return draft if it has meaningful data
    if (!parsed.vehicle?.make && !parsed.vehicle?.registrationNumber) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (e) {
    // ignore
  }
}

export function hasDraft() {
  return !!loadDraft();
}
