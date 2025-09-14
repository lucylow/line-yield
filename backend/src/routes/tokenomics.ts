import express from 'express';
import { TokenomicsService } from '../services/TokenomicsService';
import { supabase } from '../services/supabase';
import { ethers } from 'ethers';

const router = express.Router();
const tokenomicsService = new TokenomicsService(supabase);

// Initialize tokenomics service
const initializeTokenomics = async () => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.KAIA_RPC_URL);
    const contractAddress = process.env.YIELD_TOKEN_CONTRACT;
    
    if (!contractAddress) {
      throw new Error('YIELD_TOKEN_CONTRACT environment variable not set');
    }
    
    await tokenomicsService.initialize(provider, contractAddress);
    console.log('Tokenomics service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize tokenomics service:', error);
  }
};

// Initialize on startup
initializeTokenomics();

/**
 * GET /api/tokenomics/info
 * Get comprehensive tokenomics information
 */
router.get('/info', async (req, res) => {
  try {
    const tokenomicsInfo = await tokenomicsService.getTokenomicsInfo();
    res.json({
      success: true,
      data: tokenomicsInfo
    });
  } catch (error) {
    console.error('Error fetching tokenomics info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tokenomics information'
    });
  }
});

/**
 * GET /api/tokenomics/distribution
 * Get token distribution breakdown
 */
router.get('/distribution', async (req, res) => {
  try {
    const distribution = await tokenomicsService.getTokenDistribution();
    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('Error fetching token distribution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch token distribution'
    });
  }
});

/**
 * GET /api/tokenomics/price
 * Get token price and market data
 */
router.get('/price', async (req, res) => {
  try {
    const priceData = await tokenomicsService.getTokenPriceData();
    res.json({
      success: true,
      data: priceData
    });
  } catch (error) {
    console.error('Error fetching token price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch token price data'
    });
  }
});

/**
 * GET /api/tokenomics/utility
 * Get token utility and use cases
 */
router.get('/utility', async (req, res) => {
  try {
    const utility = tokenomicsService.getTokenUtility();
    res.json({
      success: true,
      data: utility
    });
  } catch (error) {
    console.error('Error fetching token utility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch token utility information'
    });
  }
});

/**
 * GET /api/tokenomics/staking/:address
 * Get user staking information
 */
router.get('/staking/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }

    const stakingInfo = await tokenomicsService.getUserStakingInfo(address);
    res.json({
      success: true,
      data: stakingInfo
    });
  } catch (error) {
    console.error('Error fetching staking info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch staking information'
    });
  }
});

/**
 * POST /api/tokenomics/stake
 * Stake tokens
 */
router.post('/stake', async (req, res) => {
  try {
    const { userAddress, amount } = req.body;
    
    if (!userAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: 'User address and amount are required'
      });
    }

    if (!ethers.utils.isAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }

    const transactionHash = await tokenomicsService.stakeTokens(userAddress, amount);
    
    res.json({
      success: true,
      data: {
        transactionHash,
        message: 'Staking transaction submitted successfully'
      }
    });
  } catch (error) {
    console.error('Error staking tokens:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stake tokens'
    });
  }
});

/**
 * POST /api/tokenomics/unstake
 * Unstake tokens
 */
router.post('/unstake', async (req, res) => {
  try {
    const { userAddress, amount } = req.body;
    
    if (!userAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: 'User address and amount are required'
      });
    }

    if (!ethers.utils.isAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }

    const transactionHash = await tokenomicsService.unstakeTokens(userAddress, amount);
    
    res.json({
      success: true,
      data: {
        transactionHash,
        message: 'Unstaking transaction submitted successfully'
      }
    });
  } catch (error) {
    console.error('Error unstaking tokens:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unstake tokens'
    });
  }
});

/**
 * POST /api/tokenomics/claim-rewards
 * Claim staking rewards
 */
router.post('/claim-rewards', async (req, res) => {
  try {
    const { userAddress } = req.body;
    
    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: 'User address is required'
      });
    }

    if (!ethers.utils.isAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }

    const transactionHash = await tokenomicsService.claimRewards(userAddress);
    
    res.json({
      success: true,
      data: {
        transactionHash,
        message: 'Rewards claimed successfully'
      }
    });
  } catch (error) {
    console.error('Error claiming rewards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to claim rewards'
    });
  }
});

/**
 * GET /api/tokenomics/leaderboard
 * Get staking leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const leaderboard = await tokenomicsService.getStakingLeaderboard(limit);
    
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch staking leaderboard'
    });
  }
});

/**
 * GET /api/tokenomics/governance/proposals
 * Get governance proposals
 */
router.get('/governance/proposals', async (req, res) => {
  try {
    const proposals = await tokenomicsService.getGovernanceProposals();
    res.json({
      success: true,
      data: proposals
    });
  } catch (error) {
    console.error('Error fetching governance proposals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch governance proposals'
    });
  }
});

/**
 * POST /api/tokenomics/governance/proposals
 * Create a new governance proposal
 */
router.post('/governance/proposals', async (req, res) => {
  try {
    const { proposer, title, description, duration } = req.body;
    
    if (!proposer || !title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Proposer, title, and description are required'
      });
    }

    if (!ethers.utils.isAddress(proposer)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid proposer address'
      });
    }

    const proposalId = await tokenomicsService.createProposal(proposer, title, description, duration);
    
    res.json({
      success: true,
      data: {
        proposalId,
        message: 'Proposal created successfully'
      }
    });
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create governance proposal'
    });
  }
});

/**
 * POST /api/tokenomics/governance/vote
 * Vote on a governance proposal
 */
router.post('/governance/vote', async (req, res) => {
  try {
    const { proposalId, voter, support, votingPower } = req.body;
    
    if (!proposalId || !voter || typeof support !== 'boolean' || !votingPower) {
      return res.status(400).json({
        success: false,
        error: 'Proposal ID, voter, support, and voting power are required'
      });
    }

    if (!ethers.utils.isAddress(voter)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid voter address'
      });
    }

    await tokenomicsService.voteOnProposal(proposalId, voter, support, votingPower);
    
    res.json({
      success: true,
      data: {
        message: 'Vote submitted successfully'
      }
    });
  } catch (error) {
    console.error('Error voting on proposal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit vote'
    });
  }
});

/**
 * GET /api/tokenomics/rewards/:address
 * Calculate pending rewards for a user
 */
router.get('/rewards/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }

    const pendingRewards = await tokenomicsService.calculatePendingRewards(address);
    
    res.json({
      success: true,
      data: {
        pendingRewards
      }
    });
  } catch (error) {
    console.error('Error calculating rewards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate pending rewards'
    });
  }
});

export default router;

