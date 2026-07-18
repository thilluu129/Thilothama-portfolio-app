#!/usr/bin/env bash
# Render build script — runs automatically on every deploy
set -o errexit

pip install -r requirements.txt

python manage.py migrate --no-input
python manage.py collectstatic --no-input

# Seed the database with portfolio data (only if empty)
python manage.py seed_portfolio
