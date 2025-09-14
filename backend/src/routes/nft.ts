import express from 'express';
import { DAppPortalService } from '../services/DAppPortalService';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body } from 'express-validator';

const router = express.Router();
const dappPortalService = new DAppPortalService();

/**
 * @route POST /api/nft/deploy-collection
 * @desc Deploy NFT collection contract
 * @access Private
 */
router.post('/deploy-collection', 
  authenticateToken,
  [
    body('name').notEmpty().withMessage('Collection name is required'),
    body('symbol').notEmpty().withMessage('Collection symbol is required'),
    body('baseURI').isURL().withMessage('Valid base URI is required'),
    body('maxSupply').isInt({ min: 1 }).withMessage('Max supply must be a positive integer'),
    body('mintPrice').isFloat({ min: 0 }).withMessage('Mint price must be non-negative'),
    body('royaltyFee').isInt({ min: 0, max: 1000 }).withMessage('Royalty fee must be between 0-1000 (0-100%)'),
    body('owner').isEthereumAddress().withMessage('Valid owner address is required')
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const result = await dappPortalService.deployNFTCollection(req.body);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          data: {
            contractAddress: result.contractAddress,
            transactionHash: result.transactionHash
          },
          message: 'NFT collection deployed successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          message: 'Failed to deploy NFT collection'
        });
      }
    } catch (error: any) {
      console.error('NFT collection deployment error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Internal server error'
      });
    }
  }
);

/**
 * @route POST /api/nft/deploy-marketplace
 * @desc Deploy NFT marketplace contract
 * @access Private
 */
router.post('/deploy-marketplace',
  authenticateToken,
  [
    body('name').notEmpty().withMessage('Marketplace name is required'),
    body('feeRecipient').isEthereumAddress().withMessage('Valid fee recipient address is required'),
    body('platformFee').isInt({ min: 0, max: 1000 }).withMessage('Platform fee must be between 0-1000 (0-100%)'),
    body('royaltyFee').isInt({ min: 0, max: 1000 }).withMessage('Royalty fee must be between 0-1000 (0-100%)')
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const result = await dappPortalService.deployNFTMarketplace(req.body);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          data: {
            contractAddress: result.contractAddress,
            transactionHash: result.transactionHash
          },
          message: 'NFT marketplace deployed successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          message: 'Failed to deploy NFT marketplace'
        });
      }
    } catch (error: any) {
      console.error('NFT marketplace deployment error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Internal server error'
      });
    }
  }
);

/**
 * @route POST /api/nft/create-drop
 * @desc Create NFT drop campaign
 * @access Private
 */
router.post('/create-drop',
  authenticateToken,
  [
    body('collectionId').notEmpty().withMessage('Collection ID is required'),
    body('name').notEmpty().withMessage('Drop name is required'),
    body('description').notEmpty().withMessage('Drop description is required'),
    body('startTime').isISO8601().withMessage('Valid start time is required'),
    body('endTime').isISO8601().withMessage('Valid end time is required'),
    body('maxParticipants').isInt({ min: 1 }).withMessage('Max participants must be a positive integer'),
    body('whitelistRequired').isBoolean().withMessage('Whitelist required must be boolean'),
    body('airdropAmount').isInt({ min: 0 }).withMessage('Airdrop amount must be non-negative'),
    body('presalePrice').isFloat({ min: 0 }).withMessage('Presale price must be non-negative'),
    body('publicPrice').isFloat({ min: 0 }).withMessage('Public price must be non-negative'),
    body('stages').isObject().withMessage('Stages configuration is required')
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const result = await dappPortalService.createNFTDrop(req.body);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          data: {
            dropId: result.dropId
          },
          message: 'NFT drop created successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          message: 'Failed to create NFT drop'
        });
      }
    } catch (error: any) {
      console.error('NFT drop creation error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Internal server error'
      });
    }
  }
);

/**
 * @route POST /api/nft/execute-airdrop
 * @desc Execute airdrop for drop campaign
 * @access Private
 */
router.post('/execute-airdrop',
  authenticateToken,
  [
    body('dropId').notEmpty().withMessage('Drop ID is required'),
    body('recipients').isArray({ min: 1 }).withMessage('Recipients array is required'),
    body('recipients.*.address').isEthereumAddress().withMessage('Valid recipient address is required'),
    body('recipients.*.amount').isInt({ min: 1 }).withMessage('Recipient amount must be positive')
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const result = await dappPortalService.executeAirdrop(req.body.dropId, req.body.recipients);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            airdropId: result.airdropId,
            transactionHashes: result.transactionHashes
          },
          message: 'Airdrop executed successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          message: 'Failed to execute airdrop'
        });
      }
    } catch (error: any) {
      console.error('Airdrop execution error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Internal server error'
      });
    }
  }
);

