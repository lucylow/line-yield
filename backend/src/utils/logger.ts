import winston from 'winston';
import { CONFIG } from '../config';

// Create logger instance
const logger = winston.createLogger({
  level: CONFIG.nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'line-yield-backend' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// If we're not in production, log to the console as well
if (CONFIG.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export class Logger {
  static info(message: string, meta?: any): void {
    logger.info(message, meta);
  }

  static warn(message: string, meta?: any): void {
    logger.warn(message, meta);
  }

  static error(message: string, error?: any): void {
    logger.error(message, error);
  }

  static debug(message: string, meta?: any): void {
    logger.debug(message, meta);
  }

  static http(message: string, meta?: any): void {
    logger.http(message, meta);
  }

  // Structured logging methods
  static logTransaction(txHash: string, method: string, gasUsed: string, status: 'success' | 'failed'): void {
    logger.info('Transaction executed', {
      txHash,
      method,
      gasUsed,
      status,
      timestamp: new Date().toISOString()
    });
  }

  static logYieldUpdate(strategy: string, apy: number, tvl: number): void {
    logger.info('Yield data updated', {
      strategy,
      apy,
      tvl,
      timestamp: new Date().toISOString()
    });
  }

  static logRebalance(fromStrategy: string, toStrategy: string, amount: number, txHash?: string): void {
    logger.info('Rebalance executed', {
      fromStrategy,
      toStrategy,
      amount,
      txHash,
      timestamp: new Date().toISOString()
    });
  }

  static logGaslessTransaction(user: string, method: string, txHash: string, gasUsed: string): void {
    logger.info('Gasless transaction executed', {
      user,
      method,
      txHash,
      gasUsed,
      timestamp: new Date().toISOString()
    });
  }

  static logError(error: Error, context?: string): void {
    logger.error('Application error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  static logPerformance(operation: string, duration: number, meta?: any): void {
    logger.info('Performance metric', {
      operation,
      duration,
      ...meta,
      timestamp: new Date().toISOString()
    });
  }

  // Health check logging
  static logHealthCheck(service: string, status: 'healthy' | 'unhealthy', details?: any): void {
    logger.info('Health check', {
      service,
      status,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Security logging
  static logSecurityEvent(event: string, details: any): void {
    logger.warn('Security event', {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Rate limiting logging
  static logRateLimit(ip: string, endpoint: string, limit: number): void {
    logger.warn('Rate limit exceeded', {
      ip,
      endpoint,
      limit,
      timestamp: new Date().toISOString()
    });
  }
}
