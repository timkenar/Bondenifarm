# Bondenifarm

A farm management platform built with Django (backend) and React + TypeScript (frontend).

Bondeni Farm helps farm owners and their teams run day-to-day operations from one
place — tracking **livestock**, **crops**, **produce**, **inventory**, the
**workforce**, and **commerce/sales**, with a configurable landing page and farm
profile. Access to each area is controlled by a role assigned to every member, so
people only see what's relevant to their job.

## User Roles & Permissions

Every user is assigned one role, which determines the menus and pages they can
access. Roles are managed by a Super Admin or Farm Manager under
**Settings → Team**, where members can be added, have their role changed, be
deactivated, or removed.

The hierarchy, from most to least access:

| Role | Description | Can access |
|------|-------------|------------|
| **Super Admin** | Owner-level account with full control over the whole platform, including team management and CMS. | Everything |
| **Farm Manager** | Runs daily operations across all departments. | Everything |
| **Accountant** | Finance & records focus — sales, stock and payroll-related views. | Dashboard, Commerce, Produce, Inventory, Workforce, Settings |
| **Veterinarian** | Animal-health focus. | Dashboard, Livestock, Produce, Settings |
| **Worker** | Field staff who only see what they need for their tasks. | Dashboard, Produce, Crops, Livestock records, Commerce, Settings |

Notes:

- **Settings** is available to everyone so each member can edit their own profile
  (name, phone, password). Only Super Admin and Farm Manager additionally see the
  **Team** management and landing-page **CMS** controls.
- Permissions are enforced both in the UI (sidebar, mobile navigation and route
  guards) and on the backend API, so restricted areas can't be reached by editing
  the URL.
- The visible menus per role are defined centrally in
  `frontend/src/config/permissions.ts`, and the role choices live in the backend
  user model (`backend/users/models.py`).

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
