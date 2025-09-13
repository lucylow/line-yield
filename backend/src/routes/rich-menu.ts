import { Router, Request, Response } from 'express';
import { RichMenuService, RichMenuTemplate } from '../services/rich-menu-service';
import { Logger } from '../utils/logger';
import multer from 'multer';

const router = Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * POST /api/rich-menu/create
 * Create a new Rich Menu with configuration
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { channelAccessToken, template } = req.body;

    if (!channelAccessToken) {
      return res.status(400).json({
        success: false,
        error: 'Channel Access Token is required'
      });
    }

    if (!template || !template.name || !template.miniDappUrl) {
      return res.status(400).json({
        success: false,
        error: 'Rich Menu template with name and miniDappUrl is required'
      });
    }

    // Set default Dapp Portal URL if not provided
    const richMenuTemplate: RichMenuTemplate = {
      name: template.name,
      chatBarText: template.chatBarText || 'Open Menu',
      miniDappUrl: template.miniDappUrl,
      socialChannel1Url: template.socialChannel1Url || 'https://yourprojectwebsite.com',
      socialChannel2Url: template.socialChannel2Url || 'https://twitter.com/yourproject',
      dappPortalUrl: template.dappPortalUrl || 'https://liff.line.me/2006533014-8gD06D64'
    };

    const richMenuService = new RichMenuService(channelAccessToken);
    const result = await richMenuService.createRichMenu(richMenuTemplate);

    if (result.success) {
      Logger.info('Rich Menu created successfully', { richMenuId: result.richMenuId });
      res.json({
        success: true,
        richMenuId: result.richMenuId,
        message: 'Rich Menu created successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to create Rich Menu'
      });
    }

  } catch (error) {
    Logger.error('Rich Menu creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during Rich Menu creation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/rich-menu/upload/:richMenuId
 * Upload image for a Rich Menu
 */
router.post('/upload/:richMenuId', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { channelAccessToken } = req.body;
    const { richMenuId } = req.params;
    const file = req.file;

    if (!channelAccessToken) {
      return res.status(400).json({
        success: false,
        error: 'Channel Access Token is required'
      });
    }

    if (!richMenuId) {
      return res.status(400).json({
        success: false,
        error: 'Rich Menu ID is required'
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'Image file is required'
      });
    }

    const richMenuService = new RichMenuService(channelAccessToken);
    const result = await richMenuService.uploadRichMenuImage(
      richMenuId,
      file.buffer,
      file.mimetype
    );

    if (result.success) {
      Logger.info('Rich Menu image uploaded successfully', { richMenuId });
      res.json({
        success: true,
        richMenuId,
        message: 'Rich Menu image uploaded successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to upload Rich Menu image'
      });
    }

  } catch (error) {
    Logger.error('Rich Menu image upload failed:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during image upload',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/rich-menu/setup-complete
 * Complete Rich Menu setup (create, upload image, set as default)
 */
router.post('/setup-complete', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { channelAccessToken, template } = req.body;
    const file = req.file;

    if (!channelAccessToken) {
      return res.status(400).json({
        success: false,
        error: 'Channel Access Token is required'
      });
    }

    if (!template || !template.name || !template.miniDappUrl) {
      return res.status(400).json({
        success: false,
        error: 'Rich Menu template with name and miniDappUrl is required'
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'Image file is required'
      });
    }

    // Set default Dapp Portal URL if not provided
    const richMenuTemplate: RichMenuTemplate = {
      name: template.name,
      chatBarText: template.chatBarText || 'Open Menu',
      miniDappUrl: template.miniDappUrl,
      socialChannel1Url: template.socialChannel1Url || 'https://yourprojectwebsite.com',
      socialChannel2Url: template.socialChannel2Url || 'https://twitter.com/yourproject',
      dappPortalUrl: template.dappPortalUrl || 'https://liff.line.me/2006533014-8gD06D64'
    };

    const richMenuService = new RichMenuService(channelAccessToken);
    const result = await richMenuService.setupCompleteRichMenu(
      richMenuTemplate,
      file.buffer,
      file.mimetype
    );

    if (result.success) {
      Logger.info('Complete Rich Menu setup finished successfully', { richMenuId: result.richMenuId });
      res.json({
        success: true,
        richMenuId: result.richMenuId,
        message: 'Rich Menu setup completed successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to setup Rich Menu'
      });
    }

  } catch (error) {
    Logger.error('Complete Rich Menu setup failed:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during Rich Menu setup',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/rich-menu/list
 * Get all Rich Menus
 */
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { channelAccessToken } = req.query;

    if (!channelAccessToken) {
      return res.status(400).json({
        success: false,
        error: 'Channel Access Token is required'
      });
    }

    const richMenuService = new RichMenuService(channelAccessToken as string);
    const result = await richMenuService.getRichMenus();

    if (result.success) {
      res.json({
        success: true,
        richMenus: result.richMenus,
        count: result.richMenus?.length || 0
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to fetch Rich Menus'
      });
    }

  } catch (error) {
    Logger.error('Rich Menu list fetch failed:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during Rich Menu list fetch',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/rich-menu/set-default/:richMenuId
 * Set a Rich Menu as default
 */
router.post('/set-default/:richMenuId', async (req: Request, res: Response) => {
  try {
    const { channelAccessToken } = req.body;
    const { richMenuId } = req.params;

    if (!channelAccessToken) {
      return res.status(400).json({
        success: false,
        error: 'Channel Access Token is required'
      });
    }

    if (!richMenuId) {
      return res.status(400).json({
        success: false,
        error: 'Rich Menu ID is required'
      });
    }

    const richMenuService = new RichMenuService(channelAccessToken);
    const result = await richMenuService.setDefaultRichMenu(richMenuId);

    if (result.success) {
      Logger.info('Rich Menu set as default successfully', { richMenuId });
      res.json({
        success: true,
        richMenuId,
        message: 'Rich Menu set as default successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to set Rich Menu as default'
      });
    }

  } catch (error) {
    Logger.error('Rich Menu set default failed:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during Rich Menu set default',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/rich-menu/:richMenuId
 * Delete a Rich Menu
 */
router.delete('/:richMenuId', async (req: Request, res: Response) => {
  try {
    const { channelAccessToken } = req.body;
    const { richMenuId } = req.params;

    if (!channelAccessToken) {
      return res.status(400).json({
        success: false,
        error: 'Channel Access Token is required'
      });
    }

    if (!richMenuId) {
      return res.status(400).json({
        success: false,
        error: 'Rich Menu ID is required'
      });
    }

    const richMenuService = new RichMenuService(channelAccessToken);
    const result = await richMenuService.deleteRichMenu(richMenuId);

    if (result.success) {
      Logger.info('Rich Menu deleted successfully', { richMenuId });
      res.json({
        success: true,
        richMenuId,
        message: 'Rich Menu deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to delete Rich Menu'
      });
    }

  } catch (error) {
    Logger.error('Rich Menu deletion failed:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during Rich Menu deletion',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/rich-menu/template
 * Get Rich Menu template configuration
 */
router.get('/template', (req: Request, res: Response) => {
  const template = {
    name: 'LINE Yield Rich Menu',
    chatBarText: 'Open Menu',
    miniDappUrl: 'https://liff.line.me/YOUR_LIFF_ID',
    socialChannel1Url: 'https://yourprojectwebsite.com',
    socialChannel2Url: 'https://twitter.com/yourproject',
    dappPortalUrl: 'https://liff.line.me/2006533014-8gD06D64',
    imageSpecs: {
      dimensions: '2500x1686 pixels',
      format: 'JPEG or PNG',
      maxSize: '10MB',
      areas: {
        A: { position: 'Top-left', size: '1250x843', purpose: 'Mini Dapp' },
        B: { position: 'Top-center', size: '625x843', purpose: 'Social Channel 1' },
        C: { position: 'Top-right', size: '625x843', purpose: 'Social Channel 2' },
        D: { position: 'Bottom', size: '2500x843', purpose: 'Dapp Portal (required)' }
      }
    },
    requirements: [
      'Image must be exactly 2500x1686 pixels',
      'Area D must link to https://liff.line.me/2006533014-8gD06D64',
      'All areas must have valid URLs',
      'Image should include Mini Dapp Icon + Portal Wordmark in Area D'
    ]
  };

  res.json({
    success: true,
    template,
    message: 'Rich Menu template configuration'
  });
});

export default router;


