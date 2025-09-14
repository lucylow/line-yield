# Kaia Smart Contracts Deployment Guide

## Overview
This guide covers all the smart contracts needed for the LINE Yield platform on the Kaia network. All contracts are Kaia-compatible and follow KIP standards.

## Contract Inventory

### Core Contracts
1. **Vault.sol** - Main yield vault for USDT deposits
2. **USDTYieldVault.sol** - Specialized USDT yield vault
3. **GaslessVault.sol** - Gasless transaction vault
4. **StrategyManager.sol** - Manages yield strategies
5. **AdvancedStrategyManager.sol** - Advanced strategy management

### Strategy Contracts
6. **AaveStrategy.sol** - Aave protocol integration
7. **KlaySwapStrategy.sol** - KlaySwap DEX integration
8. **MockCompoundStrategy.sol** - Compound protocol mock
9. **IYieldStrategy.sol** - Strategy interface

### NFT & Rewards Contracts
10. **YieldPointsNFT.sol** - NFT rewards system
11. **NFTCollateralVault.sol** - NFT collateral management
12. **NFTPriceOracle.sol** - NFT price oracle
13. **LineYieldPoints.sol** - Points system

### Lending & Credit Contracts
14. **MultiLoanManager.sol** - Multi-loan management
15. **OnchainCreditScore.sol** - Credit scoring system
16. **LiquidationEngine.sol** - Liquidation management

### Security Contracts
17. **SecureVault.sol** - Enhanced security vault
18. **SecurityOracle.sol** - Security monitoring

### Governance & Utility Contracts
19. **DAOGovernance.sol** - Decentralized governance
20. **StablecoinSwap.sol** - Stablecoin swapping
21. **TokenVesting.sol** - Token vesting
22. **StakingRewards.sol** - Staking rewards
23. **YieldToken.sol** - Yield token

### Mock Contracts (for testing)
24. **MockUSDT.sol** - USDT mock for testing
25. **MockAaveStrategy.sol** - Aave strategy mock
26. **MockKlaySwapStrategy.sol** - KlaySwap strategy mock

## Deployment Order

### Phase 1: Core Infrastructure
```bash
# Deploy in this order:
1. MockUSDT.sol (if testing)
2. YieldToken.sol
3. LineYieldPoints.sol
4. OnchainCreditScore.sol
5. NFTPriceOracle.sol
6. YieldPointsNFT.sol
```

### Phase 2: Strategy Contracts
```bash
7. IYieldStrategy.sol (interface)
8. AaveStrategy.sol
9. KlaySwapStrategy.sol
10. MockCompoundStrategy.sol
11. StrategyManager.sol
12. AdvancedStrategyManager.sol
```

### Phase 3: Vault Contracts
```bash
13. Vault.sol
14. USDTYieldVault.sol
15. GaslessVault.sol
16. SecureVault.sol
```

### Phase 4: Advanced Features
```bash
17. NFTCollateralVault.sol
18. LiquidationEngine.sol
19. MultiLoanManager.sol
20. StablecoinSwap.sol
```

### Phase 5: Governance & Rewards
```bash
21. DAOGovernance.sol
22. TokenVesting.sol
23. StakingRewards.sol
24. SecurityOracle.sol
```

## Environment Variables

Update your `.env` file with the deployed contract addresses:

```bash
# Core Contracts
VAULT_ADDRESS=0x[deployed_address]
STRATEGY_MANAGER_ADDRESS=0x[deployed_address]
GASLESS_VAULT_ADDRESS=0x[deployed_address]

# Additional Contracts
NFT_COLLATERAL_VAULT_ADDRESS=0x[deployed_address]
NFT_PRICE_ORACLE_ADDRESS=0x[deployed_address]
LIQUIDATION_ENGINE_ADDRESS=0x[deployed_address]
YIELD_POINTS_NFT_ADDRESS=0x[deployed_address]
STABLECOIN_SWAP_ADDRESS=0x[deployed_address]
DAO_GOVERNANCE_ADDRESS=0x[deployed_address]
SECURE_VAULT_ADDRESS=0x[deployed_address]
SECURITY_ORACLE_ADDRESS=0x[deployed_address]
CREDIT_SCORE_CONTRACT_ADDRESS=0x[deployed_address]

# Strategy Contracts
AAVE_STRATEGY_ADDRESS=0x[deployed_address]
KLAYSWAP_STRATEGY_ADDRESS=0x[deployed_address]
COMPOUND_STRATEGY_ADDRESS=0x[deployed_address]
```

## Deployment Script Example

```javascript
// deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy MockUSDT first (for testing)
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy();
  await mockUSDT.deployed();
  console.log("MockUSDT deployed to:", mockUSDT.address);

  // Deploy YieldToken
  const YieldToken = await ethers.getContractFactory("YieldToken");
  const yieldToken = await YieldToken.deploy();
  await yieldToken.deployed();
  console.log("YieldToken deployed to:", yieldToken.address);

  // Deploy OnchainCreditScore
  const OnchainCreditScore = await ethers.getContractFactory("OnchainCreditScore");
  const creditScore = await OnchainCreditScore.deploy();
  await creditScore.deployed();
  console.log("OnchainCreditScore deployed to:", creditScore.address);

  // Continue with other contracts...
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

## Kaia Network Configuration

### Testnet (Baobab)
- RPC URL: `https://api.baobab.klaytn.net:8651`
- Chain ID: `1001`
- Block Explorer: `https://baobab.scope.klaytn.com`

### Mainnet
- RPC URL: `https://public-en-cypress.klaytn.net`
- Chain ID: `8217`
- Block Explorer: `https://scope.klaytn.com`

## Contract Verification

After deployment, verify contracts on Kaia Scope:

```bash
# Example verification command
npx hardhat verify --network kaia-testnet 0x[contract_address] [constructor_args]
```

## Security Considerations

1. **Multi-sig Wallets**: Use multi-sig wallets for admin functions
2. **Timelock**: Implement timelock for critical operations
3. **Access Control**: Properly configure access controls
4. **Testing**: Thoroughly test on testnet before mainnet deployment
5. **Audits**: Consider professional security audits for mainnet contracts

## Monitoring & Maintenance

1. **Event Monitoring**: Monitor contract events for unusual activity
2. **Balance Checks**: Regular balance and health checks
3. **Strategy Performance**: Monitor yield strategy performance
4. **Security Updates**: Keep contracts updated with security patches

## Support

For Kaia-specific development:
- [Kaia Documentation](https://docs.kaia.io/)
- [Kaia Contracts Library](https://github.com/kaiachain/kaia-contracts)
- [Kaia Contracts Wizard](https://docs.kaia.io/build/smart-contracts/tools/kaia-contracts-wizard/)

## Contract Dependencies

Some contracts depend on others. Ensure proper initialization:

1. **Vault** → **StrategyManager** → **Strategies**
2. **NFTCollateralVault** → **NFTPriceOracle**
3. **LiquidationEngine** → **NFTCollateralVault**
4. **DAOGovernance** → **YieldToken**

This ensures all contracts are properly connected and functional.
