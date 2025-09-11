# Scrapy settings for docs_crawler project

BOT_NAME = 'docs_crawler'

SPIDER_MODULES = ['docs_crawler.spiders']
NEWSPIDER_MODULE = 'docs_crawler.spiders'

# Obey robots.txt rules
ROBOTSTXT_OBEY = True

# Configure delays for requests (politeness)
DOWNLOAD_DELAY = 3
RANDOMIZE_DOWNLOAD_DELAY = 0.5

# Configure concurrent requests
CONCURRENT_REQUESTS = 1
CONCURRENT_REQUESTS_PER_DOMAIN = 1

# Configure user agent
USER_AGENT = 'docs_crawler (+http://www.yourdomain.com)'

# Configure pipelines
ITEM_PIPELINES = {
    'docs_crawler.pipelines.DocumentationPipeline': 300,
    'docs_crawler.pipelines.MarkdownPipeline': 400,
}

# Configure middlewares
DOWNLOADER_MIDDLEWARES = {
    'docs_crawler.middlewares.RotateUserAgentMiddleware': 400,
    'docs_crawler.middlewares.DelayMiddleware': 500,
}

# Configure extensions
EXTENSIONS = {
    'scrapy.extensions.telnet.TelnetConsole': None,
}

# Configure logging
LOG_LEVEL = 'INFO'

# Configure output
FEEDS = {
    'output/raw_data.json': {
        'format': 'json',
        'encoding': 'utf8',
        'store_empty': False,
        'indent': 2,
    },
    'output/documentation.md': {
        'format': 'markdown',
        'encoding': 'utf8',
        'store_empty': False,
    },
}

# Configure custom settings
CUSTOM_SETTINGS = {
    'DEPTH_LIMIT': 5,
    'MAX_PAGE_SIZE': 7 * 1024 * 1024,  # 7MB
    'DOWNLOAD_TIMEOUT': 120,  # 2 minutes
    'TARGET_DOMAINS': ['docs.dappportal.io'],
    'INCLUDE_PATHS': ['/mini-dapp/', '/dapp-portal/', '/kaia-wave/'],
    'EXCLUDE_PATHS': ['/api/', '/admin/', '/login/', '/register/'],
}
