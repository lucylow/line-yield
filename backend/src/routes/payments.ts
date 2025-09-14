import express from 'express';
import { PaymentService } from '../services/PaymentService';
import { supabase } from '../services/supabase';
import { ethers } from 'ethers';

const router = express.Router();
const paymentService = new PaymentService(supabase);

// Initialize payment service
const initializePaymentService = async () => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.KAIA_RPC_URL);
    const yieldTokenAddress = process.env.YIELD_TOKEN_CONTRACT;
    
    if (!yieldTokenAddress) {
      throw new Error('YIELD_TOKEN_CONTRACT environment variable not set');
    }
    
    await paymentService.initialize(provider, yieldTokenAddress);
    console.log('Payment service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize payment service:', error);
  }
};

// Initialize on startup
initializePaymentService();

/**
 * POST /api/payments/crypto
 * Process crypto payment
 */
router.post('/crypto', async (req, res) => {
  try {
    const { userAddress, itemId, amount, currency } = req.body;
    
    if (!userAddress || !itemId || !amount || !currency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userAddress, itemId, amount, currency'
      });
    }

    if (!ethers.utils.isAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }

    const payment = {
      method: 'crypto' as const,
      currency: currency as 'YIELD' | 'KAIA' | 'USDT',
      amount,
      userAddress,
      itemId
    };

    const result = await paymentService.processCryptoPayment(payment);
    
    res.json({
      success: result.success,
      data: {
        transactionId: result.transactionId,
        status: result.status,
        message: result.success ? 'Payment processed successfully' : result.error
      }
    });
  } catch (error) {
    console.error('Crypto payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process crypto payment'
    });
  }
});

/**
 * POST /api/payments/stripe
 * Process Stripe payment
 */
router.post('/stripe', async (req, res) => {
  try {
    const { userEmail, itemId, amount, currency, paymentMethodId } = req.body;
    
    if (!userEmail || !itemId || !amount || !currency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userEmail, itemId, amount, currency'
      });
    }

    const payment = {
      method: 'stripe' as const,
      currency: currency as 'USD' | 'KRW' | 'JPY' | 'TWD' | 'THB',
      amount,
      userEmail,
      itemId,
      paymentMethodId
    };

    const result = await paymentService.processStripePayment(payment);
    
    res.json({
      success: result.success,
      data: {
        paymentIntentId: result.paymentIntentId,
        status: result.status,
        message: result.success ? 'Payment processed successfully' : result.error
      }
    });
  } catch (error) {
    console.error('Stripe payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process Stripe payment'
    });
  }
});

/**
 * POST /api/payments/stripe/customer
 * Create Stripe customer
 */
router.post('/stripe/customer', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const customerId = await paymentService.createStripeCustomer(email, name);
    
    res.json({
      success: true,
      data: {
        customerId,
        message: 'Customer created successfully'
      }
    });
  } catch (error) {
    console.error('Stripe customer creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create Stripe customer'
    });
  }
});

/**
 * GET /api/payments/stripe/customer/:customerId/payment-methods
 * Get customer payment methods
 */
router.get('/stripe/customer/:customerId/payment-methods', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const paymentMethods = await paymentService.getCustomerPaymentMethods(customerId);
    
    res.json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment methods'
    });
  }
});

/**
 * GET /api/payments/inventory/:userId
 * Get user inventory
 */
router.get('/inventory/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const inventory = await paymentService.getUserInventory(userId);
    
    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user inventory'
    });
  }
});

/**
 * GET /api/payments/history/:userId
 * Get payment history
 */
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const history = await paymentService.getPaymentHistory(userId, limit);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment history'
    });
  }
});

/**
 * POST /api/payments/refund
 * Process refund
 */
router.post('/refund', async (req, res) => {
  try {
    const { transactionId, reason } = req.body;
    
    if (!transactionId || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Transaction ID and reason are required'
      });
    }

    const result = await paymentService.processRefund(transactionId, reason);
    
    res.json({
      success: result.success,
      data: {
        transactionId: result.paymentIntentId,
        status: result.status,
        message: result.success ? 'Refund processed successfully' : result.error
      }
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process refund'
    });
  }
});

/**
 * GET /api/payments/stats
 * Get payment statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await paymentService.getPaymentStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment statistics'
    });
  }
});

/**
 * GET /api/payments/currencies
 * Get supported currencies
 */
router.get('/currencies', async (req, res) => {
  try {
    const currencies = paymentService.getSupportedCurrencies();
    
    res.json({
      success: true,
      data: currencies
    });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supported currencies'
    });
  }
});

/**
 * POST /api/payments/validate
 * Validate payment method
 */
router.post('/validate', async (req, res) => {
  try {
    const payment = req.body;
    
    const isValid = await paymentService.validatePaymentMethod(payment);
    
    res.json({
      success: true,
      data: {
        isValid,
        message: isValid ? 'Payment method is valid' : 'Payment method is invalid'
      }
    });
  } catch (error) {
    console.error('Payment validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate payment method'
    });
  }
});

/**
 * POST /api/payments/calculate-fees
 * Calculate payment fees
 */
router.post('/calculate-fees', async (req, res) => {
  try {
    const { amount, currency, paymentMethod } = req.body;
    
    if (!amount || !currency || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Amount, currency, and payment method are required'
      });
    }

    const fees = paymentService.calculateFees(amount, currency, paymentMethod);
    
    res.json({
      success: true,
      data: fees
    });
  } catch (error) {
    console.error('Fee calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate fees'
    });
  }
});

export default router;