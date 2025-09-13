#!/usr/bin/env ts-node

/**
 * LINE Setup Verification Script
 * 
 * This script verifies that your LINE Developers Console setup is correct
 * and ready for development. It checks:
 * 
 * 1. Messaging API Channel is active and accessible
 * 2. LIFF Apps are created and published
 * 3. All required credentials are valid
 * 
 * Usage:
 *   npm run verify-line-setup
 *   or
 *   ts-node scripts/verify-line-setup.ts
 */

import { config } from 'dotenv';
import { LineVerificationService, VerificationResult } from '../src/services/line-verification-service';
import { Logger } from '../src/utils/logger';

// Load environment variables
config();

interface VerificationOptions {
  channelAccessToken?: string;
  channelId?: string;
  providerId?: string;
  verbose?: boolean;
}

class LineSetupVerifier {
  private options: VerificationOptions;

  constructor(options: VerificationOptions = {}) {
    this.options = {
      channelAccessToken: options.channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN,
      channelId: options.channelId || process.env.LINE_CHANNEL_ID,
      providerId: options.providerId || process.env.LINE_PROVIDER_ID,
      verbose: options.verbose || false
    };
  }

  async run(): Promise<void> {
    console.log('🔍 LINE Setup Verification Tool');
    console.log('================================\n');

    // Check if credentials are provided
    if (!this.options.channelAccessToken || !this.options.channelId) {
      console.error('❌ Missing required LINE credentials');
      console.error('\nRequired environment variables:');
      console.error('  - LINE_CHANNEL_ACCESS_TOKEN');
      console.error('  - LINE_CHANNEL_ID');
      console.error('\nOptional:');
      console.error('  - LINE_PROVIDER_ID');
      console.error('\nPlease set these in your .env file or pass them as arguments.');
      process.exit(1);
    }

    try {
      // Initialize verification service
      const verificationService = new LineVerificationService(
        this.options.channelAccessToken,
        this.options.channelId,
        this.options.providerId
      );

      console.log('📡 Starting verification...\n');

      // Perform comprehensive verification
      const result: VerificationResult = await verificationService.verifyCompleteSetup();
      const recommendations = verificationService.getSetupRecommendations(result);

      // Display results
      this.displayResults(result, recommendations);

      // Exit with appropriate code
      process.exit(result.overallStatus === 'healthy' ? 0 : 1);

    } catch (error) {
      console.error('💥 Verification failed with error:', error);
      process.exit(1);
    }
  }

