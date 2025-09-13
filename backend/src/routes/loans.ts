import { Router, Request, Response } from 'express';
import { loanService } from '../services/LoanService';
import { Logger } from '../utils/logger';
import rateLimit from 'express-rate-limit';
import { CONFIG } from '../config';

const logger = new Logger('LoanRoutes');
const router = Router();

// Rate limiting for loan endpoints
const loanRateLimit = rateLimit({
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
  const { address } = req.params;
  
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid wallet address format'
    });
  }

  next();
};

/**
 * GET /api/loans/types
 * Get all available loan types
 */
router.get('/types', loanRateLimit, async (req: Request, res: Response) => {
  try {
    const loanTypes = await loanService.getAllLoanTypes();
    
    res.json({
      success: true,
      data: loanTypes
    });
  } catch (error) {
    logger.error('Error getting loan types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get loan types'
    });
  }
});

/**
 * GET /api/loans/user/:address
 * Get user's loans
 */
router.get('/user/:address', 
  loanRateLimit, 
  validateUserAddress,
  async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      const loans = await loanService.getUserLoans(address);
      
      res.json({
        success: true,
        data: loans
      });
    } catch (error) {
      logger.error('Error getting user loans:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user loans'
      });
    }
  }
);

/**
 * GET /api/loans/:loanId
 * Get specific loan details
 */
router.get('/:loanId', loanRateLimit, async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;
    const loanIdNum = parseInt(loanId, 10);
    
    if (isNaN(loanIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid loan ID'
      });
    }

    const loan = await loanService.getLoan(loanIdNum);
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Loan not found'
      });
    }

    res.json({
      success: true,
      data: loan
    });
  } catch (error) {
    logger.error('Error getting loan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get loan'
    });
  }
});

/**
 * POST /api/loans/create
 * Create a new loan
 */
router.post('/create', loanRateLimit, async (req: Request, res: Response) => {
  try {
    const { loanTypeId, principalRequested, collateralAmount, borrowerAddress } = req.body;
    
    if (!loanTypeId || !principalRequested || !collateralAmount || !borrowerAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: loanTypeId, principalRequested, collateralAmount, borrowerAddress'
      });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(borrowerAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid borrower address format'
      });
    }

    const result = await loanService.createLoan(
      loanTypeId,
      principalRequested,
      collateralAmount,
      borrowerAddress
    );
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: {
        loanId: result.loanId,
        message: 'Loan created successfully'
      }
    });
  } catch (error) {
    logger.error('Error creating loan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create loan'
    });
  }
});

/**
 * POST /api/loans/:loanId/repay
 * Repay loan
 */
router.post('/:loanId/repay', loanRateLimit, async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;
    const { amount } = req.body;
    
    const loanIdNum = parseInt(loanId, 10);
    if (isNaN(loanIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid loan ID'
      });
    }

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid repayment amount'
      });
    }

    const result = await loanService.repayLoan(loanIdNum, amount);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Loan repaid successfully'
    });
  } catch (error) {
    logger.error('Error repaying loan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to repay loan'
    });
  }
});

/**
 * POST /api/loans/:loanId/add-collateral
 * Add collateral to existing loan
 */
router.post('/:loanId/add-collateral', loanRateLimit, async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;
    const { amount } = req.body;
    
    const loanIdNum = parseInt(loanId, 10);
    if (isNaN(loanIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid loan ID'
      });
    }

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid collateral amount'
      });
    }

    const result = await loanService.addCollateral(loanIdNum, amount);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Collateral added successfully'
    });
  } catch (error) {
    logger.error('Error adding collateral:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add collateral'
    });
  }
});

/**
 * POST /api/loans/:loanId/liquidate
 * Liquidate loan (admin only)
 */
router.post('/:loanId/liquidate', loanRateLimit, async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;
    
    const loanIdNum = parseInt(loanId, 10);
    if (isNaN(loanIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid loan ID'
      });
    }

    const result = await loanService.liquidateLoan(loanIdNum);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Loan liquidated successfully'
    });
  } catch (error) {
    logger.error('Error liquidating loan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to liquidate loan'
    });
  }
});

/**
 * GET /api/loans/user/:address/eligibility/:loanTypeId
 * Check borrower eligibility for specific loan type
 */
router.get('/user/:address/eligibility/:loanTypeId', 
  loanRateLimit, 
  validateUserAddress,
  async (req: Request, res: Response) => {
    try {
      const { address, loanTypeId } = req.params;
      const loanTypeIdNum = parseInt(loanTypeId, 10);
      
      if (isNaN(loanTypeIdNum)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid loan type ID'
        });
      }

      const eligibility = await loanService.checkBorrowerEligibility(address, loanTypeIdNum);
      
      res.json({
        success: true,
        data: eligibility
      });
    } catch (error) {
      logger.error('Error checking borrower eligibility:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check borrower eligibility'
      });
    }
  }
);

/**
 * POST /api/loans/calculate-collateral
 * Calculate required collateral for loan amount
 */
router.post('/calculate-collateral', loanRateLimit, async (req: Request, res: Response) => {
  try {
    const { loanAmount, collateralRatioBps } = req.body;
    
    if (!loanAmount || !collateralRatioBps) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: loanAmount, collateralRatioBps'
      });
    }

    const requiredCollateral = await loanService.calculateRequiredCollateral(loanAmount, collateralRatioBps);
    
    res.json({
      success: true,
      data: {
        loanAmount,
        collateralRatioBps,
        requiredCollateral
      }
    });
  } catch (error) {
    logger.error('Error calculating required collateral:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate required collateral'
    });
  }
});

/**
 * POST /api/loans/kyc-verify
 * Set KYC verification status (admin only)
 */
router.post('/kyc-verify', loanRateLimit, async (req: Request, res: Response) => {
  try {
    const { userAddress, verified } = req.body;
    
    if (!userAddress || typeof verified !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: userAddress, verified'
      });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user address format'
      });
    }

    await loanService.setKYCVerified(userAddress, verified);
    
    res.json({
      success: true,
      message: `KYC verification ${verified ? 'approved' : 'rejected'} for ${userAddress}`
    });
  } catch (error) {
    logger.error('Error setting KYC verification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set KYC verification'
    });
  }
});

/**
 * POST /api/loans/update-prices
 * Update token prices (oracle function)
 */
router.post('/update-prices', loanRateLimit, async (req: Request, res: Response) => {
  try {
    const { prices } = req.body;
    
    if (!prices || typeof prices !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid prices object'
      });
    }

    await loanService.updateTokenPrices(prices);
    
    res.json({
      success: true,
      message: 'Token prices updated successfully'
    });
  } catch (error) {
    logger.error('Error updating token prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update token prices'
    });
  }
});

/**
 * GET /api/loans/health
 * Health check endpoint for loan service
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const isInitialized = loanService.isServiceInitialized();
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        service: 'loans',
        timestamp: new Date().toISOString(),
        initialized: isInitialized,
        contractAddress: isInitialized ? loanService.getContractAddress() : null
      }
    });
  } catch (error) {
    logger.error('Loan health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Loan health check failed'
    });
  }
});

export default router;


