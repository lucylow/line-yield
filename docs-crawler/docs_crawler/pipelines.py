import json
import os
from datetime import datetime
from scrapy.exporters import JsonItemExporter
from docs_crawler.items import DocumentationItem, CodeExampleItem, LinkItem


class DocumentationPipeline:
    """Pipeline for processing documentation items"""
    
    def __init__(self):
        self.items = []
        self.code_examples = []
        self.links = []
    
    def process_item(self, item, spider):
        if isinstance(item, DocumentationItem):
            # Clean and validate documentation item
            cleaned_item = self.clean_documentation_item(item)
            if cleaned_item:
                self.items.append(cleaned_item)
        
        elif isinstance(item, CodeExampleItem):
            # Process code examples
            cleaned_code = self.clean_code_example(item)
            if cleaned_code:
                self.code_examples.append(cleaned_code)
        
        elif isinstance(item, LinkItem):
            # Process links
            cleaned_link = self.clean_link_item(item)
            if cleaned_link:
                self.links.append(cleaned_link)
        
        return item
    
    def clean_documentation_item(self, item):
        """Clean and validate documentation item"""
        # Remove empty or invalid items
        if not item.get('content') or len(item['content']) < 50:
            return None
        
        if not item.get('title'):
            return None
        
        # Clean content
        item['content'] = self.clean_text(item['content'])
        item['title'] = self.clean_text(item['title'])
        
        # Ensure required fields
        item.setdefault('language', 'en')
        item.setdefault('section', 'General Documentation')
        item.setdefault('tags', [])
        
        return item
    
    def clean_code_example(self, item):
        """Clean code example item"""
        if not item.get('code') or len(item['code']) < 10:
            return None
        
        item['code'] = self.clean_text(item['code'])
        item.setdefault('language', 'text')
        item.setdefault('description', 'Code example')
        
        return item
    
    def clean_link_item(self, item):
        """Clean link item"""
        if not item.get('url') or not item.get('text'):
            return None
        
        item['text'] = self.clean_text(item['text'])
        
        return item
    
    def clean_text(self, text):
        """Clean text content"""
        if not text:
            return ""
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Remove common unwanted characters
        text = text.replace('\u00a0', ' ')  # Non-breaking space
        text = text.replace('\u2019', "'")  # Right single quotation mark
        text = text.replace('\u201c', '"')  # Left double quotation mark
        text = text.replace('\u201d', '"')  # Right double quotation mark
        
        return text.strip()
    
    def close_spider(self, spider):
        """Called when spider closes"""
        # Create output directory
        os.makedirs('output', exist_ok=True)
        
        # Save processed items
        self.save_documentation_items()
        self.save_code_examples()
        self.save_links()
        self.generate_summary()
    
    def save_documentation_items(self):
        """Save documentation items to JSON"""
        output_file = 'output/documentation_items.json'
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.items, f, indent=2, ensure_ascii=False)
        
        print(f"Saved {len(self.items)} documentation items to {output_file}")
    
    def save_code_examples(self):
        """Save code examples to JSON"""
        output_file = 'output/code_examples.json'
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.code_examples, f, indent=2, ensure_ascii=False)
        
        print(f"Saved {len(self.code_examples)} code examples to {output_file}")
    
    def save_links(self):
        """Save links to JSON"""
        output_file = 'output/links.json'
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.links, f, indent=2, ensure_ascii=False)
        
        print(f"Saved {len(self.links)} links to {output_file}")
    
    def generate_summary(self):
        """Generate summary statistics"""
        summary = {
            'crawl_date': datetime.now().isoformat(),
            'total_documentation_items': len(self.items),
            'total_code_examples': len(self.code_examples),
            'total_links': len(self.links),
            'sections': {},
            'languages': {},
            'page_types': {}
        }
        
        # Analyze sections
        for item in self.items:
            section = item.get('section', 'Unknown')
            summary['sections'][section] = summary['sections'].get(section, 0) + 1
            
            language = item.get('language', 'Unknown')
            summary['languages'][language] = summary['languages'].get(language, 0) + 1
            
            page_type = item.get('page_type', 'Unknown')
            summary['page_types'][page_type] = summary['page_types'].get(page_type, 0) + 1
        
        # Save summary
        with open('output/crawl_summary.json', 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        
        print(f"Generated crawl summary: {summary}")


class MarkdownPipeline:
    """Pipeline for generating Markdown documentation"""
    
    def __init__(self):
        self.documentation_items = []
    
    def process_item(self, item, spider):
        if isinstance(item, DocumentationItem):
            self.documentation_items.append(item)
        return item
    
    def close_spider(self, spider):
        """Generate Markdown documentation when spider closes"""
        self.generate_markdown_docs()
    
    def generate_markdown_docs(self):
        """Generate comprehensive Markdown documentation"""
        os.makedirs('output', exist_ok=True)
        
        # Generate main documentation file
        self.generate_main_documentation()
        
        # Generate section-specific files
        self.generate_section_docs()
        
        # Generate code examples file
        self.generate_code_examples_doc()
    
    def generate_main_documentation(self):
        """Generate main documentation file"""
        with open('output/DAPP_PORTAL_DOCUMENTATION.md', 'w', encoding='utf-8') as f:
            f.write("# Dapp Portal Documentation\n\n")
            f.write(f"*Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n\n")
            f.write("## Table of Contents\n\n")
            
            # Generate table of contents
            sections = {}
            for item in self.documentation_items:
                section = item.get('section', 'General Documentation')
                if section not in sections:
                    sections[section] = []
                sections[section].append(item)
            
            for section in sorted(sections.keys()):
                f.write(f"- [{section}](#{section.lower().replace(' ', '-')})\n")
            
            f.write("\n---\n\n")
            
            # Generate content for each section
            for section, items in sections.items():
                f.write(f"## {section}\n\n")
                
                for item in items:
                    f.write(f"### {item['title']}\n\n")
                    f.write(f"**URL:** {item['url']}\n\n")
                    f.write(f"**Language:** {item.get('language', 'en')}\n\n")
                    f.write(f"**Last Updated:** {item.get('last_updated', 'Unknown')}\n\n")
                    
                    if item.get('tags'):
                        f.write(f"**Tags:** {', '.join(item['tags'])}\n\n")
                    
                    # Add content
                    if item.get('content'):
                        f.write(f"{item['content']}\n\n")
                    
                    # Add code blocks
                    if item.get('code_blocks'):
                        f.write("#### Code Examples\n\n")
                        for code_block in item['code_blocks']:
                            f.write(f"```{code_block.get('language', 'text')}\n")
                            f.write(f"{code_block['code']}\n")
                            f.write("```\n\n")
                    
                    f.write("---\n\n")
    
    def generate_section_docs(self):
        """Generate section-specific documentation files"""
        sections = {}
        for item in self.documentation_items:
            section = item.get('section', 'General Documentation')
            if section not in sections:
                sections[section] = []
            sections[section].append(item)
        
        for section, items in sections.items():
            filename = f"output/{section.lower().replace(' ', '_')}_docs.md"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(f"# {section} Documentation\n\n")
                f.write(f"*Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n\n")
                
                for item in items:
                    f.write(f"## {item['title']}\n\n")
                    f.write(f"**URL:** {item['url']}\n\n")
                    
                    if item.get('content'):
                        f.write(f"{item['content']}\n\n")
                    
                    if item.get('code_blocks'):
                        f.write("### Code Examples\n\n")
                        for code_block in item['code_blocks']:
                            f.write(f"```{code_block.get('language', 'text')}\n")
                            f.write(f"{code_block['code']}\n")
                            f.write("```\n\n")
    
    def generate_code_examples_doc(self):
        """Generate code examples documentation"""
        # This would be populated by the MarkdownPipeline
        # For now, create a placeholder
        with open('output/CODE_EXAMPLES.md', 'w', encoding='utf-8') as f:
            f.write("# Code Examples\n\n")
            f.write(f"*Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n\n")
            f.write("This file will contain all code examples extracted from the documentation.\n")
