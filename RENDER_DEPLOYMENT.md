# 🌐 SYNOVA AI Insurance Platform — Render Deployment Guide

This guide walks you through deploying the complete **SYNOVA AI Insurance Platform** — including the **React Frontend**, **Core Backend API**, **Automation Service**, **Realtime AI Voice Advisor**, and **All 4 Mock Insurer Gateways (ICICI Lombard, ACKO, TATA AIG, HDFC ERGO)** — to [Render](https://render.com) with 100% functionality.

---

## 🏛️ Architecture Overview

When deployed on Render, the platform runs in an optimized **Unified Production Container** managed by **Nginx** and **Supervisord**:

```
                              ┌───────────────────────────────────────────────┐
                              │           Render HTTPS Web Service            │
                              │           (https://synova.onrender.com)       │
                              └──────────────────────┬────────────────────────┘
                                                     │
                                                     ▼
                              ┌───────────────────────────────────────────────┐
                              │            Nginx Reverse Proxy                │
                              │               (Port $PORT)                    │
                              └──────┬───────┬───────┬───────┬────────┬───────┘
                                     │       │       │       │        │
           ┌─────────────────────────┼───────┼───────┼───────┼────────┼─────────────────────────┐
           │                         │       │       │       │        │                         │
           ▼                         ▼       ▼       ▼       ▼        ▼                         ▼
   ┌───────────────┐               ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌─────┐              ┌───────────────┐
   │ React SPA     │               │ A │   │ B │   │ C │   │ D │   │ API │              │ Voice Advisor │
   │ / (Static)    │               └───┴───┴───┴───┴───┴───┴───┘   │     │              │ (WebSockets)  │
   │               │                 Mock Insurers 9001-9004       │:8000│              │ :8011         │
   │               │               /insurer-a, b, c, d             │/api │              │ /voice-agent  │
   └───────────────┘                                               └─────┘              └───────────────┘
```

### 🌟 Why This Architecture Works Flawlessly on Render:
1. **Runs on Render Free Tier**: Fits completely inside **1 single Web Service**, which uses 1 free instance hour pool and **never runs out of Render's 750 free monthly hours**.
2. **Zero Mixed Content Errors**: Because everything is reverse-proxied through the same domain (`https://synova.onrender.com`), browsers never block API calls or iframes for being insecure HTTP.
3. **Zero CORS Issues**: All frontend requests originate and terminate on the same origin.
4. **All 4 Mock Insurers Run 24/7**: Parallel live quotation queries, iframe sequence testing, and policy issuance work without sleeping microservice delays.
5. **Realtime WebSockets Supported**: The AI Voice Advisor `/voice-agent/` proxy includes full WebSocket upgrade headers for audio/transcript streaming.

---

## 🗺️ Route Mapping

| Component | Path on Render | Internal Port | Technology |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | `/` | Static HTML | React 18 + Vite |
| **Core Backend API** | `/api/v1/` | `8000` | FastAPI + SQLite / Postgres |
| **Interactive API Docs** | `/docs` | `8000` | Swagger UI |
| **Policy Automation & OCR**| `/automation/` | `8001` | FastAPI + PyMuPDF |
| **Insurer A (ICICI Lombard)**| `/insurer-a/` & `/insurer-a/quote` | `9001` | FastAPI + Jinja2 Templates |
| **Insurer B (ACKO General)**| `/insurer-b/` & `/insurer-b/quote` | `9002` | FastAPI + Jinja2 Templates |
| **Insurer C (TATA AIG)** | `/insurer-c/` & `/insurer-c/quote` | `9003` | FastAPI + Jinja2 Templates |
| **Insurer D (HDFC ERGO)** | `/insurer-d/` & `/insurer-d/quote` | `9004` | FastAPI + Jinja2 Templates |
| **Realtime Voice Advisor** | `/voice-agent/` | `8011` | FastAPI + WebSockets |

---

## 🚀 Step-by-Step Deployment Guide

### Step 1: Push Code to GitHub
Ensure all your files are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure full-stack Render deployment with all mock insurers"
git push origin main
```

---

### Step 2: Deploy on Render

There are **two ways** to deploy on Render:

#### Option A: Using Render Blueprint (Recommended — 1 Click)
1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click the **New +** button in the top right and select **Blueprint**.
3. Connect your GitHub account and select your `synova-platform` repository.
4. Render will detect the `render.yaml` file in the root.
5. Review the plan (**Free**) and click **Apply**.
6. Render will automatically build the Docker container and deploy all services!

#### Option B: Deploying Manually as a Web Service
1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your repo.
4. Configure the service settings:
   - **Name**: `synova-platform`
   - **Region**: Oregon (or nearest to your users)
   - **Branch**: `main`
   - **Root Directory**: *(Leave blank)*
   - **Environment / Runtime**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Instance Type**: `Free`
5. In **Advanced** -> **Environment Variables**, add:
   - `ENVIRONMENT` = `production`
   - `PORT` = `10000` *(Render sets this automatically, but you can define it)*
   - `SECRET_KEY` = `synova-production-secure-key-2026-xyz` *(or any 32+ char string)*
   - `CORS_ORIGINS` = `*`
6. Click **Create Web Service**.

---

### Step 3: Monitor the Build
1. In the Render service dashboard, click **Logs**.
2. You will see:
   - Stage 1: React Vite frontend compiling static assets (`dist/`).
   - Stage 2: Python 3.11 installing dependencies and configuring Nginx & Supervisor.
   - Entrypoint: Initializing and seeding the Core Backend database and all 4 Mock Insurer databases.
   - Supervisord: Starting all 8 background processes.
3. Once you see:
   ```text
   [Supervisor] Starting Supervisord (Nginx + Backend + 4 Insurers + Automation + Voice Agent)...
   INFO success: nginx entered RUNNING state
   INFO success: backend entered RUNNING state
   INFO success: automation entered RUNNING state
   INFO success: insurer-a entered RUNNING state
   INFO success: insurer-b entered RUNNING state
   INFO success: insurer-c entered RUNNING state
   INFO success: insurer-d entered RUNNING state
   INFO success: voice-agent entered RUNNING state
   ```
4. Render will show a green **"Live"** badge and assign your public URL:
   `https://synova-platform.onrender.com`

---

## ✅ Verification Checklist After Deployment

Once deployed, test each feature using your Render URL:

1. **Frontend Landing Page**:
   - Open `https://<your-render-url>.onrender.com/`
   - Verify UI themes, animations, hero section, and navigation bar.

2. **Autonomous Multi-Insurer Quotation**:
   - Navigate to `/new-insurance`
   - Enter vehicle registration (e.g. `KA-01-MJ-4092`).
   - Click **Run Live Quotation**.
   - Watch the live sequential scraper iterate across **Gateway 1 (ICICI)**, **Gateway 2 (ACKO)**, **Gateway 3 (TATA AIG)**, and **Gateway 4 (HDFC ERGO)** inside the live preview window.
   - Verify the Best Value recommendation is highlighted with breakdown.

3. **Policy Renewal & Auto-OCR**:
   - Navigate to `/renew`
   - Upload sample policy (`sample_current_policy.pdf`).
   - Verify policy details are extracted and renewal quotes are calculated across all 4 gateways.

4. **8-Step Policy Buying & Instant Issuance**:
   - Navigate to `/marketplace`
   - Click **Buy Policy** on any policy card.
   - Advance through Proposer Details, Vehicle Registration, Nominee, Digital KYC, and Sandbox Payment.
   - Pay using Vault Wallet Balance, UPI, or Credit Card.
   - Verify Policy Success screen (Step 10) and download digital PDF certificate.

5. **Isolated Digital Vault**:
   - Navigate to `/vault`
   - Confirm purchased policies are listed in the user's isolated digital vault.
   - File a test vehicle claim.

6. **Admin Dashboard & Health Probes**:
   - Sign in as Admin (`admin@synova.ai` / `admin123`).
   - Navigate to `/admin`
   - Check the **Underwriting Gateway Health & Latency** monitor:
     - Gateway 1: ICICI Lombard (Port 9001) -> `ONLINE`
     - Gateway 2: ACKO General (Port 9002) -> `ONLINE`
     - Gateway 3: TATA AIG Assurance (Port 9003) -> `ONLINE`
     - Gateway 4: HDFC ERGO General (Port 9004) -> `ONLINE`
   - Click the gateway links to open the mock insurer portals in new tabs.

7. **Realtime AI Voice Advisor**:
   - Click **Ask Synova** / Floating Voice Advisor.
   - Speak or type queries like:
     - *"I want to buy insurance for my Creta"*
     - *"Compare ICICI and HDFC premiums"*
   - Verify AI speech synthesis and form autofill triggers.

---

## 🔧 Troubleshooting & FAQ

### Q: Why does Render take 50 seconds to respond on the first visit?
Render's **Free Tier** spins down inactive containers after 15 minutes of idle time. The first request after sleep takes ~50 seconds to spin the container back up. Once awake, all 8 services respond in under 50ms.
> **Tip:** You can keep the service awake 24/7 for free using a free uptime pinger like [UptimeRobot](https://uptimerobot.com) pinging `https://<your-render-url>.onrender.com/api/v1/health` every 10 minutes!

### Q: Can I use an external PostgreSQL database on Render?
Yes! By default, the container uses SQLite (`dev.db`), which requires zero setup. If you want PostgreSQL:
1. In Render, click **New +** -> **PostgreSQL**.
2. Copy the **Internal Database URL**.
3. In your `synova-platform` Web Service settings -> **Environment Variables**, add `DATABASE_URL` and paste the connection string.
4. The backend automatically switches to PostgreSQL!

### Q: How do I access the Swagger / OpenAPI docs?
Navigate to `https://<your-render-url>.onrender.com/docs`.
