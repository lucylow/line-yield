import { Request, Response, NextFunction } from 'express';
import { LocalizationService, SupportedLanguage, LanguageDetectionMethod } from '../services/localization-service';
import { Logger } from '../utils/logger';

// Extend Express Request interface to include language
declare global {
  namespace Express {
    interface Request {
      language?: SupportedLanguage;
      t?: (key: string) => string;
    }
  }
}

export interface LocalizationMiddlewareOptions {
  defaultLanguage?: SupportedLanguage;
  detectionMethod?: LanguageDetectionMethod;
  enableIPDetection?: boolean;
  enableBrowserDetection?: boolean;
  enableManualOverride?: boolean;
}

export const localizationMiddleware = (options: LocalizationMiddlewareOptions = {}) => {
  const {
    defaultLanguage = 'en',
    detectionMethod = 'browser',
    enableIPDetection = true,
    enableBrowserDetection = true,
    enableManualOverride = true,
  } = options;

  const localizationService = LocalizationService.getInstance();

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let detectedLanguage: SupportedLanguage = defaultLanguage;

      // Manual override from query parameter or header
      if (enableManualOverride) {
        const manualLang = req.query.lang as string || req.headers['x-language'] as string;
        if (manualLang && ['en', 'ja'].includes(manualLang)) {
          detectedLanguage = manualLang as SupportedLanguage;
          Logger.info(`Language manually set to: ${detectedLanguage}`);
        }
      }

      // Auto-detection if no manual override
      if (detectedLanguage === defaultLanguage) {
        const acceptLanguage = req.headers['accept-language'] as string;
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

        if (detectionMethod === 'ip' && enableIPDetection) {
          detectedLanguage = await localizationService.detectLanguage(acceptLanguage, clientIP, 'ip');
          Logger.info(`Language detected from IP: ${detectedLanguage}`);
        } else if (enableBrowserDetection) {
          detectedLanguage = await localizationService.detectLanguage(acceptLanguage, clientIP, 'browser');
          Logger.info(`Language detected from browser: ${detectedLanguage}`);
        }
      }

      // Set language in request
      req.language = detectedLanguage;
      localizationService.setLanguage(detectedLanguage);
      req.t = (key: string) => localizationService.translate(key);

      // Add language info to response headers
      res.setHeader('X-Language', detectedLanguage);
      res.setHeader('X-Language-Detection-Method', detectionMethod);

      next();
    } catch (error) {
      Logger.error('Localization middleware error:', error);
      // Fallback to default language
      req.language = defaultLanguage;
      localizationService.setLanguage(defaultLanguage);
      req.t = (key: string) => localizationService.translate(key);
      next();
    }
  };
};

// Helper function to get client IP
export const getClientIP = (req: Request): string => {
  return (
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

// Helper function to get accept language header
export const getAcceptLanguage = (req: Request): string => {
  return req.headers['accept-language'] as string || '';
};

// Helper function to parse accept language header
export const parseAcceptLanguage = (acceptLanguage: string): string[] => {
  return acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].trim())
    .filter(lang => lang.length > 0);
};

export default localizationMiddleware;