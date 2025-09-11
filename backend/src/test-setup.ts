// Simple test setup to verify the backend configuration
import { CONFIG, validateConfig } from './config';
import { Logger } from './utils/logger';

async function testSetup() {
  try {
    Logger.info('Testing backend setup...');
    
    // Test configuration validation
    validateConfig();
    Logger.info('✅ Configuration validation passed');
    
    // Test logger
    Logger.info('✅ Logger is working');
    Logger.warn('✅ Warning level works');
    Logger.error('✅ Error level works');
    
    // Test configuration values
    Logger.info('Configuration loaded:', {
      nodeEnv: CONFIG.nodeEnv,
      port: CONFIG.port,
      kaiaRpcUrl: CONFIG.kaia.rpcUrl,
      gaslessEnabled: CONFIG.gasless.enabled
    });
    
    Logger.info('✅ Backend setup test completed successfully');
    
  } catch (error) {
    Logger.error('❌ Backend setup test failed', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSetup();
}

export { testSetup };
