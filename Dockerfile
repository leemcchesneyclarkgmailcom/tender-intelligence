# ─── Tender Intelligence — Production Dockerfile ────────────────────────
# Multi-stage build for a minimal production image.

# ---------- Stage 1: Dependencies ----------
FROM node:20-slim AS deps
WORKDIR /app

# Install Bun for dependency installation speed
RUN npm install -g bun

# Copy package manifests
COPY package.json bun.lock* package-lock.json* ./
COPY prisma ./prisma

# Install dependencies (including dev for the build)
RUN bun install --frozen-lockfile || npm ci

# ---------- Stage 2: Build ----------
FROM node:20-slim AS builder
WORKDIR /app
RUN npm install -g bun

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Prisma client
RUN bun run db:generate

# Build Next.js (standalone output)
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# ---------- Stage 3: Runner ----------
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Create db directory for SQLite (if used)
RUN mkdir -p /app/db && chown nextjs:nodejs /app/db

USER nextjs

EXPOSE 3000

ENV DATABASE_URL="file:/app/db/custom.db"

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/api/ai-health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
