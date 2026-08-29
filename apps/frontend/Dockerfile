# ===================================================
# Stage 1: Build Frontend Assets with Node & Vite
# ===================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests & install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files & build production bundle
COPY . .
RUN npm run build

# ===================================================
# Stage 2: Serve Production Bundle with Nginx
# ===================================================
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
