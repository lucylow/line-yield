import { Router, Request, Response } from 'express';
import { creditScoreService } from '../services/CreditScoreService';
import { Logger } from '../utils/logger';
import rateLimit from 'express-rate-limit';
import { CONFIG } from '../config';

const logger = new Logger('CreditRoutes');
const router = Router();

// Rate limiting for credit endpoints
const creditRateLimit = rateLimit({
  windowMs: CONFIG.security.rateLimitWindowMs,
  max: CONFIG.security.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(CONFIG.security.rateLimitWindowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to validate user address
const validateUserAddress = (req: Request, res: Response, next: any) => {
  const { userAddress } = req.params;
  
  if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
    return res.status(400).json({
      error: 'Invalid user address format'
    });
  }

  next();
};

// Middleware to validate loan amount
const validateLoanAmount = (req: Request, res: Response, next: any) => {
  const { amount } = req.body;
  
  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    return res.status(400).json({
      error: 'Invalid loan amount. Must be a positive number.'
    });
  }

  next();
};

/**
 * POST /credit/profile/:userAddress
 * Create credit profile for user
 */
router.post('/profile/:userAddress', 
  creditRateLimit,
  validateUserAddress,
  async (req: Request, res: Response) => {
    try {
      const { userAddress } = req.params;
      
      await creditScoreService.createCreditProfile(userAddress);
      
      res.json({
        success: true,
        data: {
          message: 'Credit profile created successfully',
          userAddress
        }
      });
    } catch (error) {
      logger.error('Error creating credit profile:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to create credit profile'
      });
    }
  }
);

/**
 * GET /credit/profile/:userAddress
 * Get user's credit profile
 */
router.get('/profile/:userAddress', 
  creditRateLimit,
  validateUserAddress,
  async (req: Request, res: Response) => {
    try {
      const { userAddress } = req.params;
      
      const profile = await creditScoreService.getCreditProfile(userAddress);
      const tier = creditScoreService.getCreditScoreTier(profile.score);
      const color = creditScoreService.getCreditScoreColor(profile.score);
      
      res.json({
        success: true,
        data: {
          ...profile,
          tier,
          color
        }
      });
    } catch (error) {
      logger.error('Error getting credit profile:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get credit profile'
      });
    }
  }
);

/**
 * GET /credit/score/:userAddress
 * Get user's credit score
 */
router.get('/score/:userAddress', 
  creditRateLimit,
  validateUserAddress,
  async (req: Request, res: Response) => {
    try {
      const { userAddress } = req.params;
      
      const score = await creditScoreService.getCreditScore(userAddress);
      const tier = creditScoreService.getCreditScoreTier(score);
      const color = creditScoreService.getCreditScoreColor(score);
      
      res.json({
        success: true,
        data: {
          score,
          tier,
          color
        }
      });
    } catch (error) {
      logger.error('Error getting credit score:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get credit score'
      });
    }
  }
);

/**
 * GET /credit/interest-rate/:userAddress
 * Calculate interest rate for user
 */
router.get('/interest-rate/:userAddress', 
  creditRateLimit,
  validateUserAddress,
  async (req: Request, res: Response) => {
    try {
      const { userAddress } = req.params;
      
      const rate = await creditScoreService.calculateInterestRate(userAddress);
      
      res.json({
        success: true,
        data: {
          interestRate: rate,
          interestRatePercent: (rate / 100).toFixed(2)
        }
      });
    } catch (error) {
      logger.error('Error calculating interest rate:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to calculate interest rate'
      });
    }
  }
);

/**
 * POST /credit/eligibility/:userAddress
 * Check loan eligibility
 */
router.post('/eligibility/:userAddress', 
  creditRateLimit,
  validateUserAddress,
  validateLoanAmount,
  async (req: Request, res: Response) => {
    try {
      const { userAddress } = req.params;
      const { amount } = req.body;
      
      const eligible = await creditScoreService.isEligibleForLoan(userAddress, amount);
      const profile = await creditScoreService.getCreditProfile(userAddress);
      const recommendedAmount = creditScoreService.getRecommendedLoanAmount(profile.score, profile.totalRepaid);
      
      res.json({
        success: true,
        data: {
          eligible,
          requestedAmount: amount,
          recommendedAmount,
          creditScore: profile.score,
          tier: creditScoreService.getCreditScoreTier(profile.score)
        }
      });
    } catch (error) {
      logger.error('Error checking loan eligibility:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to check loan eligibility'
      });
    }
  }
);

/**
 * POST /credit/loan
 * Create a new loan
 */
router.post('/loan', 
  creditRateLimit,
  validateLoanAmount,
  async (req: Request, res: Response) => {
    try {
      const { userId, amount, duration, purpose, collateralAmount, collateralToken } = req.body;
      
      if (!userId || !duration || !purpose) {
        return res.status(400).json({
          error: 'Missing required fields: userId, duration, purpose'
        });
      }

      if (duration <= 0) {
        return res.status(400).json({
          error: 'Duration must be greater than 0'
        });
      }

      const loanApplication = {
        userId,
        amount,
        duration,
        purpose,
        collateralAmount,
        collateralToken
      };

      const loanId = await creditScoreService.createLoan(loanApplication);
      
      res.json({
        success: true,
        data: {
          loanId,
          message: 'Loan created successfully'
        }
      });
    } catch (error) {
      logger.error('Error creating loan:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to create loan'
      });
    }
  }
);

