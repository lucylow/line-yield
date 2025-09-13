import { Router, Request, Response } from 'express';
import { LineVerificationService, VerificationResult } from '../services/line-verification-service';
import { Logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/line/verify
 * Verify LINE setup with provided credentials
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { channelAccessToken, channelId, providerId } = req.body;

    // Validate required parameters
    if (!channelAccessToken || !channelId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: channelAccessToken and channelId are required'
      });
    }

    // Validate configuration
    const validation = LineVerificationService.validateConfiguration(
      channelAccessToken,
      channelId,
      providerId
    );

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid configuration parameters',
        details: validation.errors
      });
    }

    // Initialize verification service
    const verificationService = new LineVerificationService(
      channelAccessToken,
      channelId,
      providerId
    );

    // Perform verification
    const result: VerificationResult = await verificationService.verifyCompleteSetup();
    const recommendations = verificationService.getSetupRecommendations(result);

    Logger.info('LINE verification completed', {
      overallStatus: result.overallStatus,
      messagingApiActive: result.messagingApiChannel.active,
      liffAppsCount: result.liffApps.count
    });

    res.json({
      success: true,
      result,
      recommendations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.error('LINE verification failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error during verification',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/line/verify/messaging-api
 * Verify only Messaging API Channel
 */
router.get('/verify/messaging-api', async (req: Request, res: Response) => {
  try {
    const { channelAccessToken, channelId } = req.query;

    if (!channelAccessToken || !channelId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameters: channelAccessToken and channelId'
      });
    }

    const verificationService = new LineVerificationService(
      channelAccessToken as string,
      channelId as string
    );

    const result = await verificationService.verifyMessagingApiChannel();

    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.error('Messaging API verification failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to verify Messaging API Channel',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/line/verify/liff-apps
 * Verify only LIFF Apps
 */
router.get('/verify/liff-apps', async (req: Request, res: Response) => {
  try {
    const { channelAccessToken, channelId } = req.query;

    if (!channelAccessToken || !channelId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameters: channelAccessToken and channelId'
      });
    }

    const verificationService = new LineVerificationService(
      channelAccessToken as string,
      channelId as string
    );

    const result = await verificationService.verifyLiffApps();

    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.error('LIFF Apps verification failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to verify LIFF Apps',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/line/verify/status
 * Get verification status with environment variables
 */
router.get('/verify/status', async (req: Request, res: Response) => {
  try {
    // Get configuration from environment variables
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const channelId = process.env.LINE_CHANNEL_ID;
    const providerId = process.env.LINE_PROVIDER_ID;

    if (!channelAccessToken || !channelId) {
      return res.status(400).json({
        success: false,
        error: 'LINE configuration not found in environment variables',
        required: ['LINE_CHANNEL_ACCESS_TOKEN', 'LINE_CHANNEL_ID'],
        optional: ['LINE_PROVIDER_ID']
      });
    }

    const verificationService = new LineVerificationService(
      channelAccessToken,
      channelId,
      providerId
    );

    const result: VerificationResult = await verificationService.verifyCompleteSetup();
    const recommendations = verificationService.getSetupRecommendations(result);

    res.json({
      success: true,
      result,
      recommendations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.error('LINE status check failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to check LINE status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/line/verify/health
 * Simple health check for LINE verification service
 */
router.get('/verify/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'LINE Verification Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/line/verify - Full verification with custom credentials',
      'GET /api/line/verify/messaging-api - Verify Messaging API only',
      'GET /api/line/verify/liff-apps - Verify LIFF Apps only',
      'GET /api/line/verify/status - Check status with env variables',
      'GET /api/line/verify/health - Service health check'
    ]
  });
});

export default router;


