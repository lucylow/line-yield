import express from 'express';
import { qrPaymentService, CreatePaymentRequest } from '../services/qr-payment-service';
import { Logger } from '../utils/logger';
import { validateAddress } from '../utils/validation';

const router = express.Router();

/**
 * Create a new QR payment session
 * POST /api/qr-payment/create
 */
router.post('/create', async (req, res) => {
  try {
    const {
      amount,
      token = 'USDT',
      userAddress,
      vaultAddress,
      description,
      reference,
      expiresInMinutes,
    } = req.body;

    // Validation
    if (!amount || !userAddress || !vaultAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, userAddress, vaultAddress',
      });
    }

    if (!validateAddress(userAddress) || !validateAddress(vaultAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format',
      });
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
      });
    }

    const request: CreatePaymentRequest = {
      amount: parseFloat(amount).toString(),
      token,
      userAddress,
      vaultAddress,
      description,
      reference,
      expiresInMinutes,
    };

    const session = await qrPaymentService.createPaymentSession(request);

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        qrCodeData: session.qrCodeData,
        amount: session.amount,
        token: session.token,
        expiresAt: session.expiresAt,
        status: session.status,
      },
    });
  } catch (error) {
    Logger.error('Failed to create QR payment session', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment session',
    });
  }
});

/**
 * Get payment session status
 * GET /api/qr-payment/status/:sessionId
 */
router.get('/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
      });
    }

    const status = await qrPaymentService.getPaymentStatus(sessionId);

    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Payment session not found',
      });
    }

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    Logger.error('Failed to get payment status', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment status',
    });
  }
});

/**
 * Confirm payment (webhook endpoint)
 * POST /api/qr-payment/confirm
 */
router.post('/confirm', async (req, res) => {
  try {
    const { sessionId, transactionHash, payerAddress } = req.body;

    if (!sessionId || !transactionHash || !payerAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, transactionHash, payerAddress',
      });
    }

    if (!validateAddress(payerAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payer address format',
      });
    }

    const confirmed = await qrPaymentService.confirmPayment(
      sessionId,
      transactionHash,
      payerAddress
    );

    if (!confirmed) {
      return res.status(400).json({
        success: false,
        error: 'Failed to confirm payment',
      });
    }

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
    });
  } catch (error) {
    Logger.error('Failed to confirm payment', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment',
    });
  }
});

/**
 * Cancel payment session
 * POST /api/qr-payment/cancel
 */
router.post('/cancel', async (req, res) => {
  try {
    const { sessionId, userAddress } = req.body;

    if (!sessionId || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, userAddress',
      });
    }

    if (!validateAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user address format',
      });
    }

    const cancelled = await qrPaymentService.cancelPayment(sessionId, userAddress);

    if (!cancelled) {
      return res.status(400).json({
        success: false,
        error: 'Failed to cancel payment',
      });
    }

    res.json({
      success: true,
      message: 'Payment cancelled successfully',
    });
  } catch (error) {
    Logger.error('Failed to cancel payment', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel payment',
    });
  }
});

/**
 * Get user's payment sessions
 * GET /api/qr-payment/sessions/:userAddress
 */
router.get('/sessions/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;

    if (!validateAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format',
      });
    }

    const sessions = await qrPaymentService.getUserSessions(userAddress);

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    Logger.error('Failed to get user sessions', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user sessions',
    });
  }
});

/**
 * Get QR payment service statistics
 * GET /api/qr-payment/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = qrPaymentService.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    Logger.error('Failed to get QR payment stats', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
    });
  }
});

/**
 * Mock payment confirmation endpoint for testing
 * POST /api/qr-payment/mock-confirm
 */
router.post('/mock-confirm', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
      });
    }

    // Mock transaction hash and payer address for testing
    const mockTransactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const mockPayerAddress = '0x742d35Cc6634C0532925a3b8D0C4C4C4C4C4C4C4';

    const confirmed = await qrPaymentService.confirmPayment(
      sessionId,
      mockTransactionHash,
      mockPayerAddress
    );

    if (!confirmed) {
      return res.status(400).json({
        success: false,
        error: 'Failed to confirm payment',
      });
    }

    res.json({
      success: true,
      message: 'Payment confirmed successfully (mock)',
      data: {
        transactionHash: mockTransactionHash,
        payerAddress: mockPayerAddress,
      },
    });
  } catch (error) {
    Logger.error('Failed to mock confirm payment', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment',
    });
  }
});

export default router;



