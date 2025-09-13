import { Router, Request, Response } from 'express';
import { referralService } from '../services/ReferralService';
import { Logger } from '../utils/logger';

const router = Router();
const logger = new Logger('ReferralRoutes');

/**
 * GET /api/referral/code
 * Get or create referral code for user
 */
router.get('/code', async (req: Request, res: Response) => {
  try {
    const { address } = req.query;
    
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing or invalid address parameter' 
      });
    }

    const referralCode = await referralService.getOrCreateReferralCode(address);
    
    res.json({
      success: true,
      referralCode
    });
  } catch (error) {
    logger.error('Error getting referral code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get referral code'
    });
  }
});

/**
 * GET /api/referral/data
 * Get referral data for user
 */
router.get('/data', async (req: Request, res: Response) => {
  try {
    const { address } = req.query;
    
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing or invalid address parameter' 
      });
    }

    const referralData = await referralService.getReferralData(address);
    
    if (!referralData) {
      return res.status(404).json({
        success: false,
        error: 'Referral data not found'
      });
    }

    res.json({
      success: true,
      ...referralData
    });
  } catch (error) {
    logger.error('Error getting referral data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get referral data'
    });
  }
});

/**
 * GET /api/referral/stats
 * Get referral statistics for user
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { address } = req.query;
    
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing or invalid address parameter' 
      });
    }

    const referralStats = await referralService.getReferralStats(address);
    
    if (!referralStats) {
      return res.status(404).json({
        success: false,
        error: 'Referral stats not found'
      });
    }

    res.json({
      success: true,
      ...referralStats
    });
  } catch (error) {
    logger.error('Error getting referral stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get referral stats'
    });
  }
});

/**
 * POST /api/referral/redeem
 * Redeem referral code for new user
 */
router.post('/redeem', async (req: Request, res: Response) => {
  try {
    const { referredByCode, userAddress } = req.body;
    
    if (!referredByCode || !userAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: referredByCode, userAddress' 
      });
    }

    const result = await referralService.redeemReferralCode(referredByCode, userAddress);
    
    res.json(result);
  } catch (error) {
    logger.error('Error redeeming referral code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to redeem referral code'
    });
  }
});

/**
 * POST /api/referral/track-deposit
 * Track deposit for referral rewards
 */
router.post('/track-deposit', async (req: Request, res: Response) => {
  try {
    const { userAddress, amount } = req.body;
    
    if (!userAddress || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: userAddress, amount' 
      });
    }

    await referralService.trackDepositForReferral(userAddress, amount);
    
    res.json({
      success: true,
      message: 'Deposit tracked for referral rewards'
    });
  } catch (error) {
    logger.error('Error tracking deposit for referral:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track deposit for referral'
    });
  }
});

/**
 * POST /api/referral/track-yield
 * Track yield earnings for referral rewards
 */
router.post('/track-yield', async (req: Request, res: Response) => {
  try {
    const { userAddress, yieldAmount } = req.body;
    
    if (!userAddress || !yieldAmount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: userAddress, yieldAmount' 
      });
    }

    await referralService.trackYieldForReferral(userAddress, yieldAmount);
    
    res.json({
      success: true,
      message: 'Yield tracked for referral rewards'
    });
  } catch (error) {
    logger.error('Error tracking yield for referral:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track yield for referral'
    });
  }
});

/**
 * GET /api/referral/leaderboard
 * Get referral leaderboard
 */
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    const limitNum = parseInt(limit as string, 10);
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid limit parameter (1-100)' 
      });
    }

    const leaderboard = await referralService.getReferralLeaderboard(limitNum);
    
    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    logger.error('Error getting referral leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get referral leaderboard'
    });
  }
});

/**
 * GET /api/referral/validate
 * Validate referral code
 */
router.get('/validate', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing or invalid code parameter' 
      });
    }

    // Check if referral code exists
    const { createClient } = await import('@supabase/supabase-js');
    const { CONFIG } = await import('../config');
    const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.serviceRoleKey);
    
    const { data, error } = await supabase
      .from('users')
      .select('wallet_address, referral_code')
      .eq('referral_code', code.toLowerCase())
      .single();

    if (error || !data) {
      return res.json({
        success: false,
        valid: false,
        message: 'Invalid referral code'
      });
    }

    res.json({
      success: true,
      valid: true,
      message: 'Valid referral code',
      referrerAddress: data.wallet_address
    });
  } catch (error) {
    logger.error('Error validating referral code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate referral code'
    });
  }
});

export default router;


