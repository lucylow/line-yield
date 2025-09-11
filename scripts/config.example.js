// Configuration example for LINE Yield Rebalancing Service
// Copy this file to config.js and update with your actual values

module.exports = {
    // Kaia Network Configuration
    kaiaRpcUrl: 'https://api.kaia.klaytn.net',
    strategyManagerAddress: '0x...', // Deploy StrategyManager contract and update this
    
    // Rebalancer Account (Keep this private!)
    privateKey: '0x...', // Private key of account authorized to call rebalance()
    
    // Rebalancing Configuration
    rebalanceInterval: '0 * * * *', // Cron expression: every hour
    threshold: 50, // 0.5% threshold for rebalancing
    gasLimit: 500000,
    gasMultiplier: 1.2,
    
    // Monitoring (Optional)
    webhookUrl: 'https://hooks.slack.com/services/...',
    alertEmail: 'admin@lineyield.com',
    
    // Logging
    logLevel: 'info',
    logFile: './logs/rebalancing.log'
};
