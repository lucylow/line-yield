import { Router, Request, Response } from 'express';
import { paymentService } from '../services/PaymentService';
import { Logger } from '../utils/logger';
import rateLimit from 'express-rate-limit';
import { CONFIG } from '../config';

const logger = new Logger('PaymentsRoutes');
const router = Router();

// Rate limiting for payment endpoints
const paymentRateLimit = rateLimit({
  windowMs: CONFIG.security.rateLimitWindowMs,
  max: 10, // Lower limit for payment endpoints
  message: {
    error: 'Too many payment requests from this IP, please try again later.',
    retryAfter: Math.ceil(CONFIG.security.rateLimitWindowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to validate user ID
const validateUserId = (req: Request, res: Response, next: any) => {
  const { userId } = req.params;
  
  if (!userId || !/^[a-zA-Z0-9_-]+$/.test(userId)) {
    return res.status(400).json({
      error: 'Invalid user ID format'
    });
  }

  next();
};

// Middleware to validate payment amount
const validateAmount = (req: Request, res: Response, next: any) => {
  const { amount } = req.body;
  
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      error: 'Invalid amount. Must be a positive number.'
    });
  }

  next();
};

/**
 * POST /payments/stripe/create-intent
 * Create Stripe payment intent
 */
router.post('/stripe/create-intent', 
  paymentRateLimit,
  validateAmount,
  async (req: Request, res: Response) => {
    try {
      const { amount, currency = 'usd', userId, metadata } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          error: 'User ID is required'
        });
      }

      const paymentIntent = await paymentService.createStripePaymentIntent(
        amount,
        currency,
        userId,
        metadata
      );
      
      res.json({
        success: true,
        data: paymentIntent
      });
    } catch (error) {
      logger.error('Error creating Stripe payment intent:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to create payment intent'
      });
    }
  }
);

/**
 * POST /payments/stripe/confirm
 * Confirm Stripe payment
 */
router.post('/stripe/confirm', 
  paymentRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { paymentIntentId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({
          error: 'Payment intent ID is required'
        });
      }

      const payment = await paymentService.confirmStripePayment(paymentIntentId);
      
      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      logger.error('Error confirming Stripe payment:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to confirm payment'
      });
    }
  }
);

/**
 * POST /payments/crypto/create
 * Create crypto payment
 */
router.post('/crypto/create', 
  paymentRateLimit,
  validateAmount,
  async (req: Request, res: Response) => {
    try {
      const { amount, token, recipientAddress, userId, network = 'kaia' } = req.body;
      
      if (!userId || !token || !recipientAddress) {
        return res.status(400).json({
          error: 'User ID, token, and recipient address are required'
        });
      }

      const cryptoPayment = await paymentService.createCryptoPayment(
        amount,
        token,
        recipientAddress,
        userId,
        network
      );
      
      res.json({
        success: true,
        data: cryptoPayment
      });
    } catch (error) {
      logger.error('Error creating crypto payment:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to create crypto payment'
      });
    }
  }
);

/**
 * PUT /payments/crypto/:paymentId
 * Update crypto payment with transaction hash
 */
router.put('/crypto/:paymentId', 
  paymentRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const { txHash, status } = req.body;
      
      if (!txHash || !status) {
        return res.status(400).json({
          error: 'Transaction hash and status are required'
        });
      }

      if (!['confirmed', 'failed'].includes(status)) {
        return res.status(400).json({
          error: 'Status must be either "confirmed" or "failed"'
        });
      }

      const payment = await paymentService.updateCryptoPayment(paymentId, txHash, status);
      
      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      logger.error('Error updating crypto payment:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to update crypto payment'
      });
    }
  }
);

/**
 * GET /payments/history/:userId
 * Get payment history for user
 */
router.get('/history/:userId', 
  paymentRateLimit,
  validateUserId,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;
      
      const history = await paymentService.getPaymentHistory(userId, parseInt(limit as string));
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      logger.error('Error getting payment history:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get payment history'
      });
    }
  }
);

/**
 * GET /payments/:paymentId
 * Get payment by ID
 */
router.get('/:paymentId', 
  paymentRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      
      const payment = await paymentService.getPaymentById(paymentId);
      
      if (!payment) {
        return res.status(404).json({
          error: 'Payment not found'
        });
      }
      
      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      logger.error('Error getting payment:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get payment'
      });
    }
  }
);

/**
 * POST /payments/:paymentId/refund
 * Process refund
 */
router.post('/:paymentId/refund', 
  paymentRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;
      
      const refund = await paymentService.processRefund(paymentId, reason);
      
      res.json({
        success: true,
        data: refund
      });
    } catch (error) {
      logger.error('Error processing refund:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to process refund'
      });
    }
  }
);

/**
 * GET /payments/stats/:userId?
 * Get payment statistics
 */
router.get('/stats/:userId?', 
  paymentRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      const stats = await paymentService.getPaymentStats(userId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting payment stats:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get payment statistics'
      });
    }
  }
);

/**
 * POST /payments/webhooks/stripe
 * Handle Stripe webhooks
 */
router.post('/webhooks/stripe', 
  async (req: Request, res: Response) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      
      if (!signature) {
        return res.status(400).json({
          error: 'Missing Stripe signature'
        });
      }

      const event = paymentService.verifyStripeWebhook(JSON.stringify(req.body), signature);
      
      await paymentService.handleStripeWebhook(event);
      
      res.json({ received: true });
    } catch (error) {
      logger.error('Error handling Stripe webhook:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Webhook handling failed'
      });
    }
  }
);

/**
 * GET /payments/health
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        service: 'payments',
        timestamp: new Date().toISOString(),
        supportedMethods: ['stripe', 'crypto'],
        supportedCurrencies: ['usd', 'usdc', 'kaia-usdt'],
        supportedNetworks: ['kaia', 'ethereum', 'polygon']
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

export default router;


