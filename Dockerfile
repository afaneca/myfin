# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

ARG VITE_MYFIN_BASE_API_URL
ENV VITE_MYFIN_BASE_API_URL="myfin-api-url-placeholder"

# Build the app
RUN npm run build

# Serve stage
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Add metadata
LABEL maintainer="José Valdiviesso <me@zmiguel.me>"
LABEL author="José Valdiviesso <me@zmiguel.me>"
LABEL version="7.4.2"
LABEL description="MyFin Frontend Application"
LABEL org.opencontainers.image.authors="José Valdiviesso <me@zmiguel.me>"
LABEL org.opencontainers.image.version="7.4.2"
LABEL org.opencontainers.image.title="MyFin Frontend"
LABEL org.opencontainers.image.description="Web frontend for the personal finances platform that'll help you budget, keep track of your income/spending and forecast your financial future."
LABEL org.opencontainers.image.source="https://github.com/afaneca/myfin"

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|myfin-api-url-placeholder|$VITE_MYFIN_BASE_API_URL|g" {} +' >> /start.sh && \
    echo "nginx -g 'daemon off;'" >> /start.sh && \
    chmod +x /start.sh

# Expose port 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:80/ | grep -q '<title>MyFin</title>' || exit 1

# Start nginx
CMD ["/start.sh"]
