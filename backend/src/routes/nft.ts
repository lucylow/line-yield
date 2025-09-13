import express from 'express';
import { nftCollateralService, BorrowRequest, RepayRequest, LiquidationRequest } from '../services/nft-collateral-service';
import { Logger } from '../utils/logger';
import { validateAddress } from '../utils/validation';

const router = express.Router();

/**
 * Get user's NFT collateral positions
 * GET /api/nft/positions/:userAddress
 */
router.get('/positions/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;

    if (!validateAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format',
      });
    }

    const positions = await nftCollateralService.getUserPositions(userAddress);

    res.json({
      success: true,
      data: positions,
    });
  } catch (error) {
    Logger.error('Failed to get user positions', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user positions',
    });
  }
});

/**
 * Get specific position details
 * GET /api/nft/position/:positionId
 */
router.get('/position/:positionId', async (req, res) => {
  try {
    const { positionId } = req.params;

    if (!positionId) {
      return res.status(400).json({
        success: false,
        error: 'Position ID is required',
      });
    }

    const position = await nftCollateralService.getPosition(positionId);

    if (!position) {
      return res.status(404).json({
        success: false,
        error: 'Position not found',
      });
    }

    res.json({
      success: true,
      data: position,
    });
  } catch (error) {
    Logger.error('Failed to get position', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get position',
    });
  }
});

/**
 * Get supported NFT collections
 * GET /api/nft/collections
 */
router.get('/collections', async (req, res) => {
  try {
    const collections = await nftCollateralService.getSupportedCollections();

    res.json({
      success: true,
      data: collections,
    });
  } catch (error) {
    Logger.error('Failed to get supported collections', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get supported collections',
    });
  }
});

/**
 * Get user's NFT ownership
 * GET /api/nft/ownership/:userAddress
 */
router.get('/ownership/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;

    if (!validateAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format',
      });
    }

    const nfts = await nftCollateralService.getUserNFTs(userAddress);

    res.json({
      success: true,
      data: nfts,
    });
  } catch (error) {
    Logger.error('Failed to get user NFTs', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user NFTs',
    });
  }
});

/**
 * Get NFT value from oracle
 * GET /api/nft/value/:nftContract/:tokenId
 */
router.get('/value/:nftContract/:tokenId', async (req, res) => {
  try {
    const { nftContract, tokenId } = req.params;

    if (!validateAddress(nftContract)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid NFT contract address',
      });
    }

    const value = await nftCollateralService.getNFTValue(nftContract, tokenId);

    res.json({
      success: true,
      data: {
        nftContract,
        tokenId,
        value,
      },
    });
  } catch (error) {
    Logger.error('Failed to get NFT value', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get NFT value',
    });
  }
});

/**
 * Calculate maximum borrow amount for NFT
 * GET /api/nft/max-borrow/:nftContract/:tokenId
 */
router.get('/max-borrow/:nftContract/:tokenId', async (req, res) => {
  try {
    const { nftContract, tokenId } = req.params;

    if (!validateAddress(nftContract)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid NFT contract address',
      });
    }

    const maxBorrow = await nftCollateralService.calculateMaxBorrow(nftContract, tokenId);

    res.json({
      success: true,
      data: {
        nftContract,
        tokenId,
        maxBorrow,
      },
    });
  } catch (error) {
    Logger.error('Failed to calculate max borrow', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate max borrow',
    });
  }
});

/**
 * Check if position is liquidatable
 * GET /api/nft/liquidatable/:positionId
 */
router.get('/liquidatable/:positionId', async (req, res) => {
  try {
    const { positionId } = req.params;

    if (!positionId) {
      return res.status(400).json({
        success: false,
        error: 'Position ID is required',
      });
    }

    const liquidatable = await nftCollateralService.isPositionLiquidatable(positionId);

    res.json({
      success: true,
      data: {
        positionId,
        liquidatable,
      },
    });
  } catch (error) {
    Logger.error('Failed to check liquidation status', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check liquidation status',
    });
  }
});

/**
 * Get vault statistics
 * GET /api/nft/vault-stats
 */
router.get('/vault-stats', async (req, res) => {
  try {
    const stats = await nftCollateralService.getVaultStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    Logger.error('Failed to get vault stats', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get vault stats',
    });
  }
});

/**
 * Get liquidation parameters
 * GET /api/nft/liquidation-params
 */
router.get('/liquidation-params', async (req, res) => {
  try {
    const params = await nftCollateralService.getLiquidationParameters();

    res.json({
      success: true,
      data: params,
    });
  } catch (error) {
    Logger.error('Failed to get liquidation parameters', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get liquidation parameters',
    });
  }
});

