#!/usr/bin/env node

/**
 * Contract Verification Script for LINE Yield Kaia Contracts
 * This script verifies that all required contracts are deployed and accessible
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

class ContractVerifier {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.KAIA_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, this.provider);
    this.contracts = {};
    this.results = [];
  }

  // Contract ABIs (simplified for verification)
  getContractABI(contractName) {
    const abis = {
      'Vault': ['function totalAssets() view returns (uint256)', 'function totalSupply() view returns (uint256)'],
      'StrategyManager': ['function strategies(address) view returns (bool)', 'function totalStrategies() view returns (uint256)'],
      'OnchainCreditScore': ['function getCreditScore(address) view returns (uint256)', 'function admin() view returns (address)'],
      'YieldPointsNFT': ['function totalSupply() view returns (uint256)', 'function balanceOf(address) view returns (uint256)'],
      'NFTCollateralVault': ['function totalCollateral() view returns (uint256)', 'function collateralCount() view returns (uint256)'],
      'NFTPriceOracle': ['function getPrice(address,uint256) view returns (uint256)', 'function isSupported(address) view returns (bool)'],
      'LiquidationEngine': ['function isHealthy(address) view returns (bool)', 'function liquidationThreshold() view returns (uint256)'],
      'GaslessVault': ['function totalAssets() view returns (uint256)', 'function nonces(address) view returns (uint256)'],
      'SecureVault': ['function totalAssets() view returns (uint256)', 'function securityLevel() view returns (uint8)'],
      'SecurityOracle': ['function isSecure(address) view returns (bool)', 'function riskLevel(address) view returns (uint8)'],
      'DAOGovernance': ['function proposalCount() view returns (uint256)', 'function votingPower(address) view returns (uint256)'],
      'StablecoinSwap': ['function getRate(address,address) view returns (uint256)', 'function isSupported(address) view returns (bool)']
    };
    return abis[contractName] || [];
  }

  async verifyContract(name, address) {
    try {
      console.log(`\n🔍 Verifying ${name} at ${address}...`);
      
      if (!address || address === '0x0000000000000000000000000000000000000000') {
        this.results.push({
          contract: name,
          address: address,
          status: 'MISSING',
          error: 'Contract address not configured'
        });
        return false;
      }

      // Check if address is valid
      if (!ethers.utils.isAddress(address)) {
        this.results.push({
          contract: name,
          address: address,
          status: 'INVALID',
          error: 'Invalid contract address format'
        });
        return false;
      }

      // Check if contract has code
      const code = await this.provider.getCode(address);
      if (code === '0x') {
        this.results.push({
          contract: name,
          address: address,
          status: 'NOT_DEPLOYED',
          error: 'No contract code found at address'
        });
        return false;
      }

      // Try to create contract instance and call a basic function
      const abi = this.getContractABI(name);
      if (abi.length > 0) {
        const contract = new ethers.Contract(address, abi, this.provider);
        
        // Try to call the first function in the ABI
        try {
          await contract[abi[0].split(' ')[1].split('(')[0]]();
          this.results.push({
            contract: name,
            address: address,
            status: 'VERIFIED',
            error: null
          });
          return true;
        } catch (callError) {
          this.results.push({
            contract: name,
            address: address,
            status: 'DEPLOYED_BUT_ERROR',
            error: `Contract deployed but function call failed: ${callError.message}`
          });
          return false;
        }
      } else {
        this.results.push({
          contract: name,
          address: address,
          status: 'DEPLOYED',
          error: null
        });
        return true;
      }

    } catch (error) {
      this.results.push({
        contract: name,
        address: address,
        status: 'ERROR',
        error: error.message
      });
      return false;
    }
  }

  async verifyAllContracts() {
    console.log('🚀 Starting LINE Yield Contract Verification...\n');
    console.log(`📡 Connected to: ${process.env.KAIA_RPC_URL}`);
    console.log(`👤 Wallet: ${this.wallet.address}\n`);

    const contractsToVerify = [
      { name: 'Vault', address: process.env.VAULT_ADDRESS },
      { name: 'StrategyManager', address: process.env.STRATEGY_MANAGER_ADDRESS },
      { name: 'GaslessVault', address: process.env.GASLESS_VAULT_ADDRESS },
      { name: 'OnchainCreditScore', address: process.env.CREDIT_SCORE_CONTRACT_ADDRESS },
      { name: 'NFTCollateralVault', address: process.env.NFT_COLLATERAL_VAULT_ADDRESS },
      { name: 'NFTPriceOracle', address: process.env.NFT_PRICE_ORACLE_ADDRESS },
      { name: 'LiquidationEngine', address: process.env.LIQUIDATION_ENGINE_ADDRESS },
      { name: 'YieldPointsNFT', address: process.env.YIELD_POINTS_NFT_ADDRESS },
      { name: 'StablecoinSwap', address: process.env.STABLECOIN_SWAP_ADDRESS },
      { name: 'DAOGovernance', address: process.env.DAO_GOVERNANCE_ADDRESS },
      { name: 'SecureVault', address: process.env.SECURE_VAULT_ADDRESS },
      { name: 'SecurityOracle', address: process.env.SECURITY_ORACLE_ADDRESS },
      { name: 'AaveStrategy', address: process.env.AAVE_STRATEGY_ADDRESS },
      { name: 'KlaySwapStrategy', address: process.env.KLAYSWAP_STRATEGY_ADDRESS },
      { name: 'CompoundStrategy', address: process.env.COMPOUND_STRATEGY_ADDRESS }
    ];

    let verifiedCount = 0;
    let totalCount = contractsToVerify.length;

    for (const contract of contractsToVerify) {
      const isVerified = await this.verifyContract(contract.name, contract.address);
      if (isVerified) verifiedCount++;
    }

    this.printResults(verifiedCount, totalCount);
    return this.results;
  }

  printResults(verifiedCount, totalCount) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION RESULTS');
    console.log('='.repeat(60));

    const statusColors = {
      'VERIFIED': '✅',
      'DEPLOYED': '✅',
      'DEPLOYED_BUT_ERROR': '⚠️',
      'MISSING': '❌',
      'INVALID': '❌',
      'NOT_DEPLOYED': '❌',
      'ERROR': '❌'
    };

    this.results.forEach(result => {
      const icon = statusColors[result.status] || '❓';
      console.log(`${icon} ${result.contract.padEnd(20)} ${result.status}`);
      if (result.error) {
        console.log(`   └─ ${result.error}`);
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`📈 Summary: ${verifiedCount}/${totalCount} contracts verified`);
    console.log('='.repeat(60));

    if (verifiedCount === totalCount) {
      console.log('🎉 All contracts are properly deployed and configured!');
    } else {
      console.log('⚠️  Some contracts need attention. Check the results above.');
      console.log('\n📋 Next Steps:');
      console.log('1. Deploy missing contracts using the deployment guide');
      console.log('2. Update environment variables with correct addresses');
      console.log('3. Re-run this verification script');
    }
  }

  async checkNetworkConnection() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
      console.log(`📦 Latest Block: ${blockNumber}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to Kaia network:', error.message);
      return false;
    }
  }
}

// Main execution
async function main() {
  const verifier = new ContractVerifier();
  
  // Check network connection first
  const isConnected = await verifier.checkNetworkConnection();
  if (!isConnected) {
    process.exit(1);
  }

  // Verify all contracts
  await verifier.verifyAllContracts();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ContractVerifier;
