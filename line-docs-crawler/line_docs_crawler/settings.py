BOT_NAME = 'line_docs_crawler'

SPIDER_MODULES = ['line_docs_crawler.spiders']
NEWSPIDER_MODULE = 'line_docs_crawler.spiders'

# Obey robots.txt rules
ROBOTSTXT_OBEY = True

# Configure delay for requests
DOWNLOAD_DELAY = 5  # 5 second delay between requests

# Configure maximum depth
DEPTH_LIMIT = 5

# Enable Splash for JavaScript rendering (if needed)
SPLASH_URL = 'http://localhost:8050'
DOWNLOADER_MIDDLEWARES = {
    'scrapy_splash.SplashCookiesMiddleware': 723,
    'scrapy_splash.SplashMiddleware': 725,
    'scrapy.downloadermiddlewares.httpcompression.HttpCompressionMiddleware': 810,
    'line_docs_crawler.middlewares.LineDocsCrawlerMiddleware': 543,
}

# Set settings whose default value is deprecated to a future-proof value
FEED_EXPORT_ENCODING = 'utf-8'
FEEDS = {
    'output/%(name)s_%(time)s.jsonl': {
        'format': 'jsonlines',
        'encoding': 'utf8',
        'store_empty': False,
        'item_classes': [None],
    },
}

# Auto-throttle settings
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 5
AUTOTHROTTLE_MAX_DELAY = 60
AUTOTHROTTLE_TARGET_CONCURRENCY = 1.0

# Cache settings to avoid re-crawling
HTTPCACHE_ENABLED = True
HTTPCACHE_EXPIRATION_SECS = 604800  # 1 week

# Configure pipelines
ITEM_PIPELINES = {
    'line_docs_crawler.pipelines.ContentProcessingPipeline': 300,
    'line_docs_crawler.pipelines.JsonWriterPipeline': 400,
}

# User agent
USER_AGENT = 'line_docs_crawler (+http://www.yourdomain.com)'

# Concurrent requests
CONCURRENT_REQUESTS = 1
CONCURRENT_REQUESTS_PER_DOMAIN = 1

# Logging
LOG_LEVEL = 'INFO'
