import { Router, Request, Response } from 'express';
import { nftService } from '../services/NFTService';
import { Logger } from '../utils/logger';
import rateLimit from 'express-rate-limit';
import { CONFIG } from '../config';

const logger = new Logger('NFTRoutes');
const router = Router();

// Rate limiting for NFT endpoints
const nftRateLimit = rateLimit({
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
 * GET /api/nft/tiers
 * Get all NFT tiers information
 */
router.get('/tiers', nftRateLimit, async (req: Request, res: Response) => {
  try {
    const tiers = await nftService.getAllTiers();
    
    res.json({
      success: true,
      data: tiers
    });
  } catch (error) {
    logger.error('Error getting NFT tiers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get NFT tiers'
    });
  }
});

/**
 * GET /api/nft/user/:address/collection
 * Get user's NFT collection
 */
router.get('/user/:address/collection', 
  nftRateLimit, 
  validateUserAddress,
  async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      const collection = await nftService.getUserNFTCollection(address);
      
      res.json({
        success: true,
        data: collection
      });
    } catch (error) {
      logger.error('Error getting user NFT collection:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user NFT collection'
      });
    }
  }
);

/**
 * GET /api/nft/user/:address/tier
 * Get user's current tier information
 */
router.get('/user/:address/tier', 
  nftRateLimit, 
  validateUserAddress,
  async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      const tierInfo = await nftService.getUserTierInfo(address);
      
      res.json({
        success: true,
        data: tierInfo
      });
    } catch (error) {
      logger.error('Error getting user tier info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user tier info'
      });
    }
  }
);

/**
 * GET /api/nft/user/:address/points
 * Get user's yield points balance
 */
router.get('/user/:address/points', 
  nftRateLimit, 
  validateUserAddress,
  async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      const points = await nftService.getUserYieldPoints(address);
      
      res.json({
        success: true,
        data: {
          address,
          yieldPoints: points
        }
      });
    } catch (error) {
      logger.error('Error getting user yield points:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user yield points'
      });
    }
  }
);

/**
 * GET /api/nft/user/:address/can-mint
 * Check if user can mint NFT
 */
router.get('/user/:address/can-mint', 
  nftRateLimit, 
  validateUserAddress,
  async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      const canMint = await nftService.canUserMintNFT(address);
      
      res.json({
        success: true,
        data: canMint
      });
    } catch (error) {
      logger.error('Error checking if user can mint NFT:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check mint eligibility'
      });
    }
  }
);

/**
 * GET /api/nft/user/:address/history
 * Get user's yield points history
 */
router.get('/user/:address/history', 
  nftRateLimit, 
  validateUserAddress,
  async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      const { limit = 50 } = req.query;
      
      const history = await nftService.getUserYieldPointsHistory(
        address, 
        parseInt(limit as string)
      );
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      logger.error('Error getting user yield points history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user yield points history'
      });
    }
  }
);

/**
 * POST /api/nft/award-points
 * Award yield points to user (admin only)
 */
router.post('/award-points', nftRateLimit, async (req: Request, res: Response) => {
  try {
    const { userAddress, points, reason } = req.body;
    
    if (!userAddress || !points || points <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid parameters: userAddress, points'
      });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }

    await nftService.awardYieldPoints(userAddress, points, reason || 'admin_reward');
    
    res.json({
      success: true,
      message: `Awarded ${points} yield points to ${userAddress}`,
      data: {
        userAddress,
        points,
        reason: reason || 'admin_reward'
      }
    });
  } catch (error) {
    logger.error('Error awarding yield points:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to award yield points'
    });
  }
});

/**
 * POST /api/nft/batch-award-points
 * Batch award yield points to multiple users (admin only)
 */
router.post('/batch-award-points', nftRateLimit, async (req: Request, res: Response) => {
  try {
    const { users, points, reason } = req.body;
    
    if (!users || !Array.isArray(users) || !points || !Array.isArray(points)) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid parameters: users (array), points (array)'
      });
    }

    if (users.length !== points.length) {
      return res.status(400).json({
        success: false,
        error: 'Users and points arrays must have the same length'
      });
    }

    // Validate all addresses
    for (const address of users) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return res.status(400).json({
          success: false,
          error: `Invalid wallet address format: ${address}`
        });
      }
    }

    await nftService.batchAwardYieldPoints(users, points, reason || 'batch_reward');
    
    res.json({
      success: true,
      message: `Batch awarded yield points to ${users.length} users`,
      data: {
        userCount: users.length,
        reason: reason || 'batch_reward'
      }
    });
  } catch (error) {
    logger.error('Error batch awarding yield points:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to batch award yield points'
    });
  }
});

/**
 * POST /api/nft/mint-reward
 * Prepare NFT mint transaction for user
 */
router.post('/mint-reward', nftRateLimit, async (req: Request, res: Response) => {
  try {
    const { userAddress } = req.body;
    
    if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }

    const mintResult = await nftService.mintNFTReward(userAddress);
    
    if (!mintResult.success) {
      return res.status(400).json({
        success: false,
        error: mintResult.error
      });
    }

    res.json({
      success: true,
      message: 'NFT mint transaction prepared',
      data: {
        userAddress,
        tier: mintResult.tier,
        tierName: mintResult.tierName,
        contractAddress: nftService.getContractAddress(),
        // In a real implementation, you would return the transaction data
        // for the user to sign with their wallet
        transactionData: {
          to: nftService.getContractAddress(),
          data: '0x', // This would be the encoded function call
          value: '0x0'
        }
      }
    });
  } catch (error) {
    logger.error('Error preparing NFT mint transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to prepare NFT mint transaction'
    });
  }
});

/**
 * GET /api/nft/config
 * Get NFT tier configuration
 */
router.get('/config', nftRateLimit, async (req: Request, res: Response) => {
  try {
    const config = nftService.getNFTTierConfig();
    
    res.json({
      success: true,
      data: {
        tiers: config,
        contractAddress: nftService.getContractAddress(),
        isInitialized: nftService.isServiceInitialized()
      }
    });
  } catch (error) {
    logger.error('Error getting NFT config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get NFT config'
    });
  }
});

/**
 * GET /api/nft/health
 * Health check endpoint for NFT service
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const isInitialized = nftService.isServiceInitialized();
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        service: 'nft',
        timestamp: new Date().toISOString(),
        initialized: isInitialized,
        contractAddress: isInitialized ? nftService.getContractAddress() : null
      }
    });
  } catch (error) {
    logger.error('NFT health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'NFT health check failed'
    });
  }
});

export default router;
