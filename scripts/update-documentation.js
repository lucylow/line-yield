#!/usr/bin/env node
/**
 * Documentation Update Script
 * Automatically updates project documentation from crawled Dapp Portal docs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DocumentationUpdater {
  constructor() {
    this.projectRoot = process.cwd();
    this.docsCrawlerPath = path.join(this.projectRoot, 'docs-crawler');
    this.docsPath = path.join(this.projectRoot, 'docs');
    this.outputPath = path.join(this.docsCrawlerPath, 'output');
  }

  /**
   * Check if documentation crawler exists
   */
  checkCrawlerExists() {
    if (!fs.existsSync(this.docsCrawlerPath)) {
      console.error('❌ Documentation crawler not found at:', this.docsCrawlerPath);
      console.log('Please ensure the docs-crawler directory exists.');
      return false;
    }
    return true;
  }

  /**
   * Run the documentation crawler
   */
  async runCrawler() {
    console.log('🕷️  Running documentation crawler...');
    
    try {
      // Change to crawler directory
      process.chdir(this.docsCrawlerPath);
      
      // Run the crawler
      execSync('python run_crawler.py --skip-setup', { 
        stdio: 'inherit',
        cwd: this.docsCrawlerPath
      });
      
      console.log('✅ Crawler completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Crawler failed:', error.message);
      return false;
    } finally {
      // Return to project root
      process.chdir(this.projectRoot);
    }
  }

  /**
   * Copy generated documentation to project docs
   */
  copyDocumentation() {
    console.log('📋 Copying generated documentation...');
    
    const structuredPath = path.join(this.outputPath, 'structured');
    
    if (!fs.existsSync(structuredPath)) {
      console.error('❌ Structured documentation not found');
      return false;
    }

    // Ensure docs directory exists
    if (!fs.existsSync(this.docsPath)) {
      fs.mkdirSync(this.docsPath, { recursive: true });
    }

    // Copy all markdown files
    const files = fs.readdirSync(structuredPath);
    let copiedCount = 0;

    files.forEach(file => {
      if (file.endsWith('.md')) {
        const sourcePath = path.join(structuredPath, file);
        const destPath = path.join(this.docsPath, file);
        
        try {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`📄 Copied: ${file}`);
          copiedCount++;
        } catch (error) {
          console.error(`❌ Failed to copy ${file}:`, error.message);
        }
      }
    });

    console.log(`✅ Copied ${copiedCount} documentation files`);
    return copiedCount > 0;
  }

  /**
   * Update project README with documentation links
   */
  updateProjectReadme() {
    console.log('📝 Updating project README...');
    
    const readmePath = path.join(this.projectRoot, 'README.md');
    
    if (!fs.existsSync(readmePath)) {
      console.log('⚠️  Project README not found, skipping update');
      return;
    }

    let readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Check if documentation section exists
    const docSectionRegex = /## 📚 Documentation[\s\S]*?(?=##|$)/;
    const hasDocSection = docSectionRegex.test(readmeContent);
    
    const docSection = `
## 📚 Documentation

### Dapp Portal Integration
- [Dapp Portal Integration Guide](docs/DAPP_PORTAL_INTEGRATION.md) - Complete guide for integrating with Dapp Portal
- [Getting Started](docs/getting_started.md) - Quick start guide for Mini Dapp development
- [API Reference](docs/api_reference.md) - Complete API documentation
- [Code Examples](docs/code_examples.md) - Practical code examples and snippets

### Development Resources
- [Mini Dapp Development](docs/mini_dapp_development.md) - Mini Dapp SDK integration and development
- [Dapp Portal Features](docs/dapp_portal_features.md) - Wallet integration and payment systems
- [Design Guidelines](docs/design_guidelines.md) - UI/UX guidelines and best practices
- [Security](docs/security.md) - Security considerations and best practices

### Generated Documentation
*The above documentation is automatically generated from the official Dapp Portal documentation at [docs.dappportal.io](https://docs.dappportal.io).*

`;

    if (hasDocSection) {
      // Replace existing documentation section
      readmeContent = readmeContent.replace(docSectionRegex, docSection);
    } else {
      // Add documentation section before the last section
      const lastSectionRegex = /(## [^#].*?)(?=\n## [^#]|$)/s;
      const match = readmeContent.match(lastSectionRegex);
      
      if (match) {
        const lastSection = match[1];
        readmeContent = readmeContent.replace(lastSection, docSection + '\n' + lastSection);
      } else {
        // Add at the end
        readmeContent += '\n' + docSection;
      }
    }

    try {
      fs.writeFileSync(readmePath, readmeContent);
      console.log('✅ Project README updated');
    } catch (error) {
      console.error('❌ Failed to update README:', error.message);
    }
  }

  /**
   * Generate documentation index
   */
  generateDocumentationIndex() {
    console.log('📑 Generating documentation index...');
    
    const indexPath = path.join(this.docsPath, 'README.md');
    
    const indexContent = `# LINE Yield Documentation

Welcome to the LINE Yield documentation. This documentation is automatically generated from the official Dapp Portal documentation to provide comprehensive guides for Mini Dapp development and integration.

## 📋 Table of Contents

### Core Documentation
- [Dapp Portal Integration Guide](DAPP_PORTAL_INTEGRATION.md) - Complete integration guide
- [Getting Started](getting_started.md) - Quick start guide
- [API Reference](api_reference.md) - Complete API documentation

### Development Guides
- [Mini Dapp Development](mini_dapp_development.md) - Mini Dapp SDK integration
- [Dapp Portal Features](dapp_portal_features.md) - Wallet and payment integration
- [Kaia Wave Program](kaia_wave_program.md) - Program benefits and application

### Resources
- [Code Examples](code_examples.md) - Practical code examples
- [Design Guidelines](design_guidelines.md) - UI/UX guidelines
- [Security](security.md) - Security best practices

## 🚀 Quick Start

1. **Read the Integration Guide**: Start with [Dapp Portal Integration Guide](DAPP_PORTAL_INTEGRATION.md)
2. **Follow Getting Started**: Use [Getting Started](getting_started.md) for setup
3. **Explore Examples**: Check [Code Examples](code_examples.md) for practical implementations
4. **Reference API**: Use [API Reference](api_reference.md) for detailed API information

## 🔄 Auto-Update

This documentation is automatically updated from the official Dapp Portal documentation. To manually update:

\`\`\`bash
# Run the documentation update script
npm run update-docs

# Or run the crawler directly
cd docs-crawler
python run_crawler.py
\`\`\`

## 📞 Support

- **Official Documentation**: [docs.dappportal.io](https://docs.dappportal.io)
- **Community**: [Discord](https://discord.gg/dappportal)
- **GitHub**: [github.com/line/dapp-portal](https://github.com/line/dapp-portal)

---

*Last updated: ${new Date().toISOString().split('T')[0]}*
`;

    try {
      fs.writeFileSync(indexPath, indexContent);
      console.log('✅ Documentation index generated');
    } catch (error) {
      console.error('❌ Failed to generate index:', error.message);
    }
  }

  /**
   * Update package.json scripts
   */
  updatePackageScripts() {
    console.log('📦 Updating package.json scripts...');
    
    const packagePath = path.join(this.projectRoot, 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      console.log('⚠️  package.json not found, skipping script update');
      return;
    }

    try {
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Add documentation update script
      if (!packageContent.scripts) {
        packageContent.scripts = {};
      }
      
      packageContent.scripts['update-docs'] = 'node scripts/update-documentation.js';
      packageContent.scripts['crawl-docs'] = 'cd docs-crawler && python run_crawler.py';
      
      fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2));
      console.log('✅ Package scripts updated');
    } catch (error) {
      console.error('❌ Failed to update package.json:', error.message);
    }
  }

  /**
   * Main update process
   */
  async update() {
    console.log('🚀 Starting documentation update process...');
    
    // Check if crawler exists
    if (!this.checkCrawlerExists()) {
      return false;
    }

    // Run crawler
    const crawlerSuccess = await this.runCrawler();
    if (!crawlerSuccess) {
      return false;
    }

    // Copy documentation
    const copySuccess = this.copyDocumentation();
    if (!copySuccess) {
      return false;
    }

    // Update project files
    this.updateProjectReadme();
    this.generateDocumentationIndex();
    this.updatePackageScripts();

    console.log('✅ Documentation update completed successfully!');
    console.log('📚 Check the docs/ directory for updated documentation');
    
    return true;
  }
}

// Run the updater
if (require.main === module) {
  const updater = new DocumentationUpdater();
  updater.update().catch(error => {
    console.error('❌ Update process failed:', error);
    process.exit(1);
  });
}

module.exports = DocumentationUpdater;
