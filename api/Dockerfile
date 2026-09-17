# STAGE 1: Builder
FROM node:24.13.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
# Hapus devDependencies biar node_modules-nya tinggal sisa versi production
RUN npm prune --production

# STAGE 2: Production
FROM node:24.13.0-alpine
WORKDIR /app

# Copy package.json & node_modules hemat dari Stage 1
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma asset & hasil build TS
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 5000
CMD ["node", "dist/src/index.js"]