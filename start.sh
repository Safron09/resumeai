#!/bin/bash
# Start Redis + Django backend + Celery worker + React frontend

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting ResumeAI dev servers..."

# Redis (starts in background if not already running)
if ! redis-cli ping &>/dev/null; then
  echo "  Starting Redis..."
  redis-server --daemonize yes --logfile /tmp/redis-resumeai.log
fi

# Backend (Django)
osascript -e "tell application \"Terminal\" to do script \"cd '$ROOT/backend' && source '$ROOT/venv/bin/activate' && python manage.py runserver\""

# Celery worker
osascript -e "tell application \"Terminal\" to do script \"cd '$ROOT/backend' && source '$ROOT/venv/bin/activate' && celery -A config worker -l info\""

# Frontend
osascript -e "tell application \"Terminal\" to do script \"cd '$ROOT/frontend' && npm run dev\""

echo ""
echo "  Redis    → localhost:6379"
echo "  Backend  → http://localhost:8000"
echo "  Celery   → worker running"
echo "  Frontend → http://localhost:5173"
echo ""
echo "Open http://localhost:5173 to start QA"
