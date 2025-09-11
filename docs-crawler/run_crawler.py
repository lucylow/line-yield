#!/usr/bin/env python3
"""
Main script to run the documentation crawler
"""

import os
import sys
import subprocess
import argparse
from datetime import datetime


def setup_environment():
    """Set up the crawling environment"""
    print("Setting up crawling environment...")
    
    # Create output directory
    os.makedirs('output', exist_ok=True)
    os.makedirs('output/structured', exist_ok=True)
    
    # Check if virtual environment exists
    if not os.path.exists('venv'):
        print("Creating virtual environment...")
        subprocess.run([sys.executable, '-m', 'venv', 'venv'], check=True)
    
    # Install requirements
    print("Installing requirements...")
    if os.name == 'nt':  # Windows
        pip_cmd = os.path.join('venv', 'Scripts', 'pip')
    else:  # Unix/Linux/MacOS
        pip_cmd = os.path.join('venv', 'bin', 'pip')
    
    subprocess.run([pip_cmd, 'install', '-r', 'requirements.txt'], check=True)
    
    print("Environment setup completed!")


def run_crawler():
    """Run the Scrapy crawler"""
    print("Starting documentation crawler...")
    
    # Get the correct Python executable
    if os.name == 'nt':  # Windows
        python_cmd = os.path.join('venv', 'Scripts', 'python')
    else:  # Unix/Linux/MacOS
        python_cmd = os.path.join('venv', 'bin', 'python')
    
    # Run the crawler
    try:
        subprocess.run([
            python_cmd, '-m', 'scrapy', 'crawl', 'docs_spider',
            '-s', 'ROBOTSTXT_OBEY=True',
            '-s', 'DOWNLOAD_DELAY=3',
            '-s', 'RANDOMIZE_DOWNLOAD_DELAY=0.5',
            '-s', 'CONCURRENT_REQUESTS=1',
            '-s', 'CONCURRENT_REQUESTS_PER_DOMAIN=1',
            '-L', 'INFO'
        ], check=True)
        
        print("Crawling completed successfully!")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Crawling failed with error: {e}")
        return False


def run_data_processor():
    """Run the data processor"""
    print("Processing crawled data...")
    
    # Get the correct Python executable
    if os.name == 'nt':  # Windows
        python_cmd = os.path.join('venv', 'Scripts', 'python')
    else:  # Unix/Linux/MacOS
        python_cmd = os.path.join('venv', 'bin', 'python')
    
    try:
        subprocess.run([python_cmd, 'data_processor.py'], check=True)
        print("Data processing completed successfully!")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Data processing failed with error: {e}")
        return False


def generate_summary():
    """Generate a summary of the crawling process"""
    summary_file = 'output/CRAWL_SUMMARY.md'
    
    with open(summary_file, 'w', encoding='utf-8') as f:
        f.write("# Documentation Crawl Summary\n\n")
        f.write(f"**Crawl Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write("## Overview\n\n")
        f.write("This document summarizes the automated crawling of docs.dappportal.io documentation.\n\n")
        
        f.write("## Process Steps\n\n")
        f.write("1. **Environment Setup:** Created virtual environment and installed dependencies\n")
        f.write("2. **Web Crawling:** Used Scrapy to crawl documentation pages\n")
        f.write("3. **Data Processing:** Organized and structured the crawled content\n")
        f.write("4. **Documentation Generation:** Created structured Markdown documentation\n\n")
        
        f.write("## Output Files\n\n")
        f.write("- `documentation_items.json` - Raw documentation data\n")
        f.write("- `code_examples.json` - Extracted code examples\n")
        f.write("- `links.json` - Link information\n")
        f.write("- `processed_data.json` - Processed and organized data\n")
        f.write("- `structured/` - Generated documentation files\n\n")
        
        f.write("## Usage\n\n")
        f.write("The generated documentation can be used for:\n")
        f.write("- Developer onboarding\n")
        f.write("- API reference\n")
        f.write("- Code examples\n")
        f.write("- Integration guides\n\n")
        
        f.write("## Next Steps\n\n")
        f.write("1. Review generated documentation for accuracy\n")
        f.write("2. Integrate into project documentation system\n")
        f.write("3. Set up automated updates\n")
        f.write("4. Add to AI assistant training data\n")
    
    print(f"Summary generated: {summary_file}")


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Run documentation crawler')
    parser.add_argument('--setup-only', action='store_true', help='Only setup environment')
    parser.add_argument('--crawl-only', action='store_true', help='Only run crawler')
    parser.add_argument('--process-only', action='store_true', help='Only process data')
    parser.add_argument('--skip-setup', action='store_true', help='Skip environment setup')
    
    args = parser.parse_args()
    
    print("=== Documentation Crawler ===")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Setup environment
        if not args.skip_setup:
            setup_environment()
        
        if args.setup_only:
            print("Environment setup completed. Exiting.")
            return
        
        # Run crawler
        if not args.process_only:
            if not run_crawler():
                print("Crawling failed. Exiting.")
                return
        
        if args.crawl_only:
            print("Crawling completed. Exiting.")
            return
        
        # Process data
        if not run_data_processor():
            print("Data processing failed. Exiting.")
            return
        
        # Generate summary
        generate_summary()
        
        print("\n=== Crawling Process Completed Successfully ===")
        print("Check the 'output' directory for generated files.")
        
    except KeyboardInterrupt:
        print("\nProcess interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
