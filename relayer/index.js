const express = require('express');
const cors = require('cors');
const { Web3 } = require('web3');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Web3 with Kaia RPC
const web3 = new Web3(process.env.KAIA_RPC_URL || 'https://api.baobab.klaytn.net:8651');

// Initialize ethers provider for signature verification
const provider = new ethers.JsonRpcProvider(process.env.KAIA_RPC_URL || 'https://api.baobab.klaytn.net:8651');

// Relayer's funded account
const relayerAccount = web3.eth.accounts.privateKeyToAccount(process.env.RELAYER_PRIVATE_KEY);

// Contract ABI for GaslessVault
const vaultABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "assets", "type": "uint256"},
      {"internalType": "address", "name": "receiver", "type": "address"},
      {"internalType": "uint256", "name": "_nonce", "type": "uint256"},
      {"internalType": "bytes", "name": "signature", "type": "bytes"}
    ],
    "name": "executeGaslessDeposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "assets", "type": "uint256"},
      {"internalType": "address", "name": "receiver", "type": "address"},
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "uint256", "name": "_nonce", "type": "uint256"},
      {"internalType": "bytes", "name": "signature", "type": "bytes"}
    ],
    "name": "executeGaslessWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "shares", "type": "uint256"},
      {"internalType": "address", "name": "receiver", "type": "address"},
      {"internalType": "uint256", "name": "_nonce", "type": "uint256"},
      {"internalType": "bytes", "name": "signature", "type": "bytes"}
    ],
    "name": "executeGaslessMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "shares", "type": "uint256"},
      {"internalType": "address", "name": "receiver", "type": "address"},
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "uint256", "name": "_nonce", "type": "uint256"},
      {"internalType": "bytes", "name": "signature", "type": "bytes"}
    ],
    "name": "executeGaslessRedeem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "nonces",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract instance
const vaultContract = new web3.eth.Contract(vaultABI, process.env.VAULT_ADDRESS);

// Rate limiting store
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

// Rate limiting middleware
function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const userLimit = rateLimitStore.get(ip);
  
  if (now > userLimit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please try again later.'
    });
  }
  
  userLimit.count++;
  next();
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    relayer: relayerAccount.address,
    vault: process.env.VAULT_ADDRESS,
    network: process.env.KAIA_RPC_URL
  });
});

// Get user nonce endpoint
app.get('/nonce/:userAddress', async (req, res) => {
  try {
    const userAddress = req.params.userAddress;
    
    if (!web3.utils.isAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format'
      });
    }
    
    const nonce = await vaultContract.methods.nonces(userAddress).call();
    
    res.json({
      success: true,
      nonce: nonce
    });
  } catch (error) {
    console.error('Error getting nonce:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get nonce'
    });
  }
});

// Gasless deposit endpoint
app.post('/relay/deposit', rateLimit, async (req, res) => {
  try {
    const { user, assets, receiver, nonce, signature } = req.body;
    
    // Validate input
    if (!user || !assets || !receiver || nonce === undefined || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }
    
    // Validate addresses
    if (!web3.utils.isAddress(user) || !web3.utils.isAddress(receiver)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format'
      });
    }
    
    // Create the transaction object with fee delegation
    const tx = {
      to: process.env.VAULT_ADDRESS,
      data: vaultContract.methods.executeGaslessDeposit(
        user,
        assets,
        receiver,
        nonce,
        signature
      ).encodeABI(),
      gas: 500000,
      feeDelegation: true,
      feePayer: relayerAccount.address
    };
    
    // Sign and send the transaction
    const signedTx = await relayerAccount.signTransaction(tx);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    res.json({
      success: true,
      transactionHash: receipt.transactionHash,
      gasUsed: receipt.gasUsed,
      blockNumber: receipt.blockNumber
    });
    
  } catch (error) {
    console.error('Error executing gasless deposit:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Transaction failed'
    });
  }
});

