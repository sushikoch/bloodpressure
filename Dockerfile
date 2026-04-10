FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies for server
WORKDIR /app/server
RUN npm ci --only=production

# Install dependencies for client
WORKDIR /app/client
RUN npm ci

# Build React app
RUN npm run build

# Copy source code for server
WORKDIR /app/server
COPY server/src ./src
COPY server/migrations ./migrations
COPY server/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Copy built client to server public
COPY --from=client /app/client/build ../server/dist/public

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
