# LINE Yield Backend Services

Comprehensive backend infrastructure for the LINE Yield protocol, featuring gasless transactions, automated yield optimization, and real-time analytics.

## 🚀 Features

- **Gasless Transactions**: Zero-fee user experience with relayer service
- **Yield Oracle**: Real-time monitoring of DeFi protocol yields
- **Auto-Rebalancing**: Intelligent fund allocation optimization
- **Analytics Engine**: Comprehensive data collection and analysis
- **Health Monitoring**: System health checks and alerting
- **Rate Limiting**: Protection against abuse and spam

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Yield Oracle  │    │   Rebalancer    │    │ Gasless Relayer │
│                 │    │                 │    │                 │
│ • Aave Monitor  │    │ • Opportunity   │    │ • Fee Delegation│
│ • KlaySwap API  │    │   Detection     │    │ • Rate Limiting │
│ • Compound Data │    │ • Auto Execute  │    │ • Gas Estimation│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Contract Service│
                    │                 │
                    │ • Gasless Vault │
                    │ • Strategy Mgmt │
                    │ • Yield Harvest │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Kaia Network  │
                    │                 │
                    │ • Smart Contracts│
                    │ • Fee Delegation│
                    │ • Event Logging │
                    └─────────────────┘
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/                 # Configuration management
│   ├── services/              # Core services
│   │   ├── yield-oracle/      # Yield monitoring service
│   │   ├── rebalancer/        # Auto-rebalancing engine
│   │   ├── gasless-relayer/   # Gasless transaction relayer
│   │   └── contract-service.ts # Smart contract interactions
│   ├── models/               # Database models and schemas
│   ├── utils/               # Utility functions
│   └── index.ts            # Application entry point
├── scripts/                # Deployment and maintenance scripts
├── tests/                 # Test suite
├── logs/                 # Application logs
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Kaia-compatible wallet with testnet funds

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/line-yield.git
cd line-yield/backend

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Update environment variables
nano .env
```

### Configuration

Update the `.env` file with your configuration:

```bash
# Required: Kaia Network
KAIA_RPC_URL=https://api.baobab.klaytn.net:8651
WALLET_PRIVATE_KEY=your_private_key_here

# Required: Contract Addresses
VAULT_ADDRESS=0xYourVaultAddress
GASLESS_VAULT_ADDRESS=0xYourGaslessVaultAddress

# Required: Database
DB_HOST=localhost
DB_NAME=line_yield
DB_USER=postgres
DB_PASSWORD=your_password
```

### Database Setup

```bash
# Create database
createdb line_yield

# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### Development

```bash
# Start in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔧 Services

### Yield Oracle

Monitors yield rates across multiple DeFi protocols:

- **Aave Integration**: Real-time APY tracking
- **KlaySwap Monitoring**: DEX yield opportunities
- **Compound Analysis**: Lending protocol yields
- **Data Storage**: Historical yield data
- **Event Emission**: Triggers rebalancing decisions

### Rebalancer

Automated fund allocation optimization:

- **Opportunity Detection**: Identifies profitable rebalancing opportunities
- **Gas Price Monitoring**: Executes only when gas costs are reasonable
- **Risk Management**: Prevents excessive rebalancing
- **Performance Tracking**: Monitors rebalancing effectiveness

### Gasless Relayer

Zero-fee transaction service:

- **Fee Delegation**: Sponsors all user transaction costs
- **Signature Verification**: Ensures transaction authenticity
- **Rate Limiting**: Prevents abuse and spam
- **Gas Estimation**: Optimizes transaction costs

## 📊 Database Schema

### Core Tables

- **yield_data**: Historical yield information
- **transactions**: On-chain transaction records
- **gasless_transactions**: Gasless transaction logs
- **strategy_performance**: Strategy performance metrics
- **user_activity**: User behavior analytics
- **vault_metrics**: Overall vault statistics

### Indexes

Optimized for high-performance queries:
- Strategy and timestamp indexes
- User address lookups
- Transaction hash searches
- Time-based analytics

## 🔒 Security Features

### Rate Limiting
- IP-based request limiting
- Endpoint-specific limits
- Sliding window algorithm
- Automatic retry headers

### Input Validation
- Joi schema validation
- Address format verification
- Parameter sanitization
- SQL injection prevention

### Access Control
- JWT token authentication
- Role-based permissions
- API key management
- CORS configuration

## 📈 Monitoring & Analytics

### Health Checks
- Database connectivity
- Blockchain connection
- Service status monitoring
- Performance metrics

### Logging
- Structured JSON logging
- Error tracking and alerting
- Performance monitoring
- Security event logging

### Metrics
- Transaction success rates
- Gas usage optimization
- User activity patterns
- Yield performance tracking

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t line-yield-backend .

# Run with environment variables
docker run -d \
  --name line-yield-backend \
  --env-file .env \
  -p 3000:3000 \
  line-yield-backend
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: line-yield-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: line-yield-backend
  template:
    metadata:
      labels:
        app: line-yield-backend
    spec:
      containers:
      - name: backend
        image: line-yield-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `development` |
| `PORT` | Server port | No | `3000` |
| `KAIA_RPC_URL` | Kaia network RPC | Yes | - |
| `WALLET_PRIVATE_KEY` | Relayer wallet key | Yes | - |
| `DB_HOST` | Database host | Yes | `localhost` |
| `GASLESS_ENABLED` | Enable gasless transactions | No | `true` |

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### Load Testing
```bash
npm run test:load
```

### Coverage Report
```bash
npm run test:coverage
```

## 📚 API Documentation

### Health Check
```http
GET /health
```

### Gasless Transactions
```http
POST /relay/deposit
POST /relay/withdraw
POST /relay/mint
POST /relay/redeem
```

### Gas Estimation
```http
POST /estimate-gas
```

### User Nonce
```http
GET /nonce/:userAddress
```

## 🔧 Maintenance

### Database Maintenance
```bash
# Backup database
npm run db:backup

# Restore database
npm run db:restore

# Run migrations
npm run db:migrate
```

### Log Management
```bash
# View logs
tail -f logs/combined.log

# Rotate logs
npm run logs:rotate

# Clean old logs
npm run logs:clean
```

### Performance Monitoring
```bash
# Check service health
curl http://localhost:3000/health

# View metrics
npm run metrics

# Performance analysis
npm run analyze
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify connection credentials
   - Ensure database exists

2. **Blockchain Connection Issues**
   - Verify RPC URL is correct
   - Check wallet has sufficient funds
   - Ensure network is accessible

3. **Gasless Transactions Failing**
   - Verify relayer wallet is funded
   - Check gas price limits
   - Ensure contract addresses are correct

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Verbose output
DEBUG=* npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🆘 Support

- **Documentation**: [docs.line-yield.com](https://docs.line-yield.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/line-yield/issues)
- **Discord**: [LINE Yield Community](https://discord.gg/line-yield)
- **Email**: support@line-yield.com

---

**Built for the Kaia Wave Stablecoin Summer Hackathon**

This backend infrastructure provides the foundation for a production-ready yield optimization protocol with gasless transactions and automated rebalancing.
