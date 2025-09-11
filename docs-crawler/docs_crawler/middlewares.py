import random
import time
from scrapy.downloadermiddlewares.useragent import UserAgentMiddleware
from scrapy.downloadermiddlewares.retry import RetryMiddleware
from scrapy.utils.response import response_status_message
from fake_useragent import UserAgent


class RotateUserAgentMiddleware(UserAgentMiddleware):
    """Rotate user agents to avoid detection"""
    
    def __init__(self, user_agent=''):
        self.user_agent = user_agent
        self.ua = UserAgent()
    
    def process_request(self, request, spider):
        ua = self.ua.random
        request.headers['User-Agent'] = ua
        return None


class DelayMiddleware:
    """Add random delays between requests"""
    
    def __init__(self, delay=3, random_delay=0.5):
        self.delay = delay
        self.random_delay = random_delay
    
    def process_request(self, request, spider):
        delay = self.delay + random.uniform(0, self.random_delay)
        time.sleep(delay)
        return None


class CustomRetryMiddleware(RetryMiddleware):
    """Custom retry middleware with exponential backoff"""
    
    def __init__(self, settings):
        super().__init__(settings)
        self.max_retry_times = settings.getint('RETRY_TIMES', 3)
        self.retry_http_codes = settings.getlist('RETRY_HTTP_CODES', [500, 502, 503, 504, 408, 429])
    
    def process_response(self, request, response, spider):
        if request.meta.get('dont_retry', False):
            return response
        
        if response.status in self.retry_http_codes:
            reason = response_status_message(response.status)
            return self._retry(request, reason, spider) or response
        
        return response
    
    def process_exception(self, request, exception, spider):
        if isinstance(exception, self.EXCEPTIONS_TO_RETRY) and not request.meta.get('dont_retry', False):
            return self._retry(request, exception, spider)
