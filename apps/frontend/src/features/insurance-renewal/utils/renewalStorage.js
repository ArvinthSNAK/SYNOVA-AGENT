// SYNOVA — Renewal Draft Persistence
// Mirrors the applicationStorage pattern from Journey 2.

const STORAGE_KEY = 'synova_renewal_draft';

export function saveRenewalDraft(state) {
  try {
    const draft = {
      renewalId: state.renewalId,
      currentStep: state.currentStep,
      policy: state.policy,
      vehicle: state.vehicle,
      customer: state.customer,
      coverage: state.coverage,
      inputMode: state.inputMode,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch (e) {
    // Storage unavailable — fail silently
  }
}

export function loadRenewalDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    // Discard drafts older than 48 hours
    const savedAt = new Date(draft.savedAt).getTime();
    if (Date.now() - savedAt > 48 * 60 * 60 * 1000) {
      clearRenewalDraft();
      return null;
    }
    return draft;
  } catch (e) {
    return null;
  }
}

export function clearRenewalDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}
