// SYNOVA — Central Renewal State Hook
// All state management for Journey 3 lives here.
// Components receive state + actions via props — no prop-drilling bypass needed.

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  RENEWAL_ID,
  currentPolicyMock,
  eulerRenewalMessages,
  renewalProviders,
  extractionStages,
} from '../data/renewalMockData.js';
import { saveRenewalDraft, loadRenewalDraft, clearRenewalDraft } from '../utils/renewalStorage.js';
import {
  uploadPolicyDocument,
  extractPolicyFromDocument,
  requestRenewalQuotes,
  getRenewalQuoteStatus,
  selectRenewalQuote,
} from '../services/renewalService.js';

// ─── Initial State ────────────────────────────────────────────────────────────
export const initialRenewalState = {
  renewalId: null,
  currentStep: 1,                   // 1=Upload, 2=Verify, 3=Coverage, 4=Quotes
  inputMode: null,                  // null | 'upload' | 'manual'

  // Document upload
  policyDocument: null,             // { name, size, type }
  upload: {
    status: 'idle',                 // idle|uploading|processing|extracting|completed|error
    progress: 0,
    documentId: null,
    errorMessage: null,
    currentStage: null,             // one of extractionStages[].id
    completedStages: [],
  },

  // Extracted / entered policy data
  policy: {
    provider: '',
    policyNumber: '',
    policyType: '',
    startDate: '',
    expiryDate: '',
    previousPremium: '',
    ncb: '',
    idv: '',
    deductible: '',
  },
  vehicle: {
    registrationNumber: '',
    make: '',
    model: '',
    variant: '',
    year: '',
    fuelType: '',
    city: '',
  },
  customer: {
    name: '',
    mobile: '',
    email: '',
    address: '',
  },
  coverage: {
    type: 'comprehensive',
    idv: '',
    addons: [],
    deductible: '',
    ncb: '',
  },

  // Extraction confidence (field-level)
  extractionConfidence: {},

  // Quote state
  quote: {
    status: 'idle',                 // idle|processing|comparing|completed|error
    jobId: null,
    providers: [],
    results: [],
    selectedProviderId: null,
    pollCount: 0,
  },

  // Euler conversation
  eulerConversation: [],

  // Confirmation
  userConfirmed: false,

  // Current policy context (from dashboard)
  currentPolicy: null,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export default function useRenewalApplication() {
  const [state, setState] = useState(initialRenewalState);
  const [draftAvailable, setDraftAvailable] = useState(false);
  const saveTimerRef = useRef(null);
  const pollTimerRef = useRef(null);

  // ─── Initialize ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const draft = loadRenewalDraft();
    if (draft) setDraftAvailable(true);

    setState((prev) => ({
      ...prev,
      renewalId: RENEWAL_ID,
      currentPolicy: currentPolicyMock,
      // Pre-fill from current policy for fast renewal
      policy: {
        provider: currentPolicyMock.provider,
        policyNumber: currentPolicyMock.policyNumber,
        policyType: currentPolicyMock.policyType,
        startDate: currentPolicyMock.startDate,
        expiryDate: currentPolicyMock.expiryDate,
        previousPremium: String(currentPolicyMock.previousPremium),
        ncb: currentPolicyMock.ncb,
        idv: String(currentPolicyMock.idv),
        deductible: String(currentPolicyMock.deductible),
      },
      vehicle: { ...currentPolicyMock.vehicle },
      customer: { ...currentPolicyMock.customer },
      coverage: {
        type: 'comprehensive',
        idv: String(currentPolicyMock.idv),
        addons: [...currentPolicyMock.addons],
        deductible: String(currentPolicyMock.deductible),
        ncb: currentPolicyMock.ncb,
      },
      eulerConversation: [
        {
          id: 'euler-welcome',
          role: 'euler',
          type: 'text',
          content: eulerRenewalMessages.welcome,
          timestamp: Date.now(),
        },
        {
          id: 'euler-welcome-actions',
          role: 'euler',
          type: 'renewal-actions',
          content: '',
          timestamp: Date.now() + 10,
        },
      ],
    }));
  }, []);

  // ─── Auto-save draft ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (state.renewalId) saveRenewalDraft(state);
    }, 800);
    return () => clearTimeout(saveTimerRef.current);
  }, [state.policy, state.vehicle, state.coverage, state.currentStep]);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, []);

  // ─── Draft Actions ────────────────────────────────────────────────────────────
  const resumeDraft = useCallback(() => {
    const draft = loadRenewalDraft();
    if (!draft) return;
    setState((prev) => ({
      ...prev,
      currentStep: draft.currentStep || 1,
      policy: draft.policy || prev.policy,
      vehicle: draft.vehicle || prev.vehicle,
      customer: draft.customer || prev.customer,
      coverage: draft.coverage || prev.coverage,
      inputMode: draft.inputMode || null,
    }));
    setDraftAvailable(false);
  }, []);

  const discardDraft = useCallback(() => {
    clearRenewalDraft();
    setDraftAvailable(false);
  }, []);

  // ─── Step Navigation ──────────────────────────────────────────────────────────
  const goToStep = useCallback((step) => {
    setState((prev) => {
      const msgs = {
        2: eulerRenewalMessages.afterUpload,
        3: eulerRenewalMessages.coverageStep,
        4: eulerRenewalMessages.reviewStep,
      };
      const newConversation = [...prev.eulerConversation];
      if (step > prev.currentStep && msgs[step]) {
        newConversation.push({
          id: `euler-step-${step}-${Date.now()}`,
          role: 'euler',
          type: 'text',
          content: msgs[step],
          timestamp: Date.now(),
        });
      }
      return { ...prev, currentStep: step, eulerConversation: newConversation };
    });
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep >= 4) return prev;
      const next = prev.currentStep + 1;
      const msgs = {
        2: eulerRenewalMessages.afterUpload,
        3: eulerRenewalMessages.coverageStep,
        4: eulerRenewalMessages.reviewStep,
      };
      const newConversation = [...prev.eulerConversation];
      if (msgs[next]) {
        newConversation.push({
          id: `euler-step-${next}-${Date.now()}`,
          role: 'euler',
          type: 'text',
          content: msgs[next],
          timestamp: Date.now(),
        });
      }
      return { ...prev, currentStep: next, eulerConversation: newConversation };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: Math.max(1, prev.currentStep - 1) }));
  }, []);

  // ─── Input Mode ───────────────────────────────────────────────────────────────
  const setInputMode = useCallback((mode) => {
    setState((prev) => {
      const msgs = {
        upload: ['I want to upload my existing policy', 'Great. Upload your policy PDF or image and I\'ll extract all the details automatically.'],
        manual: ['I\'ll enter my policy details manually', 'No problem. Fill in your policy and vehicle details in the form. I\'ll be here if you have questions.'],
      };
      const newConversation = [...prev.eulerConversation];
      if (msgs[mode]) {
        newConversation.push({
          id: `user-mode-${Date.now()}`,
          role: 'user',
          type: 'text',
          content: msgs[mode][0],
          timestamp: Date.now(),
        });
        newConversation.push({
          id: `euler-mode-${Date.now()}`,
          role: 'euler',
          type: 'text',
          content: msgs[mode][1],
          timestamp: Date.now() + 10,
        });
      }
      return { ...prev, inputMode: mode, eulerConversation: newConversation };
    });
  }, []);

  // ─── Policy Document Upload & OCR ─────────────────────────────────────────────
  const handlePolicyUpload = useCallback(async (file) => {
    setState((prev) => ({
      ...prev,
      policyDocument: { name: file.name, size: file.size, type: file.type },
      upload: { status: 'uploading', progress: 0, documentId: null, errorMessage: null, currentStage: null, completedStages: [] },
    }));

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setState((prev) => {
        if (prev.upload.progress >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return { ...prev, upload: { ...prev.upload, progress: prev.upload.progress + 15 } };
      });
    }, 200);

    try {
      const uploadResult = await uploadPolicyDocument(file);
      clearInterval(progressInterval);
      setState((prev) => ({
        ...prev,
        upload: { ...prev.upload, status: 'processing', progress: 100, documentId: uploadResult.documentId },
      }));

      // Run OCR extraction with stage callbacks
      await extractPolicyFromDocument(
        uploadResult.documentId,
        (stageId, stageIndex) => {
          setState((prev) => ({
            ...prev,
            upload: {
              ...prev.upload,
              status: 'extracting',
              currentStage: stageId,
              completedStages: extractionStages.slice(0, stageIndex).map((s) => s.id),
            },
          }));
        },
      );

      // Populate extracted data into state
      setState((prev) => {
        const mock = {
          provider: { value: 'ICICI Lombard', confidence: 'high' },
          policyNumber: { value: 'AUTO-123456', confidence: 'high' },
          policyType: { value: 'Comprehensive', confidence: 'high' },
          startDate: { value: '2025-09-26', confidence: 'high' },
          expiryDate: { value: '2026-09-25', confidence: 'high' },
          previousPremium: { value: '17900', confidence: 'medium' },
          ncb: { value: '20%', confidence: 'medium' },
          idv: { value: '840000', confidence: 'high' },
          deductible: { value: '2000', confidence: 'medium' },
          registrationNumber: { value: 'KA-01-MF-4567', confidence: 'low' },
          make: { value: 'Hyundai', confidence: 'high' },
          model: { value: 'Creta', confidence: 'high' },
          variant: { value: 'SX(O) Turbo', confidence: 'medium' },
          year: { value: '2023', confidence: 'high' },
          fuelType: { value: 'Petrol', confidence: 'high' },
          city: { value: 'Bangalore', confidence: 'high' },
          name: { value: 'Naresh Kumar', confidence: 'high' },
          mobile: { value: '+91 98765 43210', confidence: 'medium' },
          email: { value: 'naresh.kumar@email.com', confidence: 'medium' },
          addons: { value: ['zero-dep', 'rsa'], confidence: 'medium' },
        };

        const newConversation = [
          ...prev.eulerConversation,
          {
            id: `euler-extracted-${Date.now()}`,
            role: 'euler',
            type: 'text',
            content: 'I\'ve read your policy. Everything looks good — please review the extracted details and confirm.',
            timestamp: Date.now(),
          },
        ];

        return {
          ...prev,
          upload: {
            ...prev.upload,
            status: 'completed',
            currentStage: null,
            completedStages: extractionStages.map((s) => s.id),
          },
          extractionConfidence: Object.fromEntries(Object.entries(mock).map(([k, v]) => [k, v.confidence])),
          policy: {
            provider: mock.provider.value,
            policyNumber: mock.policyNumber.value,
            policyType: mock.policyType.value,
            startDate: mock.startDate.value,
            expiryDate: mock.expiryDate.value,
            previousPremium: mock.previousPremium.value,
            ncb: mock.ncb.value,
            idv: mock.idv.value,
            deductible: mock.deductible.value,
          },
          vehicle: {
            registrationNumber: mock.registrationNumber.value,
            make: mock.make.value,
            model: mock.model.value,
            variant: mock.variant.value,
            year: mock.year.value,
            fuelType: mock.fuelType.value,
            city: mock.city.value,
          },
          customer: {
            name: mock.name.value,
            mobile: mock.mobile.value,
            email: mock.email.value,
            address: prev.customer.address,
          },
          coverage: {
            ...prev.coverage,
            addons: mock.addons.value,
            idv: mock.idv.value,
            ncb: mock.ncb.value,
          },
          eulerConversation: newConversation,
        };
      });
    } catch (err) {
      clearInterval(progressInterval);
      setState((prev) => ({
        ...prev,
        upload: { ...prev.upload, status: 'error', errorMessage: 'We couldn\'t read this policy. Please try again or enter details manually.' },
      }));
    }
  }, []);

  const retryUpload = useCallback(() => {
    setState((prev) => ({
      ...prev,
      policyDocument: null,
      upload: { status: 'idle', progress: 0, documentId: null, errorMessage: null, currentStage: null, completedStages: [] },
    }));
  }, []);

  // ─── Policy / Vehicle / Customer / Coverage Updates ───────────────────────────
  const updatePolicy = useCallback((field, value) => {
    setState((prev) => ({ ...prev, policy: { ...prev.policy, [field]: value } }));
  }, []);

  const updateVehicle = useCallback((field, value) => {
    setState((prev) => ({ ...prev, vehicle: { ...prev.vehicle, [field]: value } }));
  }, []);

  const updateCustomer = useCallback((field, value) => {
    setState((prev) => ({ ...prev, customer: { ...prev.customer, [field]: value } }));
  }, []);

  const setCoverageType = useCallback((type) => {
    setState((prev) => ({ ...prev, coverage: { ...prev.coverage, type } }));
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

  const updateCoverage = useCallback((field, value) => {
    setState((prev) => ({ ...prev, coverage: { ...prev.coverage, [field]: value } }));
  }, []);

  const setUserConfirmed = useCallback((value) => {
    setState((prev) => ({ ...prev, userConfirmed: value }));
  }, []);

  // ─── Euler Chat ───────────────────────────────────────────────────────────────
  const sendEulerMessage = useCallback(async (text) => {
    setState((prev) => ({
      ...prev,
      eulerConversation: [
        ...prev.eulerConversation,
        { id: `user-${Date.now()}`, role: 'user', type: 'text', content: text, timestamp: Date.now() },
        { id: `euler-typing-${Date.now()}`, role: 'euler', type: 'typing', content: '', timestamp: Date.now() + 5 },
      ],
    }));
    await new Promise((res) => setTimeout(res, 1500));
    setState((prev) => {
      const filtered = prev.eulerConversation.filter((m) => m.type !== 'typing');
      return {
        ...prev,
        eulerConversation: [
          ...filtered,
          {
            id: `euler-reply-${Date.now()}`,
            role: 'euler',
            type: 'text',
            content: 'I\'m here to help with your renewal. Your existing policy details are already loaded — just review and confirm each step.',
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ─── Quote Generation ─────────────────────────────────────────────────────────
  const submitForQuotes = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      quote: { ...prev.quote, status: 'processing', pollCount: 0 },
      eulerConversation: [
        ...prev.eulerConversation,
        {
          id: `euler-quoting-${Date.now()}`,
          role: 'euler',
          type: 'text',
          content: eulerRenewalMessages.quotingStep,
          timestamp: Date.now(),
        },
      ],
    }));

    try {
      const jobResult = await requestRenewalQuotes(state.renewalId, {
        policy: state.policy,
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

      pollQuoteStatus(jobResult.jobId, 0);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        quote: { ...prev.quote, status: 'error' },
      }));
    }
  }, [state.renewalId, state.policy, state.vehicle, state.coverage]);

  const pollQuoteStatus = useCallback((jobId, pollCount) => {
    pollTimerRef.current = setTimeout(async () => {
      try {
        const statusResult = await getRenewalQuoteStatus(jobId, pollCount);
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
        setState((prev) => ({ ...prev, quote: { ...prev.quote, status: 'error' } }));
      }
    }, 2500);
  }, []);

  const selectQuote = useCallback(async (providerId) => {
    setState((prev) => ({
      ...prev,
      quote: { ...prev.quote, selectedProviderId: providerId },
    }));
  }, []);

  const retryQuotes = useCallback(() => {
    setState((prev) => ({
      ...prev,
      quote: { status: 'idle', jobId: null, providers: [], results: [], selectedProviderId: null, pollCount: 0 },
    }));
  }, []);

  // ─── Computed ─────────────────────────────────────────────────────────────────
  const uploadComplete = state.upload.status === 'completed';
  const policyFilled = !!(state.policy.provider && state.policy.policyNumber && state.policy.expiryDate);
  const vehicleFilled = !!(state.vehicle.make && state.vehicle.model && state.vehicle.registrationNumber);
  const canCompare = policyFilled && vehicleFilled && state.coverage.type && state.userConfirmed;

  const estimatedPremium = (() => {
    const base = 18450;
    const addonPrices = { 'zero-dep': 2100, rsa: 599, 'engine-protection': 1299, consumables: 499, 'pa-cover': 750 };
    const addonTotal = state.coverage.addons.reduce((sum, id) => sum + (addonPrices[id] || 0), 0);
    return base + addonTotal;
  })();

  return {
    state,
    draftAvailable,
    uploadComplete,
    policyFilled,
    vehicleFilled,
    canCompare,
    estimatedPremium,
    // Actions
    resumeDraft,
    discardDraft,
    goToStep,
    nextStep,
    prevStep,
    setInputMode,
    handlePolicyUpload,
    retryUpload,
    updatePolicy,
    updateVehicle,
    updateCustomer,
    setCoverageType,
    toggleAddon,
    updateCoverage,
    setUserConfirmed,
    sendEulerMessage,
    submitForQuotes,
    selectQuote,
    retryQuotes,
  };
}
