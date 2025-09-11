FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY contracts/ ./contracts/
COPY scripts/ ./scripts/
COPY hardhat.config.ts ./

# Install dependencies
RUN npm ci

# Build contracts
RUN npm run compile

# Run tests
RUN npm test

# Production image
FROM node:18-alpine AS production

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/artifacts ./artifacts
COPY --from=builder /app/cache ./cache
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy deployment scripts
COPY scripts/deploy.ts ./scripts/
COPY hardhat.config.ts ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S kaia -u 1001

# Change ownership
RUN chown -R kaia:nodejs /app

USER kaia

EXPOSE 8545

CMD ["npx", "hardhat", "node"]