/**
 * POST /credit/repayment/:loanId
 * Record loan repayment
 */
router.post('/repayment/:loanId', 
  creditRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { loanId } = req.params;
      const { amount } = req.body;
      
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({
          error: 'Invalid repayment amount'
        });
      }

      await creditScoreService.recordRepayment(parseInt(loanId), amount);
      
      res.json({
        success: true,
        data: {
          message: 'Repayment recorded successfully',
          loanId: parseInt(loanId),
          amount
        }
      });
    } catch (error) {
      logger.error('Error recording repayment:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to record repayment'
      });
    }
  }
);

/**
 * POST /credit/default/:loanId
 * Record loan default
 */
router.post('/default/:loanId', 
  creditRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { loanId } = req.params;
      
      await creditScoreService.recordDefault(parseInt(loanId));
      
      res.json({
        success: true,
        data: {
          message: 'Default recorded successfully',
          loanId: parseInt(loanId)
        }
      });
    } catch (error) {
      logger.error('Error recording default:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to record default'
      });
    }
  }
);

/**
 * GET /credit/loans/:userAddress
 * Get user's loan history
 */
router.get('/loans/:userAddress', 
  creditRateLimit,
  validateUserAddress,
  async (req: Request, res: Response) => {
    try {
      const { userAddress } = req.params;
      
      const loans = await creditScoreService.getUserLoans(userAddress);
      
      res.json({
        success: true,
        data: loans
      });
    } catch (error) {
      logger.error('Error getting user loans:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get user loans'
      });
    }
  }
);

/**
 * GET /credit/loan/:loanId
 * Get loan details
 */
router.get('/loan/:loanId', 
  creditRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { loanId } = req.params;
      
      if (isNaN(parseInt(loanId))) {
        return res.status(400).json({
          error: 'Invalid loan ID'
        });
      }

      const loan = await creditScoreService.getLoan(parseInt(loanId));
      
      res.json({
        success: true,
        data: loan
      });
    } catch (error) {
      logger.error('Error getting loan:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get loan details'
      });
    }
  }
);

/**
 * GET /credit/events/:userAddress
 * Get credit events for user
 */
router.get('/events/:userAddress', 
  creditRateLimit,
  validateUserAddress,
  async (req: Request, res: Response) => {
    try {
      const { userAddress } = req.params;
      const { limit = 50 } = req.query;
      
      const events = await creditScoreService.getCreditEvents(userAddress, parseInt(limit as string));
      
      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      logger.error('Error getting credit events:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get credit events'
      });
    }
  }
);

/**
 * GET /credit/statistics
 * Get loan statistics
 */
router.get('/statistics', 
  creditRateLimit,
  async (req: Request, res: Response) => {
    try {
      const statistics = await creditScoreService.getLoanStatistics();
      
      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Error getting loan statistics:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get loan statistics'
      });
    }
  }
);

/**
 * PUT /credit/score/:userAddress
 * Update credit score manually (admin only)
 */
router.put('/score/:userAddress', 
  creditRateLimit,
  validateUserAddress,
  async (req: Request, res: Response) => {
    try {
      const { userAddress } = req.params;
      const { score, reason } = req.body;
      
      if (!score || isNaN(parseInt(score)) || parseInt(score) < 0 || parseInt(score) > 1000) {
        return res.status(400).json({
          error: 'Invalid score. Must be between 0 and 1000.'
        });
      }

      if (!reason) {
        return res.status(400).json({
          error: 'Reason is required for score update'
        });
      }

      await creditScoreService.updateScore(userAddress, parseInt(score), reason);
      
      res.json({
        success: true,
        data: {
          message: 'Credit score updated successfully',
          userAddress,
          newScore: parseInt(score),
          reason
        }
      });
    } catch (error) {
      logger.error('Error updating credit score:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to update credit score'
      });
    }
  }
);

/**
 * POST /credit/decay/:userAddress
 * Apply score decay for inactive user
 */
router.post('/decay/:userAddress', 
  creditRateLimit,
  validateUserAddress,
  async (req: Request, res: Response) => {
    try {
      const { userAddress } = req.params;
      
      await creditScoreService.applyScoreDecay(userAddress);
      
      res.json({
        success: true,
        data: {
          message: 'Score decay applied successfully',
          userAddress
        }
      });
    } catch (error) {
      logger.error('Error applying score decay:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to apply score decay'
      });
    }
  }
);

/**
 * GET /credit/health
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        service: 'credit-scoring',
        timestamp: new Date().toISOString(),
        features: {
          creditProfiles: true,
          loanManagement: true,
          scoreCalculation: true,
          eventLogging: true,
          statistics: true
        }
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


