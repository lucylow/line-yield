#!/usr/bin/env python3
"""
Data Processor for Documentation Crawler
Processes and organizes crawled documentation data
"""

import json
import os
import re
from datetime import datetime
from typing import Dict, List, Any
from collections import defaultdict


class DocumentationProcessor:
    """Processes and organizes crawled documentation data"""
    
    def __init__(self, input_dir: str = "output"):
        self.input_dir = input_dir
        self.documentation_items = []
        self.code_examples = []
        self.links = []
        self.processed_data = {}
    
    def load_data(self):
        """Load all crawled data from JSON files"""
        try:
            # Load documentation items
            docs_file = os.path.join(self.input_dir, "documentation_items.json")
            if os.path.exists(docs_file):
                with open(docs_file, 'r', encoding='utf-8') as f:
                    self.documentation_items = json.load(f)
                print(f"Loaded {len(self.documentation_items)} documentation items")
            
            # Load code examples
            code_file = os.path.join(self.input_dir, "code_examples.json")
            if os.path.exists(code_file):
                with open(code_file, 'r', encoding='utf-8') as f:
                    self.code_examples = json.load(f)
                print(f"Loaded {len(self.code_examples)} code examples")
            
            # Load links
            links_file = os.path.join(self.input_dir, "links.json")
            if os.path.exists(links_file):
                with open(links_file, 'r', encoding='utf-8') as f:
                    self.links = json.load(f)
                print(f"Loaded {len(self.links)} links")
            
        except Exception as e:
            print(f"Error loading data: {e}")
    
    def process_documentation(self):
        """Process and organize documentation items"""
        self.processed_data = {
            'sections': defaultdict(list),
            'languages': defaultdict(list),
            'page_types': defaultdict(list),
            'topics': defaultdict(list),
            'code_by_language': defaultdict(list),
            'statistics': {}
        }
        
        # Organize by sections
        for item in self.documentation_items:
            section = item.get('section', 'General Documentation')
            self.processed_data['sections'][section].append(item)
            
            # Organize by language
            language = item.get('language', 'en')
            self.processed_data['languages'][language].append(item)
            
            # Organize by page type
            page_type = item.get('page_type', 'general')
            self.processed_data['page_types'][page_type].append(item)
            
            # Extract topics from tags
            tags = item.get('tags', [])
            for tag in tags:
                self.processed_data['topics'][tag].append(item)
        
        # Organize code examples by language
        for code_item in self.code_examples:
            language = code_item.get('language', 'text')
            self.processed_data['code_by_language'][language].append(code_item)
        
        # Calculate statistics
        self.calculate_statistics()
        
        print("Documentation processing completed")
    
    def calculate_statistics(self):
        """Calculate processing statistics"""
        stats = {
            'total_documentation_items': len(self.documentation_items),
            'total_code_examples': len(self.code_examples),
            'total_links': len(self.links),
            'sections_count': len(self.processed_data['sections']),
            'languages_count': len(self.processed_data['languages']),
            'page_types_count': len(self.processed_data['page_types']),
            'topics_count': len(self.processed_data['topics']),
            'processing_date': datetime.now().isoformat()
        }
        
        # Calculate content statistics
        total_content_length = sum(len(item.get('content', '')) for item in self.documentation_items)
        stats['total_content_length'] = total_content_length
        stats['average_content_length'] = total_content_length / len(self.documentation_items) if self.documentation_items else 0
        
        # Calculate code statistics
        code_languages = set(item.get('language', 'text') for item in self.code_examples)
        stats['code_languages'] = list(code_languages)
        stats['code_languages_count'] = len(code_languages)
        
        self.processed_data['statistics'] = stats
    
    def generate_structured_documentation(self):
        """Generate structured documentation files"""
        os.makedirs('output/structured', exist_ok=True)
        
        # Generate main documentation index
        self.generate_documentation_index()
        
        # Generate section-specific documentation
        self.generate_section_documentation()
        
        # Generate code examples documentation
        self.generate_code_documentation()
        
        # Generate API reference
        self.generate_api_reference()
        
        # Generate getting started guide
        self.generate_getting_started_guide()
    
    def generate_documentation_index(self):
        """Generate main documentation index"""
        with open('output/structured/README.md', 'w', encoding='utf-8') as f:
            f.write("# Dapp Portal Documentation\n\n")
            f.write(f"*Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n\n")
            
            # Add statistics
            stats = self.processed_data['statistics']
            f.write("## Overview\n\n")
            f.write(f"- **Total Documentation Pages:** {stats['total_documentation_items']}\n")
            f.write(f"- **Code Examples:** {stats['total_code_examples']}\n")
            f.write(f"- **Sections:** {stats['sections_count']}\n")
            f.write(f"- **Languages:** {stats['languages_count']}\n")
            f.write(f"- **Topics:** {stats['topics_count']}\n\n")
            
            # Add table of contents
            f.write("## Table of Contents\n\n")
            f.write("1. [Getting Started](getting_started.md)\n")
            f.write("2. [Mini Dapp Development](mini_dapp_development.md)\n")
            f.write("3. [Dapp Portal Features](dapp_portal_features.md)\n")
            f.write("4. [Kaia Wave Program](kaia_wave_program.md)\n")
            f.write("5. [API Reference](api_reference.md)\n")
            f.write("6. [Code Examples](code_examples.md)\n")
            f.write("7. [Design Guidelines](design_guidelines.md)\n")
            f.write("8. [Security](security.md)\n\n")
            
            # Add quick links
            f.write("## Quick Links\n\n")
            f.write("- [SDK Integration](mini_dapp_development.md#sdk-integration)\n")
            f.write("- [Wallet Integration](dapp_portal_features.md#wallet-integration)\n")
            f.write("- [Payment Systems](dapp_portal_features.md#payment-systems)\n")
            f.write("- [Design Requirements](design_guidelines.md)\n")
            f.write("- [Code Examples](code_examples.md)\n\n")
    
    def generate_section_documentation(self):
        """Generate section-specific documentation"""
        for section, items in self.processed_data['sections'].items():
            filename = f"output/structured/{section.lower().replace(' ', '_')}.md"
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(f"# {section}\n\n")
                f.write(f"*Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n\n")
                
                # Add section overview
                f.write("## Overview\n\n")
                f.write(f"This section contains {len(items)} documentation pages related to {section.lower()}.\n\n")
                
                # Add table of contents
                f.write("## Table of Contents\n\n")
                for i, item in enumerate(items, 1):
                    title = item.get('title', 'Untitled')
                    f.write(f"{i}. [{title}](#{self.slugify(title)})\n")
                
                f.write("\n---\n\n")
                
                # Add content for each item
                for item in items:
                    self.write_documentation_item(f, item)
    
    def generate_code_documentation(self):
        """Generate code examples documentation"""
        with open('output/structured/code_examples.md', 'w', encoding='utf-8') as f:
            f.write("# Code Examples\n\n")
            f.write(f"*Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n\n")
            
            # Organize by language
            for language, examples in self.processed_data['code_by_language'].items():
                f.write(f"## {language.title()} Examples\n\n")
                
                for i, example in enumerate(examples, 1):
                    f.write(f"### Example {i}\n\n")
                    
                    if example.get('description'):
                        f.write(f"**Description:** {example['description']}\n\n")
                    
                    f.write(f"```{language}\n")
                    f.write(f"{example['code']}\n")
                    f.write("```\n\n")
                    
                    if example.get('context'):
                        f.write(f"**Source:** {example['context']}\n\n")
                
                f.write("---\n\n")
    
    def generate_api_reference(self):
        """Generate API reference documentation"""
        # Find API-related documentation
        api_items = []
        for item in self.documentation_items:
            if 'api' in item.get('tags', []) or 'api' in item.get('page_type', ''):
                api_items.append(item)
        
        with open('output/structured/api_reference.md', 'w', encoding='utf-8') as f:
            f.write("# API Reference\n\n")
            f.write(f"*Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n\n")
            
            if not api_items:
                f.write("No API documentation found in the crawled data.\n")
                return
            
            f.write("## Overview\n\n")
            f.write(f"This section contains {len(api_items)} API-related documentation pages.\n\n")
            
            for item in api_items:
                self.write_documentation_item(f, item)
    
    def generate_getting_started_guide(self):
        """Generate getting started guide"""
        # Find getting started related content
        getting_started_items = []
        keywords = ['getting started', 'tutorial', 'quick start', 'beginner', 'setup', 'installation']
        
        for item in self.documentation_items:
            title = item.get('title', '').lower()
            content = item.get('content', '').lower()
            tags = [tag.lower() for tag in item.get('tags', [])]
            
            if any(keyword in title or keyword in content or keyword in tags for keyword in keywords):
                getting_started_items.append(item)
        
        with open('output/structured/getting_started.md', 'w', encoding='utf-8') as f:
            f.write("# Getting Started\n\n")
            f.write(f"*Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n\n")
            
            f.write("## Welcome to Dapp Portal Development\n\n")
            f.write("This guide will help you get started with developing Mini Dapps and integrating with the Dapp Portal.\n\n")
            
            if getting_started_items:
                f.write("## Quick Start Guides\n\n")
                for item in getting_started_items:
                    self.write_documentation_item(f, item)
            else:
                f.write("## Getting Started Resources\n\n")
                f.write("Please refer to the main documentation sections for getting started information.\n")
    
    def write_documentation_item(self, file, item):
        """Write a documentation item to file"""
        title = item.get('title', 'Untitled')
        file.write(f"### {title}\n\n")
        
        if item.get('url'):
            file.write(f"**Source:** {item['url']}\n\n")
        
        if item.get('language'):
            file.write(f"**Language:** {item['language']}\n\n")
        
        if item.get('last_updated'):
            file.write(f"**Last Updated:** {item['last_updated']}\n\n")
        
        if item.get('tags'):
            file.write(f"**Tags:** {', '.join(item['tags'])}\n\n")
        
        if item.get('content'):
            file.write(f"{item['content']}\n\n")
        
        if item.get('code_blocks'):
            file.write("#### Code Examples\n\n")
            for code_block in item['code_blocks']:
                language = code_block.get('language', 'text')
                file.write(f"```{language}\n")
                file.write(f"{code_block['code']}\n")
                file.write("```\n\n")
        
        file.write("---\n\n")
    
    def slugify(self, text):
        """Convert text to URL-friendly slug"""
        text = text.lower()
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text.strip('-')
    
    def save_processed_data(self):
        """Save processed data to JSON file"""
        output_file = 'output/processed_data.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.processed_data, f, indent=2, ensure_ascii=False)
        print(f"Processed data saved to {output_file}")


def main():
    """Main function to run the data processor"""
    processor = DocumentationProcessor()
    
    print("Loading crawled data...")
    processor.load_data()
    
    print("Processing documentation...")
    processor.process_documentation()
    
    print("Generating structured documentation...")
    processor.generate_structured_documentation()
    
    print("Saving processed data...")
    processor.save_processed_data()
    
    print("Data processing completed successfully!")


if __name__ == "__main__":
    main()
