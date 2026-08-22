#!/bin/bash
# Starts the full Insurance Agent Platform locally.
# Prerequisites: pip install requirements from each service.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Starting Mock Insurers ==="
(cd "$SCRIPT_DIR/mock-insurers/insurer-a" && python -m seed_data && uvicorn app.main:app --host 0.0.0.0 --port 9001) &
(cd "$SCRIPT_DIR/mock-insurers/insurer-b" && python -m seed_data && uvicorn app.main:app --host 0.0.0.0 --port 9002) &
(cd "$SCRIPT_DIR/mock-insurers/insurer-c" && python -m seed_data && uvicorn app.main:app --host 0.0.0.0 --port 9003) &
(cd "$SCRIPT_DIR/mock-insurers/insurer-d" && python -m seed_data && uvicorn app.main:app --host 0.0.0.0 --port 9004) &

sleep 2

echo "=== Starting Automation Service ==="
(cd "$SCRIPT_DIR/automation-service" && uvicorn app.main:app --host 0.0.0.0 --port 8001) &

sleep 1

echo "=== Starting Backend API ==="
(cd "$SCRIPT_DIR/backend" && uvicorn app.main:app --host 0.0.0.0 --port 8000) &

echo ""
echo "Platform is running:"
echo "  Backend API:        http://localhost:8000/docs"
echo "  Automation Service: http://localhost:8001/docs"
echo "  Insurer A:          http://localhost:9001/quote"
echo "  Insurer B:          http://localhost:9002/quote"
echo "  Insurer C:          http://localhost:9003/quote"
echo "  Insurer D:          http://localhost:9004/quote"
echo ""
echo "Press Ctrl+C to stop all services."

wait
