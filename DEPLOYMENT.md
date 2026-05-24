# Deployment Guide — Bondenifarm

This guide covers deploying the Bondenifarm application with the **frontend on Vercel** and the **backend on your own VPS** using Docker.

---

## Prerequisites

- A GitHub account with this repository pushed
- A VPS (Ubuntu 22.04+ recommended) with Docker and Docker Compose installed
- A domain name with DNS access
- (Optional) A Vercel account (free tier works)

---

## 1. DNS Configuration

Set up these DNS records before deploying:

| Record | Type | Value |
|--------|------|-------|
| `yourdomain.com` | CNAME | `cname.vercel-dns.com` |
| `www.yourdomain.com` | CNAME | `cname.vercel-dns.com` |
| `api.yourdomain.com` | A | `<your VPS IP address>` |

> Replace `yourdomain.com` with your actual domain throughout this guide.

---

## 2. Frontend Deployment (Vercel)

### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **"Add New Project"**
3. Import the `timkenar/Bondenifarm` repository

### Step 2: Configure Build Settings

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Framework Preset** | Vite (should auto-detect) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### Step 3: Set Environment Variables

Add this environment variable in Vercel's project settings:

```
VITE_API_URL=https://api.yourdomain.com/api
```

### Step 4: Deploy

Click **Deploy**. Vercel will build and deploy your frontend automatically.

### Auto-Deployments

Every push to the `main` branch will trigger a new deployment on Vercel automatically.

---

## 3. Backend Deployment (VPS with Docker)

### Step 1: Install Docker on Your VPS

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Install Docker (if not installed)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin

# Log out and back in for group changes
exit
ssh user@your-vps-ip
```

### Step 2: Clone the Repository

```bash
git clone https://github.com/timkenar/Bondenifarm.git
cd Bondenifarm
```

### Step 3: Create Environment Files

```bash
# Copy example files
cp .env.prod.example .env.prod
cp .env.prod.db.example .env.prod.db
```

### Step 4: Configure Environment Variables

Edit `.env.prod`:

```bash
nano .env.prod
```

Set these values:

```env
# Django Settings
SECRET_KEY=your-unique-random-secret-key-at-least-50-characters-long
DEBUG=False
ALLOWED_HOSTS=api.yourdomain.com

# Database (must match .env.prod.db)
DATABASE=postgres
DATABASE_URL=postgresql://bondenifarm:your-secure-db-password@db:5432/bondenifarm
SQL_ENGINE=django.db.backends.postgresql
SQL_DATABASE=bondenifarm
SQL_USER=bondenifarm
SQL_PASSWORD=your-secure-db-password
SQL_HOST=db
SQL_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/1

# CORS — your Vercel frontend URLs
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

Edit `.env.prod.db`:

```bash
nano .env.prod.db
```

```env
POSTGRES_USER=bondenifarm
POSTGRES_PASSWORD=your-secure-db-password
POSTGRES_DB=bondenifarm
```

> ⚠️ Make sure `SQL_PASSWORD` in `.env.prod` matches `POSTGRES_PASSWORD` in `.env.prod.db`

### Step 5: Configure Nginx

```bash
nano nginx/nginx.conf
```

Replace all instances of `api.yourdomain.com` with your actual domain.

### Step 6: Build and Start Services

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

This starts:
- **web** — Django API with Gunicorn (3 workers)
- **db** — PostgreSQL 15
- **redis** — Redis 7
- **nginx** — Reverse proxy on ports 80/443

### Step 7: Verify It's Running

```bash
# Check all containers are running
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f web

# Test the API
curl http://localhost:8000/api/
```

### Step 8: Create Admin Superuser

```bash
docker compose -f docker-compose.prod.yml exec web python manage.py createsuperuser
```

### Step 9: Set Up SSL with Let's Encrypt

> Make sure your DNS A record for `api.yourdomain.com` is pointing to your VPS IP first.

