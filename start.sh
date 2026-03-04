#!/bin/bash
# Start Django backend + React frontend together

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting ResumeAI dev servers..."

# Backend
osascript -e "tell application \"Terminal\" to do script \"cd '$ROOT/backend' && source '$ROOT/venv/bin/activate' && python manage.py runserver\""

# Frontend
osascript -e "tell application \"Terminal\" to do script \"cd '$ROOT/frontend' && npm run dev\""

echo ""
echo "  Backend  → http://localhost:8000"
echo "  Frontend → http://localhost:5173"
echo ""
echo "Open http://localhost:5173 to start QA"
