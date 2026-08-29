# ------------------------------------------------------------------------------
# Stage 1: Build React Vite Production Bundle
# ------------------------------------------------------------------------------
FROM node:20-slim AS frontend-builder
WORKDIR /build

COPY apps/frontend/package*.json ./
RUN npm ci || npm install

COPY apps/frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Multi-Service Container (Python 3.11 + Nginx + Supervisord)
# ------------------------------------------------------------------------------
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    gettext-base \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install combined Python dependencies
COPY requirements-render.txt .
RUN pip install --no-cache-dir -r requirements-render.txt

# Copy application source code
COPY apps/ ./apps/
COPY sample_current_policy.pdf .

# Copy compiled frontend from Stage 1 into Nginx web root
COPY --from=frontend-builder /build/dist /var/www/html

# Setup Nginx and Supervisor configuration
COPY infra/nginx-render.conf.template /etc/nginx/conf.d/render.conf.template
COPY infra/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY infra/render-entrypoint.sh /app/render-entrypoint.sh

RUN chmod +x /app/render-entrypoint.sh

# Remove default site configs
RUN rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf

# Render dynamic port assignment (defaults to 10000)
ENV PORT=10000
EXPOSE 10000

CMD ["/app/render-entrypoint.sh"]
