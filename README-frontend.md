# 🎨 Synova AI Insurance Agent — Frontend Architecture & Technology Stack

Welcome to the comprehensive technical documentation for the **Synova AI Insurance Agent Frontend**. This document details all frameworks, libraries, APIs, architectural patterns, design systems, and tooling powering the web application.

---

## 📑 Table of Contents
1. [Core Framework & Runtime](#1-core-framework--runtime)
2. [HTTP Networking & API Layer (Axios Architecture)](#2-http-networking--api-layer-axios-architecture)
3. [Routing & Page Architecture](#3-routing--page-architecture)
4. [Voice AI & Web Speech APIs](#4-voice-ai--web-speech-apis)
5. [Animation, Motion & 3D Graphics](#5-animation-motion--3d-graphics)
6. [PDF Generation & Client-Side Documents](#6-pdf-generation--client-side-documents)
7. [Design System & Glassmorphism Theme](#7-design-system--glassmorphism-theme)
8. [Iconography & UI Components](#8-iconography--ui-components)
9. [State Management & Data Persistence](#9-state-management--data-persistence)
10. [Security & Sanitization](#10-security--sanitization)
11. [Build System & Developer Tooling](#11-build-system--developer-tooling)
12. [Summary Dependencies Table](#12-summary-dependencies-table)

---

## 1. Core Framework & Runtime

### **React 18 (`react`, `react-dom` `^18.3.0`)**
- **Modern Component Architecture**: Built purely with functional components and standard React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`).
- **React Portals (`createPortal`)**: Used for rendering high-z-index overlays, modals, and tooltips (e.g., `BuyPolicyModal`, `PolicyDetailsModal`, `WalletTopupModal`, `AiAssistantModal`) cleanly into `document.body` outside parent DOM hierarchies.
- **Custom Hooks**:
  - `useStreamingText.js`: Simulates real-time LLM token-by-token typewriter streaming.
  - `useAutoScroll.js`: Smoothly pins conversational feeds to the bottom during live streaming.

### **Vite 5 (`vite` `^5.4.0`, `@vitejs/plugin-react` `^4.3.0`)**
- **Lightning Dev Server**: Native ES Module (ESM) serving with instantaneous Hot Module Replacement (HMR).
- **Production Bundler**: Rollup-powered tree-shaking, automated chunking, minification, and gzip compression.

---

## 2. HTTP Networking & API Layer (Axios Architecture)

### **Axios-Compatible Native Fetch Client (`httpClient.js`)**
Instead of bringing in bulky external HTTP dependencies, the project features a **custom, lightweight Axios-compatible abstraction layer** built over the browser-native `window.fetch`:
- **Axios-style Interface**: Exposes identical method signatures (`httpClient.get`, `httpClient.post`, `httpClient.put`, `httpClient.delete`).
- **Automatic JWT Injection**: Inspects `localStorage` for `synova_token` or `access_token` and automatically injects standard `Authorization: Bearer <token>` headers.
- **Multipart/Form-Data Support**: Automatically detects `FormData` payloads and removes hardcoded `Content-Type` headers so the browser dynamically generates boundary strings for PDF/document uploads.
- **Resilient Dual-Stage Fallback**: Resolves relative endpoints (`/api/v1/...`) via local proxy, and gracefully falls back to direct base URLs (`http://127.0.0.1:8000`) if proxy routing encounters `404` or `502` status codes.
- **Unified Error Handling**: Unpacks response JSON and decorates rejected errors with `err.response = { status, data }`, matching Axios behavior 1:1.

### **AI Advisor Client (`advisorClient.js`)**
- **Distributed Microservice Failover**: Queries multiple backend endpoints in priority order (`VITE_ADVISOR_URL` -> `/voice-agent` -> `http://127.0.0.1:8011`).
- **Session Management**: Automatically establishes and maintains persistent session UUIDs via `sessionStorage` and `crypto.randomUUID()`.

---

## 3. Routing & Page Architecture

### **React Router DOM v6 (`^6.26.0`)**
Comprehensive client-side routing with deep link alias support:
- `BrowserRouter`, `Routes`, `Route`, `Link`, `useNavigate`, `useLocation`.

| Route | Page Component | Feature Area |
| :--- | :--- | :--- |
| `/` | `LandingPage.jsx` | Brand Showcase & Platform Entry |
| `/policies`, `/all-policies`, `/marketplace` | `MarketplacePage.jsx` | Browse 40+ Policies with Euler NLP Search |
| `/compare`, `/new-insurance` | `NewInsurancePage.jsx` | Sequential Multi-Insurer Quotation Engine |
| `/renewals`, `/renew-insurance` | `RenewInsurancePage.jsx` | 2-Column Renewal Form & OCR PDF Upload |
| `/insurance-vault`, `/vault`, `/claims` | `InsuranceVaultPage.jsx` | Active Policies, Claims Filing & Wallet |
| `/agent`, `/voice-advisor` | `AIAgent.jsx` | Real-Time Multimodal Voice & Chat Assistant |
| `/signin`, `/login` | `SignInPage.jsx` | User Sign-In with Demo Credentials |
| `/signup`, `/register` | `SignUpPage.jsx` | User Registration & Profile Setup |
| `/admin` | `AdminDashboardPage.jsx` | Underwriter & Policy Portfolio Analytics |

---

## 4. Voice AI & Web Speech APIs

The application integrates hardware-accelerated, browser-native audio & speech synthesis pipelines:

### **1. Web Speech Recognition API (`SpeechRecognition` / `webkitSpeechRecognition`)**
- Implemented in `VoiceWidget.jsx`.
- **Continuous Mode**: Keeps the microphone open for conversational back-and-forth interactions without requiring repetitive button presses.
- **Locale Tuning**: Configured for Indian English (`lang: 'en-IN'`).
- **Live Event Handling**: Emits final transcripts directly into the Euler AI conversation pipeline.

### **2. Web Speech Synthesis API (`window.speechSynthesis`)**
- Implemented in `AIAgent.jsx`.
- Real-time text-to-speech engine that converts assistant answers into spoken voice audio with mute/unmute toggles and automatic collision cancellation.

---

## 5. Animation, Motion & 3D Graphics

### **Framer Motion (`^11.18.2`)**
- Declarative physics-based React animation engine.
- Used for `VoiceWidget` waveform bar animations, streaming cursor indicators, and modal enter/exit transitions.

### **Three.js (`^0.185.1`)**
- Installed and available for WebGL 3D canvas rendering, dynamic ambient particle fields, and real-time audio visualizers.

### **Hardware-Accelerated CSS3 Glassmorphic Animation Suite (`global.css`)**
- **Entry Keyframes**:
  - `synovaFadeIn` / `synovaFadeInLeft` / `synovaFadeInRight`: Smooth positional easing using `cubic-bezier(0.16, 1, 0.3, 1)`.
  - `synovaScaleIn`: Scaled pop-in for modal dialogs and HUD cards.
  - `synovaFloat`: Ambient floating loop for wallet balance widgets.
  - `stagger-1` to `stagger-8`: Cascading delay queues for policy cards.
- **Luxury Button Micro-interactions (`.glass-btn`)**:
  - **Light Sheen Sweep**: A 25-degree rotated diagonal light beam (`::after`) that glides across buttons on hover.
  - **Elevating Lift**: `-3px` translation with expanded obsidian drop shadow.
  - **Mechanical Spring Press**: Responsive active click compression (`transform: translateY(1px) scale(0.97)`).
  - **Sub-Icon Nudge**: Automatic `+3px` forward motion on embedded SVG arrows on hover.
  - **Ambient Breathing Glow (`.btn-pulse-cta`)**: Radial pulse for primary call-to-action buttons.

---

## 6. PDF Generation & Client-Side Documents

### **jsPDF (`^4.2.1`)**
- Implemented in `src/utils/generatePolicyPdf.js`.
- **Zero-Backend Client-Side PDF Creation**: Generates official, high-resolution IRDAI-compliant Digital Insurance Policy Certificates directly in the browser.
- **Vector Graphics Engine**:
  - Renders custom header banners, policy schedule tables, coverage limits, and deductible clauses.
  - Generates authentic digital certificate stamps, underwriter signatures, policy ID grids, and QR verification blocks.

---

## 7. Design System & Glassmorphism Theme

The frontend implements a unified, high-contrast **5-Color Glassmorphic Theme System**:

```json
"colors": {
  "primary": "#DED8ED",     // Soft Frosted Lavender (Badges, Accents, Highlights)
  "accent": "#111111",      // Obsidian Glass (Headers, Primary CTA Buttons, Borders)
  "background": "#EBEBEB",  // Frosted Cool Light Gray (Page Canvas)
  "textPrimary": "#1C1C1C", // Deep Carbon Charcoal (High-Contrast Typography)
  "link": "#DED8ED"         // Soft Lavender Glow
}
```

### **Glassmorphism Characteristics**
- **Specular Top Rim**: `inset 0 1px 0 rgba(255, 255, 255, 0.95)` provides authentic edge-lit glass refraction.
- **Deep Backdrop Blur**: `backdrop-filter: blur(20px) saturate(180%)` with `-webkit-backdrop-filter` compatibility.
- **Elevation Layers**: Multi-stop box shadows (`0 12px 36px 0 rgba(17, 17, 17, 0.06)`).

---

## 8. Iconography & UI Components

### **Lucide React (`^1.34.0`)**
Lightweight, accessible tree-shakeable SVG icon library. Key icons utilized throughout the platform include:
- `Shield`, `ShieldCheck`, `ShieldAlert`: Trust badges & security verifications.
- `Car`, `HeartPulse`, `FileText`: Category demarcations for Motor, Health, and Term Life.
- `Download`, `RefreshCw`, `CreditCard`, `Plus`: Interactive action icons.
- `Mic`, `Volume2`, `VolumeX`, `Sparkles`: AI voice and assistant indicators.

---

## 9. State Management & Data Persistence

- **React Context API (`AuthContext.jsx`)**: Manages authentication sessions, authenticated user profile details, and token synchronization.
- **Storage Multi-Tenancy**:
  - Multi-account policy isolation (`synova_vault_policies_user_<id>`).
  - Account-specific wallet balance storage (`synova_wallet_balance_user_<id>`).
- **Cross-Component Event Bus**:
  - Custom browser events (`synova_policy_purchased`, `synova_wallet_updated`) allow separate pages, modals, and navigation headers to immediately synchronize state without requiring bulky external state libraries.

---

## 10. Security & Sanitization

### **DOMPurify (`purify.es`)**
- Client-side XSS sanitizer that purifies untrusted HTML before injecting markup into conversational message panels and policy description cards.

---

## 11. Build System & Developer Tooling

- **Vite 5 (`vite build`)**: Production bundle generation with chunk size optimization.
- **ESLint 9 (`eslint` `^9.9.0`)**: Enforces React Hooks rules, syntax correctness, and modern ES conventions.

---

## 12. Summary Dependencies Table

| Technology / Package | Version | Primary Purpose |
| :--- | :--- | :--- |
| **React** | `^18.3.0` | UI component tree, hooks, and virtual DOM |
| **React DOM** | `^18.3.0` | DOM rendering & Portals |
| **Vite** | `^5.4.0` | Development server and Rollup production build |
| **React Router DOM** | `^6.26.0` | Declarative client-side routing & navigation |
| **Framer Motion** | `^11.18.2` | Spring animations & dynamic motion elements |
| **Lucide React** | `^1.34.0` | Clean, customizable vector SVG icons |
| **jsPDF** | `^4.2.1` | Client-side official e-Policy PDF generation |
| **Three.js** | `^0.185.1` | WebGL 3D graphics & visual effects |
| **DOMPurify** | Built-in | HTML sanitization against XSS vulnerabilities |
| **Native Web Speech API** | Browser Native | Real-time speech-to-text (STT) voice recognition |
| **Native SpeechSynthesis** | Browser Native | Real-time text-to-speech (TTS) voice agent audio |
| **Native Fetch API** | Browser Native | Axios-compatible asynchronous HTTP networking |

---
*Documentation compiled for SYNOVA-AGENT Frontend.*