  private displayResults(result: VerificationResult, recommendations: string[]): void {
    console.log('📊 Verification Results');
    console.log('======================\n');

    // Overall status
    const statusIcon = result.overallStatus === 'healthy' ? '✅' : 
                      result.overallStatus === 'warning' ? '⚠️' : '❌';
    console.log(`${statusIcon} Overall Status: ${result.overallStatus.toUpperCase()}\n`);

    // Messaging API Channel status
    console.log('🤖 Messaging API Channel:');
    if (result.messagingApiChannel.active && result.messagingApiChannel.info) {
      console.log('  ✅ Status: Active');
      console.log(`  📝 Bot ID: ${result.messagingApiChannel.info.bot.id}`);
      console.log(`  🏷️  Bot Name: ${result.messagingApiChannel.info.bot.name}`);
      console.log(`  🆔 Channel ID: ${result.messagingApiChannel.info.channelId}`);
      if (result.messagingApiChannel.info.providerId) {
        console.log(`  🏢 Provider ID: ${result.messagingApiChannel.info.providerId}`);
      }
    } else {
      console.log('  ❌ Status: Inactive or Error');
      if (result.messagingApiChannel.error) {
        console.log(`  💥 Error: ${result.messagingApiChannel.error}`);
      }
    }
    console.log('');

    // LIFF Apps status
    console.log('📱 LIFF Apps:');
    if (result.liffApps.exists && result.liffApps.apps.length > 0) {
      console.log(`  ✅ Status: Active (${result.liffApps.count} apps found)`);
      result.liffApps.apps.forEach((app, index) => {
        console.log(`  📱 App ${index + 1}:`);
        console.log(`     🆔 LIFF ID: ${app.liffId}`);
        console.log(`     🌐 URL: ${app.view.url}`);
        console.log(`     📝 Description: ${app.description || 'No description'}`);
        console.log(`     📐 View Type: ${app.view.type}`);
      });
    } else {
      console.log('  ❌ Status: No published apps found');
      if (result.liffApps.error) {
        console.log(`  💥 Error: ${result.liffApps.error}`);
      }
    }
    console.log('');

    // Official Account status
    console.log('🤖 Official Account:');
    if (result.officialAccount.active && result.officialAccount.info) {
      console.log('  ✅ Status: Active and linked');
      console.log(`  🆔 Bot ID: ${result.officialAccount.info.botId}`);
      console.log(`  💬 Can Send Messages: ${result.officialAccount.info.canSendMessages ? 'Yes' : 'No'}`);
      console.log(`  🔗 Webhook Active: ${result.officialAccount.info.webhookActive ? 'Yes' : 'No'}`);
      console.log(`  👥 Friend Prompt Configured: ${result.officialAccount.friendPromptConfigured ? 'Yes' : 'No'}`);
      
      // Rich Menu status
      if (result.officialAccount.info.richMenu) {
        console.log(`  📋 Rich Menu: ${result.officialAccount.info.richMenu.exists ? 'Exists' : 'Not Found'}`);
        if (result.officialAccount.info.richMenu.configured) {
          console.log(`     ✅ Configuration: Valid (Kaia Wave compliant)`);
          if (result.officialAccount.info.richMenu.info) {
            console.log(`     📝 Name: ${result.officialAccount.info.richMenu.info.name}`);
            console.log(`     📏 Size: ${result.officialAccount.info.richMenu.info.size.width}x${result.officialAccount.info.richMenu.info.size.height}`);
            console.log(`     🎯 Areas: ${result.officialAccount.info.richMenu.info.areas.length}`);
          }
        } else if (result.officialAccount.info.richMenu.error) {
          console.log(`     ❌ Error: ${result.officialAccount.info.richMenu.error}`);
        } else {
          console.log(`     ⚠️  Configuration: Invalid (not Kaia Wave compliant)`);
        }
      }
    } else {
      console.log('  ❌ Status: Inactive or not linked');
      if (result.officialAccount.error) {
        console.log(`  💥 Error: ${result.officialAccount.error}`);
      }
    }
    console.log('');

    // Recommendations
    if (recommendations.length > 0) {
      console.log('💡 Recommendations:');
      recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
      console.log('');
    }

    // Next steps
    if (result.overallStatus === 'healthy') {
      console.log('🎉 Congratulations! Your LINE setup is ready for development.');
      console.log('\nNext steps:');
      console.log('  1. Initialize LIFF SDK in your frontend application');
      console.log('  2. Implement LINE Login authentication flow');
      console.log('  3. Start building your Mini Dapp features');
    } else if (result.overallStatus === 'warning') {
      console.log('⚠️  Your LINE setup has some issues that need attention.');
      console.log('\nNext steps:');
      console.log('  1. Address the recommendations above');
      console.log('  2. Re-run this verification script');
      console.log('  3. Once all issues are resolved, proceed with development');
    } else {
      console.log('❌ Your LINE setup has critical issues that must be fixed.');
      console.log('\nNext steps:');
      console.log('  1. Fix the critical issues mentioned above');
      console.log('  2. Re-run this verification script');
      console.log('  3. Only proceed with development when all issues are resolved');
    }

    console.log(`\n🕒 Verification completed at: ${result.timestamp}`);
  }
}

// CLI argument parsing
function parseArguments(): VerificationOptions {
  const args = process.argv.slice(2);
  const options: VerificationOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--token':
      case '-t':
        options.channelAccessToken = args[++i];
        break;
      case '--channel-id':
      case '-c':
        options.channelId = args[++i];
        break;
      case '--provider-id':
      case '-p':
        options.providerId = args[++i];
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        console.log(`
LINE Setup Verification Tool

Usage: npm run verify-line-setup [options]

Options:
  -t, --token <token>        LINE Channel Access Token
  -c, --channel-id <id>      LINE Channel ID
  -p, --provider-id <id>     LINE Provider ID (optional)
  -v, --verbose              Verbose output
  -h, --help                 Show this help message

Environment Variables:
  LINE_CHANNEL_ACCESS_TOKEN  LINE Channel Access Token
  LINE_CHANNEL_ID           LINE Channel ID
  LINE_PROVIDER_ID          LINE Provider ID (optional)

Examples:
  npm run verify-line-setup
  npm run verify-line-setup -- --token YOUR_TOKEN --channel-id YOUR_CHANNEL_ID
        `);
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${args[i]}`);
        console.error('Use --help for usage information');
        process.exit(1);
    }
  }

  return options;
}

// Main execution
if (require.main === module) {
  const options = parseArguments();
  const verifier = new LineSetupVerifier(options);
  verifier.run().catch((error) => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

export { LineSetupVerifier };
