web: gunicorn --chdir backend config.wsgi:application
worker: celery --workdir backend -A config worker --loglevel=info