// Gasless withdraw endpoint
app.post('/relay/withdraw', rateLimit, async (req, res) => {
  try {
    const { user, assets, receiver, owner, nonce, signature } = req.body;
    
    // Validate input
    if (!user || !assets || !receiver || !owner || nonce === undefined || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }
    
    // Validate addresses
    if (!web3.utils.isAddress(user) || !web3.utils.isAddress(receiver) || !web3.utils.isAddress(owner)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format'
      });
    }
    
    // Create the transaction object with fee delegation
    const tx = {
      to: process.env.VAULT_ADDRESS,
      data: vaultContract.methods.executeGaslessWithdraw(
        user,
        assets,
        receiver,
        owner,
        nonce,
        signature
      ).encodeABI(),
      gas: 500000,
      feeDelegation: true,
      feePayer: relayerAccount.address
    };
    
    // Sign and send the transaction
    const signedTx = await relayerAccount.signTransaction(tx);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    res.json({
      success: true,
      transactionHash: receipt.transactionHash,
      gasUsed: receipt.gasUsed,
      blockNumber: receipt.blockNumber
    });
    
  } catch (error) {
    console.error('Error executing gasless withdraw:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Transaction failed'
    });
  }
});

// Gasless mint endpoint
app.post('/relay/mint', rateLimit, async (req, res) => {
  try {
    const { user, shares, receiver, nonce, signature } = req.body;
    
    // Validate input
    if (!user || !shares || !receiver || nonce === undefined || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }
    
    // Validate addresses
    if (!web3.utils.isAddress(user) || !web3.utils.isAddress(receiver)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format'
      });
    }
    
    // Create the transaction object with fee delegation
    const tx = {
      to: process.env.VAULT_ADDRESS,
      data: vaultContract.methods.executeGaslessMint(
        user,
        shares,
        receiver,
        nonce,
        signature
      ).encodeABI(),
      gas: 500000,
      feeDelegation: true,
      feePayer: relayerAccount.address
    };
    
    // Sign and send the transaction
    const signedTx = await relayerAccount.signTransaction(tx);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    res.json({
      success: true,
      transactionHash: receipt.transactionHash,
      gasUsed: receipt.gasUsed,
      blockNumber: receipt.blockNumber
    });
    
  } catch (error) {
    console.error('Error executing gasless mint:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Transaction failed'
    });
  }
});

// Gasless redeem endpoint
app.post('/relay/redeem', rateLimit, async (req, res) => {
  try {
    const { user, shares, receiver, owner, nonce, signature } = req.body;
    
    // Validate input
    if (!user || !shares || !receiver || !owner || nonce === undefined || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }
    
    // Validate addresses
    if (!web3.utils.isAddress(user) || !web3.utils.isAddress(receiver) || !web3.utils.isAddress(owner)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format'
      });
    }
    
    // Create the transaction object with fee delegation
    const tx = {
      to: process.env.VAULT_ADDRESS,
      data: vaultContract.methods.executeGaslessRedeem(
        user,
        shares,
        receiver,
        owner,
        nonce,
        signature
      ).encodeABI(),
      gas: 500000,
      feeDelegation: true,
      feePayer: relayerAccount.address
    };
    
    // Sign and send the transaction
    const signedTx = await relayerAccount.signTransaction(tx);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    res.json({
      success: true,
      transactionHash: receipt.transactionHash,
      gasUsed: receipt.gasUsed,
      blockNumber: receipt.blockNumber
    });
    
  } catch (error) {
    console.error('Error executing gasless redeem:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Transaction failed'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Gasless Relayer Service running on port ${PORT}`);
  console.log(`📍 Relayer address: ${relayerAccount.address}`);
  console.log(`🏦 Vault address: ${process.env.VAULT_ADDRESS}`);
  console.log(`🌐 Network: ${process.env.KAIA_RPC_URL}`);
});

module.exports = app;