/**
 * Calculate liquidation amount
 * POST /api/nft/calculate-liquidation
 */
router.post('/calculate-liquidation', async (req, res) => {
  try {
    const { collateralValue, totalDebt } = req.body;

    if (!collateralValue || !totalDebt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: collateralValue, totalDebt',
      });
    }

    const liquidationAmount = await nftCollateralService.calculateLiquidationAmount(
      collateralValue,
      totalDebt
    );

    res.json({
      success: true,
      data: {
        collateralValue,
        totalDebt,
        liquidationAmount,
      },
    });
  } catch (error) {
    Logger.error('Failed to calculate liquidation amount', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate liquidation amount',
    });
  }
});

/**
 * Update NFT price (admin only)
 * POST /api/nft/update-price
 */
router.post('/update-price', async (req, res) => {
  try {
    const { nftContract, tokenId, price } = req.body;

    if (!nftContract || !tokenId || !price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: nftContract, tokenId, price',
      });
    }

    if (!validateAddress(nftContract)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid NFT contract address',
      });
    }

    await nftCollateralService.updateNFTPrice(nftContract, tokenId, price);

    res.json({
      success: true,
      message: 'NFT price updated successfully',
    });
  } catch (error) {
    Logger.error('Failed to update NFT price', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update NFT price',
    });
  }
});

/**
 * Update collection floor price (admin only)
 * POST /api/nft/update-floor-price
 */
router.post('/update-floor-price', async (req, res) => {
  try {
    const { nftContract, floorPrice } = req.body;

    if (!nftContract || !floorPrice) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: nftContract, floorPrice',
      });
    }

    if (!validateAddress(nftContract)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid NFT contract address',
      });
    }

    await nftCollateralService.updateFloorPrice(nftContract, floorPrice);

    res.json({
      success: true,
      message: 'Floor price updated successfully',
    });
  } catch (error) {
    Logger.error('Failed to update floor price', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update floor price',
    });
  }
});

/**
 * Add NFT collection (admin only)
 * POST /api/nft/add-collection
 */
router.post('/add-collection', async (req, res) => {
  try {
    const { nftContract, maxLTV, liquidationThreshold, interestRate } = req.body;

    if (!nftContract || maxLTV === undefined || liquidationThreshold === undefined || interestRate === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: nftContract, maxLTV, liquidationThreshold, interestRate',
      });
    }

    if (!validateAddress(nftContract)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid NFT contract address',
      });
    }

    if (maxLTV > 10000 || liquidationThreshold > 10000 || interestRate > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Parameters cannot exceed 10000 basis points',
      });
    }

    await nftCollateralService.addCollection(nftContract, maxLTV, liquidationThreshold, interestRate);

    res.json({
      success: true,
      message: 'NFT collection added successfully',
    });
  } catch (error) {
    Logger.error('Failed to add collection', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add collection',
    });
  }
});

/**
 * Mock borrow transaction (for testing)
 * POST /api/nft/mock-borrow
 */
router.post('/mock-borrow', async (req, res) => {
  try {
    const { nftContract, tokenId, borrowAmount, userAddress } = req.body;

    if (!nftContract || !tokenId || !borrowAmount || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: nftContract, tokenId, borrowAmount, userAddress',
      });
    }

    if (!validateAddress(nftContract) || !validateAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format',
      });
    }

    // Mock position creation
    const positionId = `mock-${Date.now()}`;
    const mockPosition = {
      positionId,
      owner: userAddress,
      nftContract,
      tokenId,
      collateralValue: (parseFloat(borrowAmount) * 1.5).toString(), // Mock 150% collateral
      loanAmount: borrowAmount,
      interestAccrued: '0',
      lastInterestUpdate: Date.now(),
      createdAt: Date.now(),
      active: true,
      liquidated: false,
    };

    res.json({
      success: true,
      message: 'Mock borrow transaction created',
      data: mockPosition,
    });
  } catch (error) {
    Logger.error('Failed to create mock borrow', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create mock borrow',
    });
  }
});

/**
 * Mock repay transaction (for testing)
 * POST /api/nft/mock-repay
 */
router.post('/mock-repay', async (req, res) => {
  try {
    const { positionId, repayAmount, userAddress } = req.body;

    if (!positionId || !repayAmount || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: positionId, repayAmount, userAddress',
      });
    }

    if (!validateAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format',
      });
    }

    res.json({
      success: true,
      message: 'Mock repay transaction processed',
      data: {
        positionId,
        repayAmount,
        userAddress,
        repaidAt: Date.now(),
      },
    });
  } catch (error) {
    Logger.error('Failed to process mock repay', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process mock repay',
    });
  }
});

export default router;