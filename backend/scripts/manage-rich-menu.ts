#!/usr/bin/env ts-node

/**
 * Rich Menu Management Script
 * 
 * This script helps manage LINE Official Account Rich Menus according to
 * Kaia Wave Mini Dapp guidelines. It can create, upload, and configure
 * Rich Menus with the required template structure.
 * 
 * Usage:
 *   npm run manage-rich-menu -- --help
 *   npm run manage-rich-menu -- create --template template.json
 *   npm run manage-rich-menu -- upload --rich-menu-id ID --image image.jpg
 *   npm run manage-rich-menu -- setup-complete --template template.json --image image.jpg
 */

import { config } from 'dotenv';
import { RichMenuService, RichMenuTemplate } from '../src/services/rich-menu-service';
import { Logger } from '../src/utils/logger';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config();

interface RichMenuOptions {
  channelAccessToken?: string;
  template?: string;
  image?: string;
  richMenuId?: string;
  verbose?: boolean;
}

class RichMenuManager {
  private options: RichMenuOptions;

  constructor(options: RichMenuOptions = {}) {
    this.options = {
      channelAccessToken: options.channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN,
      template: options.template,
      image: options.image,
      richMenuId: options.richMenuId,
      verbose: options.verbose || false
    };
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
      this.showHelp();
      return;
    }

    if (!this.options.channelAccessToken) {
      console.error('❌ Channel Access Token is required');
      console.error('   Set LINE_CHANNEL_ACCESS_TOKEN environment variable or use --token option');
      process.exit(1);
    }