```bash
# Obtain SSL certificate
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot --webroot-path=/var/lib/letsencrypt \
  -d api.yourdomain.com
```

After the certificate is issued, enable HTTPS in nginx:

```bash
nano nginx/nginx.conf
```

Uncomment the HTTPS server block (the `listen 443 ssl` section) and restart:

```bash
docker compose -f docker-compose.prod.yml restart nginx
```

---

## 4. Post-Deployment Verification

1. Visit `https://yourdomain.com` — you should see the Bondenifarm frontend
2. Visit `https://api.yourdomain.com/api/` — you should see the DRF API root
3. Visit `https://api.yourdomain.com/admin/` — Django admin panel
4. Log in from the frontend with your superuser credentials

---

## 5. Updating the Application

After making code changes and pushing to GitHub:

### Frontend (Automatic)
Vercel auto-deploys on every push to `main`. No action needed.

### Backend (Manual)

```bash
ssh user@your-vps-ip
cd Bondenifarm

# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build
```

The entrypoint script automatically runs migrations and collects static files on each restart.

---

## 6. Useful Commands

```bash
# View real-time logs
docker compose -f docker-compose.prod.yml logs -f web

# Run Django management commands
docker compose -f docker-compose.prod.yml exec web python manage.py migrate
docker compose -f docker-compose.prod.yml exec web python manage.py collectstatic --noinput
docker compose -f docker-compose.prod.yml exec web python manage.py shell

# Restart a specific service
docker compose -f docker-compose.prod.yml restart web
docker compose -f docker-compose.prod.yml restart nginx

# Stop everything
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (⚠️ deletes database data)
docker compose -f docker-compose.prod.yml down -v

# Access PostgreSQL directly
docker compose -f docker-compose.prod.yml exec db psql -U bondenifarm -d bondenifarm

# Backup database
docker compose -f docker-compose.prod.yml exec db pg_dump -U bondenifarm bondenifarm > backup_$(date +%Y%m%d).sql

# Restore database
cat backup_file.sql | docker compose -f docker-compose.prod.yml exec -T db psql -U bondenifarm -d bondenifarm
```

---

## 7. SSL Certificate Renewal

Let's Encrypt certificates expire every 90 days. Set up automatic renewal:

```bash
# Add to crontab
crontab -e
```

Add this line:

```
0 3 1 * * cd /path/to/Bondenifarm && docker compose -f docker-compose.prod.yml run --rm certbot renew && docker compose -f docker-compose.prod.yml restart nginx
```

This renews the certificate on the 1st of every month at 3 AM.

---

## 8. Troubleshooting

| Issue | Solution |
|-------|----------|
| **502 Bad Gateway** | Check if `web` container is running: `docker compose logs web` |
| **CORS errors in browser** | Verify `CORS_ALLOWED_ORIGINS` in `.env.prod` matches your frontend URL exactly |
| **Database connection refused** | Ensure `db` container is healthy: `docker compose ps` |
| **Static files not loading** | Run `docker compose exec web python manage.py collectstatic --noinput` |
| **SSL certificate error** | Ensure DNS is propagated: `dig api.yourdomain.com` |
| **Permission denied** | Run `sudo chown -R $USER:$USER .` in the project directory |

---

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────────────────────┐
│                 │         │           Your VPS               │
│   Vercel CDN    │         │                                  │
│   (Frontend)    │  HTTPS  │  ┌─────────┐    ┌───────────┐   │
│                 │────────▶│  │  Nginx  │───▶│  Django   │   │
│  yourdomain.com │         │  │  :80/443│    │  :8000    │   │
│                 │         │  └─────────┘    └───────────┘   │
└─────────────────┘         │                      │          │
                            │              ┌───────┴───────┐  │
                            │              │               │  │
                            │        ┌─────┴──┐    ┌──────┴┐ │
                            │        │Postgres│    │ Redis │ │
                            │        │  :5432 │    │ :6379 │ │
                            │        └────────┘    └───────┘ │
                            └──────────────────────────────────┘
```
