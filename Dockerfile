# Stage 1: Build the frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

# Copy frontend dependency files
COPY frontend/package.json frontend/package-lock.json* ./
# Install dependencies
RUN npm ci

# Copy the rest of the frontend code
COPY frontend/ .
# Build the application
RUN npm run build


# Stage 2: Setup the backend and serve
FROM python:3.12-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install system dependencies
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt && \
    pip install gunicorn whitenoise

# Copy backend code
COPY backend/ .

# Copy built frontend assets from the previous stage
# We'll put them in a directory that Django can be configured to look at
COPY --from=frontend-builder /app/frontend/dist /app/static/dist

# Create a directory for collected static files
RUN mkdir -p /app/staticfiles

# Copy entrypoint script if it exists in root or backend
COPY backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# This entrypoint usually handles migration and static collection
# If you don't use the entrypoint, you can use the CMD below directly
ENTRYPOINT ["/entrypoint.sh"]

# Default command to run the server
CMD ["gunicorn", "bondenifarm.wsgi:application", "--bind", "0.0.0.0:8000"]
