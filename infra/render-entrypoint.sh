#!/bin/bash
set -e

echo "=========================================================="
echo "   SYNOVA AI Insurance Platform — Production Container"
echo "=========================================================="

# Default PORT to 10000 if not provided by Render
export PORT="${PORT:-10000}"
echo "[Render] Listening on port: ${PORT}"

# Substitute $PORT into Nginx config
envsubst '${PORT}' < /etc/nginx/conf.d/render.conf.template > /etc/nginx/conf.d/default.conf

# Initialize and seed databases
echo "[Database] Initializing and seeding Core Backend DB..."
(cd /app/apps/backend && python seed_data.py || true)

echo "[Database] Seeding Mock Insurers (ICICI, ACKO, TATA AIG, HDFC ERGO)..."
(cd /app/apps/mock-insurers/insurer-a && python -m seed_data || true)
(cd /app/apps/mock-insurers/insurer-b && python -m seed_data || true)
(cd /app/apps/mock-insurers/insurer-c && python -m seed_data || true)
(cd /app/apps/mock-insurers/insurer-d && python -m seed_data || true)

echo "[Ready] All databases and mock insurers seeded."
echo "[Supervisor] Starting Supervisord (Nginx + Backend + 4 Insurers + Automation + Voice Agent)..."

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
