import scrapy
from scrapy import Field


class DocumentationItem(scrapy.Item):
    """Item for storing documentation content"""
    
    # Basic page information
    url = Field()
    title = Field()
    last_updated = Field()
    page_type = Field()
    
    # Content structure
    headings = Field()  # List of headings with hierarchy
    content = Field()   # Main content text
    code_blocks = Field()  # Code snippets
    links = Field()     # Internal and external links
    
    # Metadata
    language = Field()  # English/Japanese
    section = Field()   # Mini Dapp, Dapp Portal, etc.
    tags = Field()      # Keywords and tags
    
    # Quality metrics
    content_length = Field()
    has_code = Field()
    is_complete = Field()


class CodeExampleItem(scrapy.Item):
    """Item for storing code examples"""
    
    language = Field()  # JavaScript, TypeScript, etc.
    code = Field()
    description = Field()
    context = Field()   # Where it was found
    url = Field()


class LinkItem(scrapy.Item):
    """Item for storing link information"""
    
    url = Field()
    text = Field()
    is_internal = Field()
    is_broken = Field()
    context = Field()
