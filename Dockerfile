# ---- Build Stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine

RUN apk add --no-cache tini curl

# Use non-root user for better security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Built artifacts
COPY --from=build /app/dist ./dist

# Configurable port (override at runtime via Coolify / docker -e)
ENV PORT=5000 \
    NODE_ENV=production

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT:-5000}/api/ || exit 1

USER appuser

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main"]
