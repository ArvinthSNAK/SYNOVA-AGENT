#!/bin/bash
# Starts all 4 mock insurer servers on ports 9001-9004.
# Run from the mock-insurers/ directory.

set -e

echo "Seeding insurer databases..."
(cd insurer-a && python -m seed_data)
(cd insurer-b && python -m seed_data)
(cd insurer-c && python -m seed_data)
(cd insurer-d && python -m seed_data)

echo "Starting mock insurers..."
(cd insurer-a && uvicorn app.main:app --host 0.0.0.0 --port 9001) &
(cd insurer-b && uvicorn app.main:app --host 0.0.0.0 --port 9002) &
(cd insurer-c && uvicorn app.main:app --host 0.0.0.0 --port 9003) &
(cd insurer-d && uvicorn app.main:app --host 0.0.0.0 --port 9004) &

echo "All mock insurers running on ports 9001-9004"
echo "  Insurer A: http://localhost:9001/quote"
echo "  Insurer B: http://localhost:9002/quote"
echo "  Insurer C: http://localhost:9003/quote"
echo "  Insurer D: http://localhost:9004/quote"

wait
