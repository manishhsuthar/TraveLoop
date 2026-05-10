# Traveloop (React + Django + PostgreSQL)

## Stack
- Frontend: React + Vite
- Backend: Django + DRF
- Database: PostgreSQL (local)

## Backend setup
cd backend
cp .env.example .env
cd ..
source .venv/bin/activate
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver

## Frontend setup
cd frontend
npm install
npm run dev

## API base
Frontend expects: http://127.0.0.1:8000/api
Override with: VITE_API_BASE_URL
