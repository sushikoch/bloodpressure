# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies for client build
WORKDIR /app/client
COPY client/src ./src
COPY client/tsconfig.json ./
COPY client/vite.config.ts ./
COPY client/index.html ./
RUN npm ci && npm run build

# Install dependencies and build server
WORKDIR /app/server
COPY server/src ./src
COPY server/migrations ./migrations
COPY server/tsconfig.json ./
RUN npm ci && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built server and dependencies
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/package.json ./

# Copy built client to server
COPY --from=builder /app/client/build ./dist/public

# Copy migrations
COPY server/migrations ./migrations

EXPOSE 3000

CMD ["node", "dist/index.js"]
