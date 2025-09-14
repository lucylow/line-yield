import express from 'express';
import { CONFIG } from '../config';
import { Logger } from '../utils/logger';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
// import rateLimit from 'express-rate-limit'; // Commented out - package not installed
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { localizationMiddleware } from '../middleware/localization-middleware';

// Import route modules
import rewardsRoutes from '../routes/rewards';
import referralRoutes from '../routes/referral';
import nftRoutes from '../routes/nft';
import loanRoutes from '../routes/loans';
import lineVerificationRoutes from '../routes/line-verification';
import richMenuRoutes from '../routes/rich-menu';
import secureRoutes from '../routes/secure';
import qrPaymentRoutes from '../routes/qr-payment';
import paymentRoutes from '../routes/payments';
import kaiaPaymentRoutes from '../routes/kaia-payments';
import marketplaceRoutes from '../routes/marketplace';

export class ApiServer {
  private app: express.Application;
  private isRunning: boolean = false;
  private rateLimiter: RateLimiterMemory;

  constructor() {
    this.app = express();
    
    // Rate limiting: 100 requests per minute per IP
    this.rateLimiter = new RateLimiterMemory({
      keyPrefix: 'api_server',
      points: 100,
      duration: 60,
    });
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: [
        'http://localhost:3000',
        'http://localhost:5173', // Vite dev server
        'https://liff.line.me', // LINE LIFF
        'https://liff-frontend.line.me', // LINE LIFF frontend
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Compression and logging
    this.app.use(compression());
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Global rate limiting middleware
    this.app.use(this.rateLimitMiddleware.bind(this));

    // Localization middleware
    this.app.use(localizationMiddleware({
      defaultLanguage: 'en',
      detectionMethod: 'browser',
      enableIPDetection: true,
      enableBrowserDetection: true,
      enableManualOverride: true,
    }));

    // Request logging
    this.app.use((req, res, next) => {
      Logger.info(`${req.method} ${req.path} - ${req.ip} - Language: ${req.language || 'en'}`);
      next();
    });
  }

  private async rateLimitMiddleware(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    try {
      await this.rateLimiter.consume(req.ip || 'unknown');
      next();
    } catch (rejRes: any) {
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      res.set('Retry-After', String(secs));
      res.status(429).json({
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: secs
      });
    }
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        data: {
          status: 'healthy',
          service: 'line-yield-api',
          timestamp: new Date().toISOString(),
          version: process.env['npm_package_version'] || '1.0.0',
          environment: CONFIG.nodeEnv,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        }
      });
    });

    // API routes
    this.app.use('/api/rewards', rewardsRoutes);
    this.app.use('/api/referral', referralRoutes);
    this.app.use('/api/nft', nftRoutes);
    this.app.use('/api/loans', loanRoutes);
    this.app.use('/api/line', lineVerificationRoutes);
    this.app.use('/api/rich-menu', richMenuRoutes);
    this.app.use('/api/secure', secureRoutes);
    this.app.use('/api/qr-payment', qrPaymentRoutes);
    this.app.use('/api/payments', paymentRoutes);
    this.app.use('/api/kaia-payments', kaiaPaymentRoutes);
    this.app.use('/api/marketplace', marketplaceRoutes);

    // API documentation endpoint
    this.app.get('/api', (req, res) => {
      const t = req.t || ((key: string) => key);
      res.json({
        success: true,
        data: {
          name: 'LINE Yield API',
          version: '1.0.0',
          description: t('api.welcome'),
          language: req.language || 'en',
          endpoints: {
            rewards: '/api/rewards',
            referral: '/api/referral',
            nft: '/api/nft',
            loans: '/api/loans',
            line: '/api/line',
            richMenu: '/api/rich-menu',
            secure: '/api/secure',
            qrPayment: '/api/qr-payment',
            marketplace: '/api/marketplace',
          },
          documentation: 'https://docs.line-yield.com/api',
          support: 'https://support.line-yield.com',
        }
      });
    });

    // 404 handler for API routes
    this.app.use('/api/*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        path: req.path,
        method: req.method,
        availableEndpoints: [
          '/api/rewards',
          '/api/referral',
          '/api/nft',
          '/api/loans',
          '/api/line',
          '/api/rich-menu',
          '/api/secure',
          '/api/qr-payment',
          '/api/marketplace',
        ]
      });
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        data: {
          message: 'Welcome to LINE Yield API',
          version: '1.0.0',
          status: 'operational',
          timestamp: new Date().toISOString(),
          endpoints: {
            health: '/health',
            api: '/api',
            rewards: '/api/rewards',
            referral: '/api/referral',
            line: '/api/line',
            richMenu: '/api/rich-menu',
            secure: '/api/secure',
            qrPayment: '/api/qr-payment',
          }
        }
      });
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      Logger.error('Unhandled error in API server:', error);
      
      // Don't leak error details in production
      const isDevelopment = CONFIG.nodeEnv === 'development';
      
      res.status(500).json({
        success: false,
        error: isDevelopment ? error.message : 'Internal server error',
        ...(isDevelopment && { stack: error.stack }),
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      Logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      Logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      Logger.warn('API server is already running');
      return;
    }

    const port = CONFIG.server?.port || 3001;
    const host = CONFIG.server?.host || '0.0.0.0';

    return new Promise((resolve, reject) => {
      try {
        this.app.listen(port, host, () => {
          this.isRunning = true;
          Logger.info(`API server started on http://${host}:${port}`);
          Logger.info(`Health check: http://${host}:${port}/health`);
          Logger.info(`API documentation: http://${host}:${port}/api`);
          resolve();
        });
      } catch (error) {
        Logger.error('Failed to start API server:', error);
        reject(error);
      }
    });
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      Logger.warn('API server is not running');
      return;
    }

    this.isRunning = false;
    Logger.info('API server stopped');
  }

  public getApp(): express.Application {
    return this.app;
  }

  public isServerRunning(): boolean {
    return this.isRunning;
  }
}
