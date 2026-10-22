# ==========================================
# Stage 1: Build the Vite React Frontend UI
# ==========================================
FROM node:20-alpine AS client-builder

WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund || npm install --legacy-peer-deps --no-audit --no-fund

COPY client/ ./
RUN npm run build

# ==========================================
# Stage 2: Build the Express Backend Server
# ==========================================
FROM node:20-alpine AS server-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund || npm install --legacy-peer-deps --no-audit --no-fund

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY tsconfig.json ./
RUN npm run build

# ==========================================
# Stage 3: Production Runner
# ==========================================
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps --no-audit --no-fund || npm install --omit=dev --legacy-peer-deps --no-audit --no-fund

COPY prisma ./prisma
RUN npx prisma generate

COPY --from=server-builder /app/dist ./dist
COPY --from=client-builder /app/client/dist ./public

ENV NODE_ENV=production
ENV PORT=3010
EXPOSE 3010

CMD ["node", "dist/index.js"]
