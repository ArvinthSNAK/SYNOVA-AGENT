# 🚀 SYNOVA AI Insurance Platform — Production Deployment Guide

This guide provides step-by-step instructions to deploy the entire SYNOVA platform (Frontend + Backend + Automation Service + All 4 Mock Insurer APIs) in 100% working condition.

---

## 🏗️ Architecture & Port Map

| Component | Technology | Internal Port | Public Host Port | Health / Docs URL |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Web App** | React 18 + Vite + Nginx | `80` | `80` / `5173` | `http://<HOST_IP>/` |
| **Core Backend API** | FastAPI + SQLAlchemy | `8000` | `8000` | `http://<HOST_IP>:8000/docs` |
| **Automation & OCR** | FastAPI + EasyOCR | `8001` | `8001` | `http://<HOST_IP>:8001/docs` |
| **Insurer A (ICICI Lombard)** | FastAPI Mock Gateway | `9001` | `9001` | `http://<HOST_IP>:9001/docs` |
| **Insurer B (ACKO)** | FastAPI Mock Gateway | `9002` | `9002` | `http://<HOST_IP>:9002/docs` |
| **Insurer C (TATA AIG)** | FastAPI Mock Gateway | `9003` | `9003` | `http://<HOST_IP>:9003/docs` |
| **Insurer D (HDFC ERGO)** | FastAPI Mock Gateway | `9004` | `9004` | `http://<HOST_IP>:9004/docs` |

---

## 📦 Option 1: One-Click Docker Deployment (Recommended)

Deploy on any Linux VM (AWS EC2, DigitalOcean Droplet, GCP Compute, Azure VM, Hetzner, or local Docker Desktop).

### Prerequisites
- [Docker](https://docs.docker.com/engine/install/) & [Docker Compose](https://docs.docker.com/compose/install/) installed.
- Ports `80`, `8000`, `8001`, `9001`, `9002`, `9003`, `9004` open in your server firewall / security group.

### 1. Clone & Navigate to Repository
```bash
git clone <YOUR_REPO_URL> synova-platform
cd synova-platform
```

### 2. Build & Launch All 7 Services
```bash
docker compose up -d --build
```

### 3. Verify Container Health
```bash
docker compose ps
```
You should see all 7 containers running:
- `synova-frontend` (Up, 0.0.0.0:80->80/tcp)
- `synova-backend` (Up, 0.0.0.0:8000->8000/tcp)
- `synova-automation` (Up, 0.0.0.0:8001->8001/tcp)
- `synova-insurer-a-icici` (Up, 0.0.0.0:9001->9001/tcp)
- `synova-insurer-b-acko` (Up, 0.0.0.0:9002->9002/tcp)
- `synova-insurer-c-tata` (Up, 0.0.0.0:9003->9003/tcp)
- `synova-insurer-d-hdfc` (Up, 0.0.0.0:9004->9004/tcp)

### 4. Stop or Restart
```bash
# Restart all
docker compose restart

# View live logs
docker compose logs -f

# Teardown
docker compose down
```

---

## ☁️ Option 2: 1-Click Render Deployment (Recommended for Cloud)

Deploy the **entire full-stack ecosystem** (React Frontend + Core Backend API + All 4 Mock Insurers + Voice Advisor + Automation) in a single high-performance container on Render:

- **100% Free Tier Compatible**: Runs within 1 Render Web Service (never exhausts monthly free hours).
- **Zero Mixed Content or CORS errors**: Unified HTTPS domain for APIs and mock insurer iframes.
- **Blueprint Supported**: Use the root `render.yaml` for 1-Click automated deployment.

👉 **Complete Step-by-Step Instructions**: See [RENDER_DEPLOYMENT.md](file:///c:/Users/HariharanMurugesan/Downloads/Synova-v2/arvinth-wip/RENDER_DEPLOYMENT.md).

### Quick Render Deployment Steps:
1. Push this repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** -> **Blueprint**.
3. Connect your GitHub repository.
4. Render detects `render.yaml` and `Dockerfile` automatically.
5. Click **Apply** — Render builds and boots all 8 services in 3 minutes!

---

## 🖥️ Option 3: Direct Server Deployment (PM2 / Systemd on Ubuntu)

### 1. Install System Dependencies
```bash
sudo apt update && sudo apt install -y python3-pip python3-venv nodejs npm nginx
sudo npm install -g pm2
```

### 2. Setup Python Virtualenv & Dependencies
```bash
python3 -m venv venv
source venv/bin/activate

pip install -r apps/backend/requirements.txt
pip install -r apps/automation-service/requirements.txt
pip install -r apps/mock-insurers/insurer-a/requirements.txt
pip install -r apps/mock-insurers/insurer-b/requirements.txt
pip install -r apps/mock-insurers/insurer-c/requirements.txt
pip install -r apps/mock-insurers/insurer-d/requirements.txt
```

### 3. Build Frontend Bundle
```bash
cd apps/frontend
npm install
npm run build
cd ../..
```

### 4. Launch Everything with PM2
Create an `ecosystem.config.js`:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## ✅ Post-Deployment Verification Checklist

1. **Frontend**: Open `http://<SERVER_IP>/` — Verify Landing Page, Insurer Marquee, and OwlSure branding.
2. **Instant Quotes**: Go to `/new-insurance` or `/compare` — Live multi-quote aggregation queries Insurers A, B, C, D in parallel.
3. **Policy Purchase**: Click **Buy Policy** on any policy card — Complete Sandbox Payment & download policy certificate.
4. **Digital Vault**: Navigate to `/vault` — Verify issued policy is listed and claims can be submitted.
5. **AI Copilot**: Click **Ask Euler** floating assistant — Verify AI prompts and guidance.
