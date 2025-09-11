const { Web3 } = require('web3');
const cron = require('node-cron');
const axios = require('axios');

// Configuration
const config = {
    kaiaRpcUrl: process.env.KAIA_RPC_URL || 'https://api.kaia.klaytn.net',
    strategyManagerAddress: process.env.STRATEGY_MANAGER_ADDRESS,
    privateKey: process.env.REBALANCER_PRIVATE_KEY,
    rebalanceInterval: process.env.REBALANCE_INTERVAL || '0 * * * *', // Every hour
    threshold: process.env.REBALANCE_THRESHOLD || 50, // 0.5%
    gasLimit: process.env.GAS_LIMIT || 500000,
    gasMultiplier: process.env.GAS_MULTIPLIER || 1.2
};

// Initialize Web3
const web3 = new Web3(config.kaiaRpcUrl);
const account = web3.eth.accounts.privateKeyToAccount(config.privateKey);
web3.eth.accounts.wallet.add(account);

// Strategy Manager ABI (simplified)
const strategyManagerABI = [
    {
        "inputs": [],
        "name": "rebalance",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "canRebalance",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getNextRebalanceTime",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getStrategyPerformance",
        "outputs": [
            {"internalType": "address[]", "name": "strategies", "type": "address[]"},
            {"internalType": "uint256[]", "name": "apys", "type": "uint256[]"},
            {"internalType": "uint256[]", "name": "allocations", "type": "uint256[]"},
            {"internalType": "uint256[]", "name": "performances", "type": "uint256[]"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getRebalancingStats",
        "outputs": [
            {"internalType": "uint256", "name": "lastRebalanceTime", "type": "uint256"},
            {"internalType": "uint256", "name": "nextRebalanceTime", "type": "uint256"},
            {"internalType": "uint256", "name": "rebalanceThreshold", "type": "uint256"},
            {"internalType": "uint256", "name": "rebalanceInterval", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "RebalanceExecuted",
        "type": "event"
    }
];

// Initialize contract
const strategyManager = new web3.eth.Contract(strategyManagerABI, config.strategyManagerAddress);

// Logging utility
function log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
        console.log(logMessage, JSON.stringify(data, null, 2));
    } else {
        console.log(logMessage);
    }
}

// Check if rebalancing is needed
async function checkRebalanceNeeded() {
    try {
        log('info', 'Checking if rebalancing is needed...');
        
        const canRebalance = await strategyManager.methods.canRebalance().call();
        if (!canRebalance) {
            const nextRebalanceTime = await strategyManager.methods.getNextRebalanceTime().call();
            const nextRebalanceDate = new Date(parseInt(nextRebalanceTime) * 1000);
            log('info', `Rebalancing not ready. Next rebalance at: ${nextRebalanceDate.toISOString()}`);
            return false;
        }
        
        // Get current strategy performance
        const performance = await strategyManager.methods.getStrategyPerformance().call();
        const [strategies, apys, allocations, performances] = performance;
        
        if (strategies.length < 2) {
            log('warn', 'Need at least 2 strategies for rebalancing');
            return false;
        }
        
        // Calculate total APY
        const totalAPY = apys.reduce((sum, apy) => sum + parseInt(apy), 0);
        if (totalAPY === 0) {
            log('warn', 'No active strategies with valid APY');
            return false;
        }
        
        // Check if any strategy needs rebalancing
        let needsRebalance = false;
        for (let i = 0; i < strategies.length; i++) {
            const targetAllocation = (parseInt(apys[i]) * 10000) / totalAPY;
            const currentAllocation = parseInt(allocations[i]);
            const difference = Math.abs(targetAllocation - currentAllocation);
            
            if (difference > config.threshold) {
                log('info', `Strategy ${strategies[i]} needs rebalancing`, {
                    currentAllocation: currentAllocation / 100,
                    targetAllocation: targetAllocation / 100,
                    difference: difference / 100,
                    apy: parseInt(apys[i]) / 100
                });
                needsRebalance = true;
            }
        }
        
        if (!needsRebalance) {
            log('info', 'No rebalancing needed at this time');
        }
        
        return needsRebalance;
        
    } catch (error) {
        log('error', 'Error checking rebalance status', { error: error.message });
        return false;
    }
}

// Execute rebalancing
async function executeRebalance() {
    try {
        log('info', 'Executing rebalancing...');
        
        // Get current gas price
        const gasPrice = await web3.eth.getGasPrice();
        const adjustedGasPrice = Math.floor(parseInt(gasPrice) * config.gasMultiplier);
        
        // Prepare transaction
        const txData = strategyManager.methods.rebalance().encodeABI();
        const tx = {
            to: config.strategyManagerAddress,
            data: txData,
            gas: config.gasLimit,
            gasPrice: adjustedGasPrice,
            from: account.address
        };
        
        // Estimate gas
        try {
            const estimatedGas = await web3.eth.estimateGas(tx);
            tx.gas = Math.floor(estimatedGas * 1.1); // Add 10% buffer
            log('info', `Estimated gas: ${estimatedGas}, using: ${tx.gas}`);
        } catch (gasError) {
            log('warn', 'Gas estimation failed, using default', { error: gasError.message });
        }
        
        // Sign and send transaction
        const signedTx = await account.signTransaction(tx);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
        log('info', 'Rebalancing transaction successful', {
            txHash: receipt.transactionHash,
            gasUsed: receipt.gasUsed,
            blockNumber: receipt.blockNumber
        });
        
        return receipt;
        
    } catch (error) {
        log('error', 'Error executing rebalancing', { error: error.message });
        throw error;
    }
}

// Get strategy performance data
async function getStrategyPerformance() {
    try {
        const performance = await strategyManager.methods.getStrategyPerformance().call();
        const [strategies, apys, allocations, performances] = performance;
        
        const strategyData = strategies.map((address, index) => ({
            address,
            apy: parseInt(apys[index]) / 100,
            allocation: parseInt(allocations[index]) / 100,
            performance: parseInt(performances[index]) / 100
        }));
        
        return strategyData;
        
    } catch (error) {
        log('error', 'Error getting strategy performance', { error: error.message });
        return [];
    }
}

// Get rebalancing statistics
async function getRebalancingStats() {
    try {
        const stats = await strategyManager.methods.getRebalancingStats().call();
        
        return {
            lastRebalanceTime: new Date(parseInt(stats.lastRebalanceTime) * 1000).toISOString(),
            nextRebalanceTime: new Date(parseInt(stats.nextRebalanceTime) * 1000).toISOString(),
            rebalanceThreshold: parseInt(stats.rebalanceThreshold) / 100,
            rebalanceInterval: parseInt(stats.rebalanceInterval)
        };
        
    } catch (error) {
        log('error', 'Error getting rebalancing stats', { error: error.message });
        return null;
    }
}

// Main rebalancing function
async function performRebalancing() {
    try {
        log('info', 'Starting auto-rebalancing process...');
        
        // Check if rebalancing is needed
        const needsRebalance = await checkRebalanceNeeded();
        
        if (needsRebalance) {
            log('info', 'Rebalancing needed, executing...');
            
            // Get performance data before rebalancing
            const beforePerformance = await getStrategyPerformance();
            log('info', 'Strategy performance before rebalancing', beforePerformance);
            
            // Execute rebalancing
            await executeRebalance();
            
            // Wait a bit for transaction to be mined
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            // Get performance data after rebalancing
            const afterPerformance = await getStrategyPerformance();
            log('info', 'Strategy performance after rebalancing', afterPerformance);
            
            log('info', 'Rebalancing completed successfully');
        } else {
            log('info', 'No rebalancing needed at this time');
        }
        
        // Log current stats
        const stats = await getRebalancingStats();
        if (stats) {
            log('info', 'Current rebalancing statistics', stats);
        }
        
    } catch (error) {
        log('error', 'Rebalancing process failed', { error: error.message });
    }
}

// Health check function
async function healthCheck() {
    try {
        log('info', 'Performing health check...');
        
        // Check connection to Kaia network
        const blockNumber = await web3.eth.getBlockNumber();
        log('info', `Connected to Kaia network. Current block: ${blockNumber}`);
        
        // Check strategy manager contract
        const canRebalance = await strategyManager.methods.canRebalance().call();
        log('info', `Strategy manager accessible. Can rebalance: ${canRebalance}`);
        
        // Get current performance
        const performance = await getStrategyPerformance();
        log('info', 'Current strategy performance', performance);
        
        return true;
        
    } catch (error) {
        log('error', 'Health check failed', { error: error.message });
        return false;
    }
}

// Start the rebalancing service
function startService() {
    log('info', 'Starting LINE Yield Auto-Rebalancing Service', config);
    
    // Perform initial health check
    healthCheck().then(success => {
        if (success) {
            log('info', 'Health check passed. Service is ready.');
        } else {
            log('error', 'Health check failed. Service may not work correctly.');
        }
    });
    
    // Schedule rebalancing
    cron.schedule(config.rebalanceInterval, performRebalancing);
    log('info', `Rebalancing scheduled with interval: ${config.rebalanceInterval}`);
    
    // Schedule health checks every 10 minutes
    cron.schedule('*/10 * * * *', healthCheck);
    log('info', 'Health checks scheduled every 10 minutes');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    log('info', 'Received SIGINT. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    log('info', 'Received SIGTERM. Shutting down gracefully...');
    process.exit(0);
});

// Export functions for testing
module.exports = {
    checkRebalanceNeeded,
    executeRebalance,
    getStrategyPerformance,
    getRebalancingStats,
    performRebalancing,
    healthCheck,
    startService
};

// Start service if this file is run directly
if (require.main === module) {
    startService();
}
