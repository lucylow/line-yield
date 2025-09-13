/**
 * LINE Verification Example
 * 
 * This example demonstrates how to use the LINE verification service
 * to check your LINE Developers Console setup programmatically.
 * 
 * Run this example:
 *   node examples/line-verification-example.js
 */

const axios = require('axios');

// Configuration - Replace with your actual values
const CONFIG = {
  channelAccessToken: 'YOUR_CHANNEL_ACCESS_TOKEN', // From Messaging API Channel
  channelId: 'YOUR_CHANNEL_ID', // From LINE Login Channel
  providerId: 'YOUR_PROVIDER_ID', // From Provider settings (optional)
  backendUrl: 'http://localhost:3000' // Your backend URL
};

/**
 * Example 1: Verify complete LINE setup
 */
async function verifyCompleteSetup() {
  console.log('🔍 Example 1: Complete LINE Setup Verification');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.post(`${CONFIG.backendUrl}/api/line/verify`, {
      channelAccessToken: CONFIG.channelAccessToken,
      channelId: CONFIG.channelId,
      providerId: CONFIG.providerId
    });

    const { result, recommendations } = response.data;
    
    console.log(`✅ Overall Status: ${result.overallStatus.toUpperCase()}`);
    console.log(`🤖 Messaging API: ${result.messagingApiChannel.active ? 'Active' : 'Inactive'}`);
    console.log(`📱 LIFF Apps: ${result.liffApps.count} found`);
    
    if (recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Verification failed:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Example 2: Check only Messaging API Channel
 */
async function verifyMessagingApi() {
  console.log('\n🤖 Example 2: Messaging API Verification');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${CONFIG.backendUrl}/api/line/verify/messaging-api`, {
      params: {
        channelAccessToken: CONFIG.channelAccessToken,
        channelId: CONFIG.channelId
      }
    });

    const { result } = response.data;
    
    if (result.active && result.info) {
      console.log('✅ Messaging API Channel is active');
      console.log(`   Bot ID: ${result.info.bot.id}`);
      console.log(`   Bot Name: ${result.info.bot.name}`);
      console.log(`   Channel ID: ${result.info.channelId}`);
    } else {
      console.log('❌ Messaging API Channel is inactive');
      console.log(`   Error: ${result.error || 'Unknown error'}`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Messaging API verification failed:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Example 3: Check only LIFF Apps
 */
async function verifyLiffApps() {
  console.log('\n📱 Example 3: LIFF Apps Verification');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${CONFIG.backendUrl}/api/line/verify/liff-apps`, {
      params: {
        channelAccessToken: CONFIG.channelAccessToken,
        channelId: CONFIG.channelId
      }
    });

    const { result } = response.data;
    
    if (result.exists && result.apps.length > 0) {
      console.log(`✅ Found ${result.count} published LIFF app(s)`);
      result.apps.forEach((app, index) => {
        console.log(`   App ${index + 1}:`);
        console.log(`     LIFF ID: ${app.liffId}`);
        console.log(`     URL: ${app.view.url}`);
        console.log(`     Type: ${app.view.type}`);
        console.log(`     Description: ${app.description || 'No description'}`);
      });
    } else {
      console.log('❌ No published LIFF apps found');
      console.log(`   Error: ${result.error || 'No apps available'}`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ LIFF Apps verification failed:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Example 4: Check status using environment variables
 */
async function checkStatusFromEnv() {
  console.log('\n⚙️  Example 4: Status Check from Environment Variables');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${CONFIG.backendUrl}/api/line/verify/status`);
    const { result, recommendations } = response.data;
    
    console.log(`✅ Status: ${result.overallStatus.toUpperCase()}`);
    console.log(`🤖 Messaging API: ${result.messagingApiChannel.active ? 'Active' : 'Inactive'}`);
    console.log(`📱 LIFF Apps: ${result.liffApps.count} found`);
    console.log(`🕒 Timestamp: ${result.timestamp}`);
    
    if (recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Status check failed:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Example 5: Service health check
 */
async function checkServiceHealth() {
  console.log('\n🏥 Example 5: Service Health Check');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${CONFIG.backendUrl}/api/line/verify/health`);
    const { service, status, endpoints } = response.data;
    
    console.log(`✅ Service: ${service}`);
    console.log(`✅ Status: ${status}`);
    console.log('\n📡 Available Endpoints:');
    endpoints.forEach((endpoint, index) => {
      console.log(`  ${index + 1}. ${endpoint}`);
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Health check failed:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Main function to run all examples
 */
async function runExamples() {
  console.log('🚀 LINE Verification Service Examples');
  console.log('=====================================\n');
  
  // Check if configuration is set
  if (CONFIG.channelAccessToken === 'YOUR_CHANNEL_ACCESS_TOKEN' || 
      CONFIG.channelId === 'YOUR_CHANNEL_ID') {
    console.log('⚠️  Please update the CONFIG object with your actual LINE credentials');
    console.log('   You can find these in your LINE Developers Console:');
    console.log('   - Channel Access Token: Messaging API Channel → Messaging API tab');
    console.log('   - Channel ID: LINE Login Channel → Basic settings');
    console.log('   - Provider ID: Provider settings (optional)\n');
  }
  
  // Run examples
  await checkServiceHealth();
  await checkStatusFromEnv();
  await verifyMessagingApi();
  await verifyLiffApps();
  await verifyCompleteSetup();
  
  console.log('\n🎉 All examples completed!');
  console.log('\nNext steps:');
  console.log('1. Fix any issues found during verification');
  console.log('2. Integrate the verification service into your application');
  console.log('3. Set up monitoring for your LINE integration');
  console.log('4. Implement proper error handling and retry logic');
}

// Run the examples
if (require.main === module) {
  runExamples().catch((error) => {
    console.error('💥 Example execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  verifyCompleteSetup,
  verifyMessagingApi,
  verifyLiffApps,
  checkStatusFromEnv,
  checkServiceHealth
};