/**
 * @route POST /api/nft/start-presale
 * @desc Start presale stage for drop campaign
 * @access Private
 */
router.post('/start-presale',
  authenticateToken,
  [
    body('dropId').notEmpty().withMessage('Drop ID is required'),
    body('whitelist').optional().isArray().withMessage('Whitelist must be an array')
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const result = await dappPortalService.startPresale(req.body.dropId, req.body.whitelist || []);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Presale started successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          message: 'Failed to start presale'
        });
      }
    } catch (error: any) {
      console.error('Presale start error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Internal server error'
      });
    }
  }
);

/**
 * @route POST /api/nft/start-public-sale
 * @desc Start public sale stage for drop campaign
 * @access Private
 */
router.post('/start-public-sale',
  authenticateToken,
  [
    body('dropId').notEmpty().withMessage('Drop ID is required')
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const result = await dappPortalService.startPublicSale(req.body.dropId);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Public sale started successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          message: 'Failed to start public sale'
        });
      }
    } catch (error: any) {
      console.error('Public sale start error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Internal server error'
      });
    }
  }
);

/**
 * @route GET /api/nft/notable-collections
 * @desc Get notable NFT collections
 * @access Public
 */
router.get('/notable-collections', async (req: any, res: any) => {
  try {
    const result = await dappPortalService.getNotableCollections();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.collections,
        message: 'Notable collections retrieved successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Failed to retrieve notable collections'
      });
    }
  } catch (error: any) {
    console.error('Notable collections fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

/**
 * @route GET /api/nft/collections
 * @desc Get all NFT collections
 * @access Public
 */
router.get('/collections', async (req: any, res: any) => {
  try {
    const { page = 1, limit = 20, category, sortBy = 'volume' } = req.query;
    
    // Mock data for now - in production, this would query the database
    const collections = [
      {
        id: 'collection_1',
        name: 'LINE Yield Genesis',
        symbol: 'LYG',
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
        totalSupply: 10000,
        floorPrice: '0.5',
        volume24h: '1250.5',
        volume7d: '8750.3',
        volume30d: '32500.8',
        owners: 2500,
        image: '/images/collections/line-yield-genesis.jpg',
        banner: '/images/banners/line-yield-genesis.jpg',
        description: 'The genesis collection of LINE Yield platform',
        verified: true,
        featured: true,
        category: 'Art',
        socialLinks: {
          website: 'https://lineyield.com',
          twitter: '@lineyield',
          discord: 'discord.gg/lineyield'
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z'
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        collections,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: collections.length,
          pages: Math.ceil(collections.length / parseInt(limit))
        }
      },
      message: 'Collections retrieved successfully'
    });
  } catch (error: any) {
    console.error('Collections fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

/**
 * @route GET /api/nft/drops
 * @desc Get NFT drop campaigns
 * @access Public
 */
router.get('/drops', async (req: any, res: any) => {
  try {
    const { status, stage, featured } = req.query;
    
    // Mock data for now - in production, this would query the database
    const drops = [
      {
        id: 'drop_1',
        name: 'LINE Yield Legends',
        description: 'Legendary NFTs with special powers and utilities',
        image: '/images/drops/legends.jpg',
        banner: '/images/banners/legends.jpg',
        nftContract: '0x1234567890abcdef1234567890abcdef12345678',
        startTime: '2024-01-25T00:00:00Z',
        endTime: '2024-02-25T00:00:00Z',
        status: 'presale',
        stage: 'presale',
        maxParticipants: 5000,
        airdropAmount: 500,
        presalePrice: '0.3',
        publicPrice: '0.5',
        whitelistRequired: true,
        totalMinted: 1250,
        totalAirdropped: 500,
        featured: true,
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z'
      }
    ];

    let filteredDrops = drops;

    if (status) {
      filteredDrops = filteredDrops.filter(drop => drop.status === status);
    }

    if (stage) {
      filteredDrops = filteredDrops.filter(drop => drop.stage === stage);
    }

    if (featured === 'true') {
      filteredDrops = filteredDrops.filter(drop => drop.featured);
    }

    res.status(200).json({
      success: true,
      data: filteredDrops,
      message: 'Drops retrieved successfully'
    });
  } catch (error: any) {
    console.error('Drops fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

export default router;