    try {
      const richMenuService = new RichMenuService(this.options.channelAccessToken);

      switch (command) {
        case 'create':
          await this.createRichMenu(richMenuService);
          break;
        case 'upload':
          await this.uploadImage(richMenuService);
          break;
        case 'setup-complete':
          await this.setupComplete(richMenuService);
          break;
        case 'list':
          await this.listRichMenus(richMenuService);
          break;
        case 'delete':
          await this.deleteRichMenu(richMenuService);
          break;
        case 'set-default':
          await this.setDefaultRichMenu(richMenuService);
          break;
        case 'template':
          this.generateTemplate();
          break;
        case 'help':
        case '--help':
        case '-h':
          this.showHelp();
          break;
        default:
          console.error(`❌ Unknown command: ${command}`);
          this.showHelp();
          process.exit(1);
      }
    } catch (error) {
      console.error('💥 Operation failed:', error);
      process.exit(1);
    }
  }

  private async createRichMenu(service: RichMenuService): Promise<void> {
    console.log('🎨 Creating Rich Menu...');

    if (!this.options.template) {
      console.error('❌ Template file is required for create command');
      console.error('   Use: --template template.json');
      process.exit(1);
    }

    const template = this.loadTemplate();
    const result = await service.createRichMenu(template);

    if (result.success) {
      console.log(`✅ Rich Menu created successfully!`);
      console.log(`   Rich Menu ID: ${result.richMenuId}`);
      console.log(`   Next step: Upload image with --upload --rich-menu-id ${result.richMenuId}`);
    } else {
      console.error(`❌ Failed to create Rich Menu: ${result.error}`);
      process.exit(1);
    }
  }

  private async uploadImage(service: RichMenuService): Promise<void> {
    console.log('📸 Uploading Rich Menu image...');

    if (!this.options.richMenuId) {
      console.error('❌ Rich Menu ID is required for upload command');
      console.error('   Use: --rich-menu-id ID');
      process.exit(1);
    }

    if (!this.options.image) {
      console.error('❌ Image file is required for upload command');
      console.error('   Use: --image image.jpg');
      process.exit(1);
    }

    const imageBuffer = this.loadImage();
    const contentType = this.getContentType(this.options.image);

    const result = await service.uploadRichMenuImage(
      this.options.richMenuId,
      imageBuffer,
      contentType
    );

    if (result.success) {
      console.log(`✅ Rich Menu image uploaded successfully!`);
      console.log(`   Rich Menu ID: ${result.richMenuId}`);
      console.log(`   Next step: Set as default with --set-default --rich-menu-id ${result.richMenuId}`);
    } else {
      console.error(`❌ Failed to upload image: ${result.error}`);
      process.exit(1);
    }
  }

  private async setupComplete(service: RichMenuService): Promise<void> {
    console.log('🚀 Setting up complete Rich Menu...');

    if (!this.options.template) {
      console.error('❌ Template file is required for setup-complete command');
      console.error('   Use: --template template.json');
      process.exit(1);
    }

    if (!this.options.image) {
      console.error('❌ Image file is required for setup-complete command');
      console.error('   Use: --image image.jpg');
      process.exit(1);
    }

    const template = this.loadTemplate();
    const imageBuffer = this.loadImage();
    const contentType = this.getContentType(this.options.image);

    console.log('   Step 1: Creating Rich Menu...');
    console.log('   Step 2: Uploading image...');
    console.log('   Step 3: Setting as default...');

    const result = await service.setupCompleteRichMenu(template, imageBuffer, contentType);

    if (result.success) {
      console.log(`✅ Complete Rich Menu setup finished successfully!`);
      console.log(`   Rich Menu ID: ${result.richMenuId}`);
      console.log(`   Your Official Account now has the Rich Menu configured.`);
    } else {
      console.error(`❌ Failed to setup Rich Menu: ${result.error}`);
      process.exit(1);
    }
  }

  private async listRichMenus(service: RichMenuService): Promise<void> {
    console.log('📋 Fetching Rich Menus...');

    const result = await service.getRichMenus();

    if (result.success && result.richMenus) {
      console.log(`✅ Found ${result.richMenus.length} Rich Menu(s):`);
      console.log('');

      result.richMenus.forEach((menu, index) => {
        console.log(`   ${index + 1}. ${menu.name}`);
        console.log(`      ID: ${menu.richMenuId}`);
        console.log(`      Size: ${menu.size.width}x${menu.size.height}`);
        console.log(`      Areas: ${menu.areas.length}`);
        console.log(`      Default: ${menu.selected ? 'Yes' : 'No'}`);
        console.log('');
      });
    } else {
      console.error(`❌ Failed to fetch Rich Menus: ${result.error}`);
      process.exit(1);
    }
  }

  private async deleteRichMenu(service: RichMenuService): Promise<void> {
    console.log('🗑️  Deleting Rich Menu...');

    if (!this.options.richMenuId) {
      console.error('❌ Rich Menu ID is required for delete command');
      console.error('   Use: --rich-menu-id ID');
      process.exit(1);
    }

    const result = await service.deleteRichMenu(this.options.richMenuId);

    if (result.success) {
      console.log(`✅ Rich Menu deleted successfully!`);
      console.log(`   Rich Menu ID: ${result.richMenuId}`);
    } else {
      console.error(`❌ Failed to delete Rich Menu: ${result.error}`);
      process.exit(1);
    }
  }

  private async setDefaultRichMenu(service: RichMenuService): Promise<void> {
    console.log('⭐ Setting Rich Menu as default...');

    if (!this.options.richMenuId) {
      console.error('❌ Rich Menu ID is required for set-default command');
      console.error('   Use: --rich-menu-id ID');
      process.exit(1);
    }

    const result = await service.setDefaultRichMenu(this.options.richMenuId);

    if (result.success) {
      console.log(`✅ Rich Menu set as default successfully!`);
      console.log(`   Rich Menu ID: ${result.richMenuId}`);
    } else {
      console.error(`❌ Failed to set Rich Menu as default: ${result.error}`);
      process.exit(1);
    }
  }

  private generateTemplate(): void {
    console.log('📝 Generating Rich Menu template...');

    const template: RichMenuTemplate = {
      name: 'LINE Yield Rich Menu',
      chatBarText: 'Open Menu',
      miniDappUrl: 'https://liff.line.me/YOUR_LIFF_ID',
      socialChannel1Url: 'https://yourprojectwebsite.com',
      socialChannel2Url: 'https://twitter.com/yourproject',
      dappPortalUrl: 'https://liff.line.me/2006533014-8gD06D64'
    };

    const templateFile = 'rich-menu-template.json';
    fs.writeFileSync(templateFile, JSON.stringify(template, null, 2));

    console.log(`✅ Template generated: ${templateFile}`);
    console.log('');
    console.log('📋 Template Configuration:');
    console.log(`   Name: ${template.name}`);
    console.log(`   Mini Dapp URL: ${template.miniDappUrl}`);
    console.log(`   Social Channel 1: ${template.socialChannel1Url}`);
    console.log(`   Social Channel 2: ${template.socialChannel2Url}`);
    console.log(`   Dapp Portal URL: ${template.dappPortalUrl}`);
    console.log('');
    console.log('⚠️  Remember to update the URLs in the template file before using it!');
  }

  private loadTemplate(): RichMenuTemplate {
    try {
      const templatePath = path.resolve(this.options.template!);
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      return JSON.parse(templateContent);
    } catch (error) {
      console.error(`❌ Failed to load template file: ${this.options.template}`);
      console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  }

  private loadImage(): Buffer {
    try {
      const imagePath = path.resolve(this.options.image!);
      return fs.readFileSync(imagePath);
    } catch (error) {
      console.error(`❌ Failed to load image file: ${this.options.image}`);
      console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  }

  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      default:
        return 'image/jpeg';
    }
  }

  private showHelp(): void {
    console.log(`
🎨 Rich Menu Management Tool
============================

This tool helps manage LINE Official Account Rich Menus according to Kaia Wave guidelines.

Commands:
  create              Create a new Rich Menu
  upload              Upload image for a Rich Menu
  setup-complete      Complete setup (create + upload + set default)
  list                List all Rich Menus
  delete              Delete a Rich Menu
  set-default         Set a Rich Menu as default
  template            Generate template configuration file

Options:
  --token <token>           LINE Channel Access Token
  --template <file>         Template JSON file
  --image <file>            Image file (JPEG/PNG)
  --rich-menu-id <id>       Rich Menu ID
  --verbose                 Verbose output

Examples:
  # Generate template
  npm run manage-rich-menu -- template

  # Create Rich Menu
  npm run manage-rich-menu -- create --template rich-menu-template.json

  # Upload image
  npm run manage-rich-menu -- upload --rich-menu-id richmenu-123 --image menu.jpg

  # Complete setup
  npm run manage-rich-menu -- setup-complete --template template.json --image menu.jpg

  # List all Rich Menus
  npm run manage-rich-menu -- list

  # Set as default
  npm run manage-rich-menu -- set-default --rich-menu-id richmenu-123

Environment Variables:
  LINE_CHANNEL_ACCESS_TOKEN  Channel Access Token (required)

Requirements:
  - Rich Menu image must be 2500x1686 pixels
  - Image format: JPEG or PNG
  - Template must include all required URLs
  - Area D must link to Dapp Portal: https://liff.line.me/2006533014-8gD06D64
    `);
  }
}

// CLI argument parsing
function parseArguments(): RichMenuOptions {
  const args = process.argv.slice(2);
  const options: RichMenuOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--token':
      case '-t':
        options.channelAccessToken = args[++i];
        break;
      case '--template':
        options.template = args[++i];
        break;
      case '--image':
      case '-i':
        options.image = args[++i];
        break;
      case '--rich-menu-id':
        options.richMenuId = args[++i];
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
    }
  }

  return options;
}

// Main execution
if (require.main === module) {
  const options = parseArguments();
  const manager = new RichMenuManager(options);
  manager.run().catch((error) => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

export { RichMenuManager };


