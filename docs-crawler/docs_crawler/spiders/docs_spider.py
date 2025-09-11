import scrapy
from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors import LinkExtractor
from scrapy.http import Request
from docs_crawler.items import DocumentationItem, CodeExampleItem, LinkItem
from urllib.parse import urljoin, urlparse
import re
from datetime import datetime


class DocsSpider(CrawlSpider):
    name = 'docs_spider'
    allowed_domains = ['docs.dappportal.io']
    start_urls = ['https://docs.dappportal.io/']
    
    # Define crawling rules
    rules = (
        Rule(
            LinkExtractor(
                allow=[
                    r'/mini-dapp/.*',
                    r'/dapp-portal/.*',
                    r'/kaia-wave/.*',
                    r'/docs/.*',
                ],
                deny=[
                    r'/api/.*',
                    r'/admin/.*',
                    r'/login/.*',
                    r'/register/.*',
                    r'\.(pdf|zip|exe|dmg)$',
                ],
                unique=True
            ),
            callback='parse_documentation',
            follow=True
        ),
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.processed_urls = set()
        self.max_depth = 5
        
    def parse_documentation(self, response):
        """Parse documentation pages"""
        if response.url in self.processed_urls:
            return
            
        self.processed_urls.add(response.url)
        
        # Check depth limit
        depth = response.meta.get('depth', 0)
        if depth > self.max_depth:
            return
            
        # Check page size
        if len(response.body) > 7 * 1024 * 1024:  # 7MB limit
            self.logger.warning(f"Page too large, skipping: {response.url}")
            return
            
        # Extract page information
        item = DocumentationItem()
        item['url'] = response.url
        item['title'] = self.extract_title(response)
        item['last_updated'] = self.extract_last_updated(response)
        item['page_type'] = self.determine_page_type(response.url)
        item['language'] = self.detect_language(response)
        item['section'] = self.determine_section(response.url)
        
        # Extract content
        item['headings'] = self.extract_headings(response)
        item['content'] = self.extract_content(response)
        item['code_blocks'] = self.extract_code_blocks(response)
        item['links'] = self.extract_links(response)
        item['tags'] = self.extract_tags(response)
        
        # Calculate quality metrics
        item['content_length'] = len(item['content'])
        item['has_code'] = len(item['code_blocks']) > 0
        item['is_complete'] = self.is_content_complete(item)
        
        yield item
        
        # Extract code examples separately
        for code_item in self.extract_code_examples(response):
            yield code_item
            
        # Extract link information
        for link_item in self.extract_link_items(response):
            yield link_item
    
    def extract_title(self, response):
        """Extract page title"""
        title_selectors = [
            'h1::text',
            'title::text',
            '.page-title::text',
            '.article-title::text',
            '[data-testid="page-title"]::text'
        ]
        
        for selector in title_selectors:
            title = response.css(selector).get()
            if title:
                return title.strip()
        
        # Fallback to URL-based title
        path = urlparse(response.url).path
        return path.split('/')[-1].replace('-', ' ').title()
    
    def extract_last_updated(self, response):
        """Extract last updated date"""
        date_selectors = [
            '.last-updated::text',
            '.updated::text',
            '[data-testid="last-updated"]::text',
            'time::text'
        ]
        
        for selector in date_selectors:
            date_text = response.css(selector).get()
            if date_text:
                return date_text.strip()
        
        return datetime.now().isoformat()
    
    def determine_page_type(self, url):
        """Determine the type of documentation page"""
        if '/mini-dapp/' in url:
            return 'mini_dapp'
        elif '/dapp-portal/' in url:
            return 'dapp_portal'
        elif '/kaia-wave/' in url:
            return 'kaia_wave'
        elif '/api/' in url:
            return 'api'
        else:
            return 'general'
    
    def detect_language(self, response):
        """Detect page language"""
        html_lang = response.css('html::attr(lang)').get()
        if html_lang:
            return html_lang
        
        # Check for Japanese characters
        content = response.text
        if re.search(r'[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]', content):
            return 'ja'
        
        return 'en'
    
    def determine_section(self, url):
        """Determine documentation section"""
        path = urlparse(url).path.lower()
        
        if 'mini-dapp' in path:
            return 'Mini Dapp Development'
        elif 'dapp-portal' in path:
            return 'Dapp Portal Features'
        elif 'kaia-wave' in path:
            return 'Kaia Wave Program'
        elif 'wallet' in path:
            return 'Wallet Integration'
        elif 'payment' in path:
            return 'Payment Systems'
        elif 'design' in path:
            return 'Design Guidelines'
        else:
            return 'General Documentation'
    
    def extract_headings(self, response):
        """Extract headings with hierarchy"""
        headings = []
        
        for i in range(1, 7):  # h1 to h6
            selector = f'h{i}::text'
            for heading in response.css(selector).getall():
                headings.append({
                    'level': i,
                    'text': heading.strip(),
                    'tag': f'h{i}'
                })
        
        return headings
    
    def extract_content(self, response):
        """Extract main content text"""
        content_selectors = [
            '.article__body p::text',
            '.content p::text',
            '.documentation p::text',
            'main p::text',
            'article p::text',
            'p::text'
        ]
        
        content_parts = []
        for selector in content_selectors:
            parts = response.css(selector).getall()
            content_parts.extend([part.strip() for part in parts if part.strip()])
        
        # Remove duplicates while preserving order
        seen = set()
        unique_content = []
        for part in content_parts:
            if part not in seen:
                seen.add(part)
                unique_content.append(part)
        
        return ' '.join(unique_content)
    
    def extract_code_blocks(self, response):
        """Extract code blocks"""
        code_blocks = []
        
        # Extract from <pre><code> blocks
        for code_block in response.css('pre code'):
            language = code_block.css('::attr(class)').get()
            if language:
                language = language.replace('language-', '').replace('lang-', '')
            else:
                language = 'text'
            
            code_text = code_block.css('::text').getall()
            code_content = ''.join(code_text).strip()
            
            if code_content:
                code_blocks.append({
                    'language': language,
                    'code': code_content,
                    'type': 'pre_code'
                })
        
        # Extract from <code> blocks
        for code_block in response.css('code'):
            code_text = code_block.css('::text').getall()
            code_content = ''.join(code_text).strip()
            
            if code_content and len(code_content) > 10:  # Filter out short inline code
                code_blocks.append({
                    'language': 'text',
                    'code': code_content,
                    'type': 'inline'
                })
        
        return code_blocks
    
    def extract_links(self, response):
        """Extract links from the page"""
        links = []
        
        for link in response.css('a'):
            href = link.css('::attr(href)').get()
            text = link.css('::text').get()
            
            if href and text:
                full_url = urljoin(response.url, href)
                is_internal = 'docs.dappportal.io' in full_url
                
                links.append({
                    'url': full_url,
                    'text': text.strip(),
                    'is_internal': is_internal
                })
        
        return links
    
    def extract_tags(self, response):
        """Extract tags and keywords"""
        tags = []
        
        # Extract from meta keywords
        keywords = response.css('meta[name="keywords"]::attr(content)').get()
        if keywords:
            tags.extend([tag.strip() for tag in keywords.split(',')])
        
        # Extract from meta description
        description = response.css('meta[name="description"]::attr(content)').get()
        if description:
            tags.append('description')
        
        # Extract from page content (common terms)
        content = response.text.lower()
        common_terms = [
            'mini dapp', 'dapp portal', 'kaia', 'wallet', 'payment',
            'sdk', 'api', 'integration', 'development', 'tutorial'
        ]
        
        for term in common_terms:
            if term in content:
                tags.append(term)
        
        return list(set(tags))  # Remove duplicates
    
    def extract_code_examples(self, response):
        """Extract code examples as separate items"""
        code_examples = []
        
        for code_block in response.css('pre code'):
            language = code_block.css('::attr(class)').get()
            if language:
                language = language.replace('language-', '').replace('lang-', '')
            else:
                language = 'text'
            
            code_text = code_block.css('::text').getall()
            code_content = ''.join(code_text).strip()
            
            if code_content and len(code_content) > 50:  # Only substantial code blocks
                item = CodeExampleItem()
                item['language'] = language
                item['code'] = code_content
                item['description'] = self.get_code_description(code_block, response)
                item['context'] = response.url
                item['url'] = response.url
                
                code_examples.append(item)
        
        return code_examples
    
    def get_code_description(self, code_block, response):
        """Get description for code block"""
        # Look for preceding paragraph or heading
        prev_elements = code_block.xpath('preceding-sibling::*[position()<=2]')
        for element in prev_elements:
            if element.tag in ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                text = ''.join(element.xpath('.//text()')).strip()
                if text and len(text) < 200:  # Reasonable description length
                    return text
        
        return "Code example"
    
    def extract_link_items(self, response):
        """Extract link information as separate items"""
        link_items = []
        
        for link in response.css('a'):
            href = link.css('::attr(href)').get()
            text = link.css('::text').get()
            
            if href and text:
                full_url = urljoin(response.url, href)
                is_internal = 'docs.dappportal.io' in full_url
                
                item = LinkItem()
                item['url'] = full_url
                item['text'] = text.strip()
                item['is_internal'] = is_internal
                item['is_broken'] = False  # Would need to check this separately
                item['context'] = response.url
                
                link_items.append(item)
        
        return link_items
    
    def is_content_complete(self, item):
        """Check if content is complete and useful"""
        if not item['content'] or len(item['content']) < 100:
            return False
        
        if not item['title']:
            return False
        
        # Check for essential elements based on page type
        if item['page_type'] == 'mini_dapp':
            return any(tag in item['tags'] for tag in ['sdk', 'integration', 'development'])
        elif item['page_type'] == 'dapp_portal':
            return any(tag in item['tags'] for tag in ['wallet', 'payment', 'portal'])
        
        return True
