import { Router, Request, Response } from 'express';
import { rewardsService } from '../services/RewardsService';
import { Logger } from '../utils/logger';
import rateLimit from 'express-rate-limit';
import { CONFIG } from '../config';

const logger = new Logger('RewardsRoutes');
const router = Router();

// Rate limiting for rewards endpoints
const rewardsRateLimit = rateLimit({
  windowMs: CONFIG.security.rateLimitWindowMs,
  max: CONFIG.security.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
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

/**
 * POST /rewards/signup-bonus/:userId
 * Award signup bonus to new user
 */
router.post('/signup-bonus/:userId', 
  rewardsRateLimit, 
  validateUserId,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      const reward = await rewardsService.awardSignupBonus(userId);
      
      res.json({
        success: true,
        data: {
          reward,
          message: `Welcome bonus of ${reward.points} points credited!`
        }
      });
    } catch (error) {
      logger.error('Error awarding signup bonus:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to award signup bonus'
      });
    }
  }
);

/**
 * POST /rewards/loyalty/:userId
 * Award loyalty points for user activity
 */
router.post('/loyalty/:userId', 
  rewardsRateLimit, 
  validateUserId,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { activity, metadata } = req.body;
      
      if (!activity || !['daily_login', 'transaction', 'milestone'].includes(activity)) {
        return res.status(400).json({
          error: 'Invalid activity type. Must be: daily_login, transaction, or milestone'
        });
      }

      const reward = await rewardsService.awardLoyaltyPoints(userId, activity, metadata);
      
      res.json({
        success: true,
        data: {
          reward,
          message: `Loyalty reward of ${reward.points} points credited!`
        }
      });
    } catch (error) {
      logger.error('Error awarding loyalty points:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to award loyalty points'
      });
    }
  }
);

/**
 * POST /rewards/kaia/:userId
 * Award KAIA-specific rewards
 */
router.post('/kaia/:userId', 
  rewardsRateLimit, 
  validateUserId,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { rewardType, metadata } = req.body;
      
      if (!rewardType || !['first_deposit', 'yield_milestone', 'long_term_holder'].includes(rewardType)) {
        return res.status(400).json({
          error: 'Invalid reward type. Must be: first_deposit, yield_milestone, or long_term_holder'
        });
      }

      const reward = await rewardsService.awardKaiaReward(userId, rewardType, metadata);
      
      res.json({
        success: true,
        data: {
          reward,
          message: `KAIA reward of ${reward.points} points credited!`
        }
      });
    } catch (error) {
      logger.error('Error awarding KAIA reward:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to award KAIA reward'
      });
    }
  }
);

/**
 * POST /rewards/draw/:userId
 * Perform item draw for user
 */
router.post('/draw/:userId', 
  rewardsRateLimit, 
  validateUserId,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { drawType = 'common' } = req.body;
      
      if (!['common', 'premium'].includes(drawType)) {
        return res.status(400).json({
          error: 'Invalid draw type. Must be: common or premium'
        });
      }

      const result = await rewardsService.performItemDraw(userId, drawType);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error performing item draw:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to perform item draw'
      });
    }
  }
);

/**
 * GET /rewards/points/:userId
 * Get user's current points and level
 */
router.get('/points/:userId', 
  rewardsRateLimit, 
  validateUserId,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      const userPoints = await rewardsService.getUserPoints(userId);
      
      res.json({
        success: true,
        data: userPoints
      });
    } catch (error) {
      logger.error('Error getting user points:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get user points'
      });
    }
  }
);

/**
 * GET /rewards/history/:userId
 * Get user's reward history
 */
router.get('/history/:userId', 
  rewardsRateLimit, 
  validateUserId,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;
      
      const history = await rewardsService.getUserRewardHistory(userId, parseInt(limit as string));
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      logger.error('Error getting reward history:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get reward history'
      });
    }
  }
);

/**
 * GET /rewards/draw-history/:userId
 * Get user's draw history
 */
router.get('/draw-history/:userId', 
  rewardsRateLimit, 
  validateUserId,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit = 20 } = req.query;
      
      const history = await rewardsService.getUserDrawHistory(userId, parseInt(limit as string));
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      logger.error('Error getting draw history:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get draw history'
      });
    }
  }
);

/**
 * GET /rewards/leaderboard
 * Get points leaderboard
 */
router.get('/leaderboard', 
  rewardsRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { limit = 100 } = req.query;
      
      // This would be implemented with a proper leaderboard query
      // For now, returning a placeholder response
      res.json({
        success: true,
        data: {
          message: 'Leaderboard feature coming soon',
          limit: parseInt(limit as string)
        }
      });
    } catch (error) {
      logger.error('Error getting leaderboard:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get leaderboard'
      });
    }
  }
);

/**
 * GET /rewards/health
 * Health check endpoint for rewards service
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        service: 'rewards',
        timestamp: new Date().toISOString(),
        config: {
          signupBonus: 1000,
          dailyLogin: 50,
          drawCosts: {
            common: 500,
            premium: 1000
          }
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


