# Bondenifarm

A farm management platform built with Django (backend) and React + TypeScript (frontend).

## Architecture

```
├── backend/          # Django REST API (self-hosted VPS with Docker)
├── frontend/         # React + Vite SPA (deployed to Vercel)
├── nginx/            # Nginx reverse proxy config for production
├── docker-compose.yml         # Local development
└── docker-compose.prod.yml    # Production deployment
```

## Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### With Docker (full stack)
```bash
docker-compose up --build
```

## Production Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel
2. Set **Root Directory** to `frontend`
3. Set **Framework Preset** to Vite
4. Add environment variable:
   - `VITE_API_URL` = `https://api.yourdomain.com/api`
5. Deploy

### Backend (VPS with Docker)

1. SSH into your VPS
2. Clone the repository
3. Create environment files:
   ```bash
   cp .env.prod.example .env.prod
   cp .env.prod.db.example .env.prod.db
   # Edit both files with your actual credentials
   ```
4. Update `nginx/nginx.conf` — replace `api.yourdomain.com` with your domain
5. Start services:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```
6. Set up SSL with Certbot:
   ```bash
   docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
     --webroot --webroot-path=/var/lib/letsencrypt \
     -d api.yourdomain.com
   ```
7. Uncomment the HTTPS server block in `nginx/nginx.conf` and restart:
   ```bash
   docker-compose -f docker-compose.prod.yml restart nginx
   ```

### DNS Setup
- Point `yourdomain.com` → Vercel (frontend)
- Point `api.yourdomain.com` → Your VPS IP (backend)
