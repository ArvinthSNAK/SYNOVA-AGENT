// SYNOVA — Central Insurance Application State Hook
// All state management for Journey 2 lives here.

import { useState, useEffect, useCallback, useRef } from 'react';
import { APPLICATION_ID, eulerStepContextMessages } from '../data/insuranceMockData.js';
import { saveDraft, loadDraft, clearDraft } from '../utils/applicationStorage.js';
import { validateVehicleForm, validateCoverage, isVehicleComplete, isCoverageComplete } from '../utils/validation.js';
import { extractVehicleFromText, uploadAndExtractDocument, requestQuotes, getQuoteStatus, createApplication } from '../services/insuranceService.js';

// ─── Initial State ────────────────────────────────────────────────────────────
export const initialApplicationState = {
  applicationId: null,
  currentStep: 1,
  vehicle: {
    registrationNumber: '',
    make: '',
    model: '',
    year: '',
    fuelType: '',
    variant: '',
    city: '',
    ownershipType: 'First Owner',
  },
  coverage: {
    type: '',
    addons: [],
  },
  documents: [],
  validation: {},
  quote: {
    status: 'idle', // idle | collecting | processing | comparing | completed | error
    jobId: null,
    providers: [],
    results: [],
    pollCount: 0,
  },
  userConfirmed: false,
  // Euler conversation
  eulerConversation: [],
  // Input mode for step 1
  inputMode: null, // null | 'euler' | 'manual' | 'upload'
  // Extraction state
  extraction: {
    status: 'idle', // idle | processing | completed | error
    source: null, // 'euler' | 'document'
    data: null,
  },
  // Document upload
  uploadedDocument: null,
  documentExtraction: {
    status: 'idle', // idle | uploading | processing | completed | error
    data: null,
  },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export default function useInsuranceApplication() {
  const [state, setState] = useState(initialApplicationState);
  const [draftAvailable, setDraftAvailable] = useState(false);
  const saveTimerRef = useRef(null);
  const pollTimerRef = useRef(null);

  // ─── Initialize ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setDraftAvailable(true);
    }
    // Initialize application ID
    setState((prev) => ({
      ...prev,
      applicationId: APPLICATION_ID,
      eulerConversation: [
        {
          id: 'euler-welcome',
          role: 'euler',
          type: 'text',
          content: eulerStepContextMessages[1],
          timestamp: Date.now(),
        },
        {
          id: 'euler-quickactions',
          role: 'euler',
          type: 'quickactions',
          content: 'What would you like to do?',
          timestamp: Date.now() + 10,
        },
      ],
    }));
  }, []);

  // ─── Auto-save draft (debounced) ─────────────────────────────────────────────
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (state.applicationId) {
        saveDraft(state);
      }
    }, 800);
    return () => clearTimeout(saveTimerRef.current);
  }, [state.vehicle, state.coverage, state.currentStep]);

  // ─── Cleanup ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, []);

  // ─── Draft Actions ────────────────────────────────────────────────────────────
  const resumeDraft = useCallback(() => {
    const draft = loadDraft();
    if (!draft) return;
    setState((prev) => ({
      ...prev,
      currentStep: draft.currentStep || 1,
      vehicle: draft.vehicle || prev.vehicle,
      coverage: draft.coverage || prev.coverage,
      userConfirmed: draft.userConfirmed || false,
    }));
    setDraftAvailable(false);
  }, []);

  const discardDraft = useCallback(() => {
    clearDraft();
    setDraftAvailable(false);
  }, []);

  // ─── Step Navigation ──────────────────────────────────────────────────────────
  const goToStep = useCallback((step) => {
    setState((prev) => {
      const newConversation = [...prev.eulerConversation];
      // Add Euler step context if moving forward
      if (step > prev.currentStep && eulerStepContextMessages[step]) {
        newConversation.push({
          id: `euler-step-${step}-${Date.now()}`,
          role: 'euler',
          type: 'text',
          content: eulerStepContextMessages[step],
          timestamp: Date.now(),
        });
      }
      return {
        ...prev,
        currentStep: step,
        eulerConversation: newConversation,
      };
    });
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep >= 3) return prev;
      const nextStepNum = prev.currentStep + 1;
      const newConversation = [...prev.eulerConversation];
      if (eulerStepContextMessages[nextStepNum]) {
        newConversation.push({
          id: `euler-step-${nextStepNum}-${Date.now()}`,
          role: 'euler',
          type: 'text',
          content: eulerStepContextMessages[nextStepNum],
          timestamp: Date.now(),
        });
      }
      return {
        ...prev,
        currentStep: nextStepNum,
        eulerConversation: newConversation,
      };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1),
    }));
  }, []);

  // ─── Input Mode ───────────────────────────────────────────────────────────────
  const setInputMode = useCallback((mode) => {
    setState((prev) => {
      const newConversation = [...prev.eulerConversation];
      if (mode === 'euler') {
        newConversation.push({
          id: `user-mode-${Date.now()}`,
          role: 'user',
          type: 'text',
          content: 'Tell Euler about my car',
          timestamp: Date.now(),
        });
        newConversation.push({
          id: `euler-mode-${Date.now()}`,
          role: 'euler',
          type: 'text',
          content: "Great. Tell me about your car in your own words.\n\nFor example:\n\"2023 Hyundai Creta petrol, registered in Bangalore.\"",
          timestamp: Date.now() + 10,
        });
      } else if (mode === 'manual') {
        newConversation.push({
          id: `user-manual-${Date.now()}`,
          role: 'user',
          type: 'text',
          content: 'I want to enter my vehicle details manually',
          timestamp: Date.now(),
        });
        newConversation.push({
          id: `euler-manual-${Date.now()}`,
          role: 'euler',
          type: 'text',
          content: 'No problem. Fill in your vehicle details in the form. I\'ll be here if you have questions.',
          timestamp: Date.now() + 10,
        });
      } else if (mode === 'upload') {
        newConversation.push({
          id: `user-upload-${Date.now()}`,
          role: 'user',
          type: 'text',
          content: 'I want to upload my vehicle document',
          timestamp: Date.now(),
        });
        newConversation.push({
          id: `euler-upload-${Date.now()}`,
          role: 'euler',
          type: 'text',
          content: 'Upload your RC or vehicle registration document. I\'ll extract the information for you.',
          timestamp: Date.now() + 10,
        });
      }
      return { ...prev, inputMode: mode, eulerConversation: newConversation };
    });
  }, []);

  // ─── Euler NL Extraction ──────────────────────────────────────────────────────
  const sendEulerMessage = useCallback(async (text) => {
    const userMsgId = `user-${Date.now()}`;
    // Add user message
    setState((prev) => ({
      ...prev,
      eulerConversation: [
        ...prev.eulerConversation,
        { id: userMsgId, role: 'user', type: 'text', content: text, timestamp: Date.now() },
        { id: `euler-typing-${Date.now()}`, role: 'euler', type: 'typing', content: '', timestamp: Date.now() + 5 },
      ],
      extraction: { status: 'processing', source: 'euler', data: null },
    }));

    try {
      const result = await extractVehicleFromText(text);
      setState((prev) => {
        const filtered = prev.eulerConversation.filter((m) => m.type !== 'typing');
        return {
          ...prev,
          eulerConversation: [
            ...filtered,
            {
              id: `euler-extracted-${Date.now()}`,
              role: 'euler',
              type: 'extraction',
              content: 'Vehicle information found',
              data: result.extracted,
              timestamp: Date.now(),
            },
          ],
          extraction: { status: 'completed', source: 'euler', data: result.extracted },
          vehicle: {
            ...prev.vehicle,
            ...result.extracted,
          },
        };
      });
    } catch (err) {
      setState((prev) => {
        const filtered = prev.eulerConversation.filter((m) => m.type !== 'typing');
        return {
          ...prev,
          eulerConversation: [
            ...filtered,
            {
              id: `euler-error-${Date.now()}`,
              role: 'euler',
              type: 'text',
              content: 'I wasn\'t able to process that. Could you try again, or enter your vehicle details manually?',
              timestamp: Date.now(),
            },
          ],
          extraction: { status: 'error', source: 'euler', data: null },
        };
      });
    }
  }, []);

  // ─── Document Upload & Extraction ─────────────────────────────────────────────
  const handleDocumentUpload = useCallback(async (file) => {
    setState((prev) => ({
      ...prev,
      uploadedDocument: file,
      documentExtraction: { status: 'uploading', data: null },
    }));

    try {
      // Simulate upload phase
      await new Promise((res) => setTimeout(res, 1000));
      setState((prev) => ({
        ...prev,
        documentExtraction: { status: 'processing', data: null },
      }));

      const result = await uploadAndExtractDocument(file);
      setState((prev) => ({
        ...prev,
        documentExtraction: { status: 'completed', data: result.extracted },
        vehicle: {
          ...prev.vehicle,
          make: result.extracted.make || prev.vehicle.make,
          model: result.extracted.model || prev.vehicle.model,
          year: result.extracted.year || prev.vehicle.year,
          fuelType: result.extracted.fuelType || prev.vehicle.fuelType,
          registrationNumber: result.extracted.registrationNumber || prev.vehicle.registrationNumber,
          variant: result.extracted.variant || prev.vehicle.variant,
        },
        eulerConversation: [
          ...prev.eulerConversation,
          {
            id: `euler-doc-done-${Date.now()}`,
            role: 'euler',
            type: 'text',
            content: 'I\'ve extracted the information from your document. Please review and edit any fields if needed.',
            timestamp: Date.now(),
          },
        ],
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        documentExtraction: { status: 'error', data: null },
      }));
    }
  }, []);

  // ─── Vehicle Updates ──────────────────────────────────────────────────────────
  const updateVehicle = useCallback((field, value) => {
    setState((prev) => ({
      ...prev,
      vehicle: { ...prev.vehicle, [field]: value },
    }));
  }, []);

  const setVehicle = useCallback((vehicleData) => {
    setState((prev) => ({
      ...prev,
      vehicle: { ...prev.vehicle, ...vehicleData },
    }));
  }, []);

  // ─── Coverage Updates ─────────────────────────────────────────────────────────
  const setCoverageType = useCallback((type) => {
    setState((prev) => ({
      ...prev,
      coverage: { ...prev.coverage, type },
    }));
  }, []);

  const toggleAddon = useCallback((addonId) => {
    setState((prev) => {
      const current = prev.coverage.addons;
      const newAddons = current.includes(addonId)
        ? current.filter((id) => id !== addonId)
        : [...current, addonId];
      return { ...prev, coverage: { ...prev.coverage, addons: newAddons } };
    });
  }, []);

  // ─── Confirmation ─────────────────────────────────────────────────────────────
  const setUserConfirmed = useCallback((value) => {
    setState((prev) => ({ ...prev, userConfirmed: value }));
  }, []);

  // ─── Quote Generation ─────────────────────────────────────────────────────────
  const submitForQuotes = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      quote: { ...prev.quote, status: 'processing', pollCount: 0 },
    }));

    try {
      const jobResult = await requestQuotes(state.applicationId, {
        vehicle: state.vehicle,
        coverage: state.coverage,
      });

      setState((prev) => ({
        ...prev,
        quote: {
          ...prev.quote,
          status: 'comparing',
          jobId: jobResult.jobId,
          providers: jobResult.providers,
        },
      }));

      // Start polling simulation
      pollQuoteStatus(jobResult.jobId, 0);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        quote: { ...prev.quote, status: 'error' },
      }));
    }
  }, [state.applicationId, state.vehicle, state.coverage]);

  const pollQuoteStatus = useCallback((jobId, pollCount) => {
    pollTimerRef.current = setTimeout(async () => {
      try {
        const statusResult = await getQuoteStatus(jobId, pollCount);
        setState((prev) => ({
          ...prev,
          quote: {
            ...prev.quote,
            providers: statusResult.providers,
            status: statusResult.status === 'completed' ? 'completed' : 'comparing',
            results: statusResult.results,
            pollCount: pollCount + 1,
          },
        }));

        if (statusResult.status !== 'completed') {
          pollQuoteStatus(jobId, pollCount + 1);
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          quote: { ...prev.quote, status: 'error' },
        }));
      }
    }, 2500);
  }, []);

  // ─── Computed Values ──────────────────────────────────────────────────────────
  const vehicleComplete = isVehicleComplete(state.vehicle);
  const coverageComplete = isCoverageComplete(state.coverage);

  const vehicleValidation = validateVehicleForm(state.vehicle);
  const coverageValidation = validateCoverage(state.coverage);

  // Estimated premium calculation
  const estimatedPremium = (() => {
    if (!state.coverage.type) return null;
    const baseOptions = { comprehensive: 18450, 'third-party': 4200 };
    const base = baseOptions[state.coverage.type] || 0;
    const addonPrices = { 'zero-dep': 2100, rsa: 599, 'engine-protection': 1299, consumables: 499, 'key-replacement': 299, 'pa-cover': 750 };
    const addonTotal = state.coverage.addons.reduce((sum, id) => sum + (addonPrices[id] || 0), 0);
    return base + addonTotal;
  })();

  return {
    state,
    draftAvailable,
    vehicleComplete,
    coverageComplete,
    vehicleValidation,
    coverageValidation,
    estimatedPremium,
    // Actions
    resumeDraft,
    discardDraft,
    goToStep,
    nextStep,
    prevStep,
    setInputMode,
    sendEulerMessage,
    handleDocumentUpload,
    updateVehicle,
    setVehicle,
    setCoverageType,
    toggleAddon,
    setUserConfirmed,
    submitForQuotes,
  };
}
