import axios, { AxiosResponse } from 'axios';
import { Logger } from '../utils/logger';

export interface LineChannelInfo {
  bot: {
    id: string;
    name: string;
    pictureUrl: string;
    description: string;
  };
  channelId: string;
  providerId: string;
}

export interface LiffApp {
  liffId: string;
  view: {
    type: string;
    url: string;
  };
  description: string;
  features: {
    ble: boolean;
    qrCode: boolean;
  };
  permanentLinkPattern: string;
  scope: string[];
  botPrompt: string;
}

export interface LiffAppsResponse {
  apps: LiffApp[];
}

export interface RichMenuInfo {
  richMenuId: string;
  name: string;
  chatBarText: string;
  size: {
    width: number;
    height: number;
  };
  areas: Array<{
    bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    action: {
      type: string;
      label: string;
      uri: string;
    };
  }>;
  selected: boolean;
  imageUrl?: string;
}

export interface OfficialAccountInfo {
  botId: string;
  isActive: boolean;
  canSendMessages: boolean;
  webhookUrl?: string;
  webhookActive: boolean;
  richMenu?: {
    exists: boolean;
    configured: boolean;
    info?: RichMenuInfo;
    error?: string;
  };
}

export interface VerificationResult {
  success: boolean;
  messagingApiChannel: {
    exists: boolean;
    active: boolean;
    info?: LineChannelInfo;
    error?: string;
  };
  liffApps: {
    exists: boolean;
    count: number;
    apps: LiffApp[];
    error?: string;
  };
  officialAccount: {
    exists: boolean;
    active: boolean;
    info?: OfficialAccountInfo;
    error?: string;
    friendPromptConfigured: boolean;
  };
  overallStatus: 'healthy' | 'warning' | 'error';
  timestamp: string;
}

export class LineVerificationService {
  private readonly messagingApiEndpoint = 'https://api.line.me/v2/bot/info';
  private readonly liffApiEndpoint = 'https://api.line.me/liff/v1/apps';
  private readonly richMenuEndpoint = 'https://api.line.me/v2/bot/richmenu';

  private readonly providerId?: string;

  constructor(
    private readonly channelAccessToken: string,
    private readonly channelId: string,
    providerId?: string
  ) {
    if (!channelAccessToken) {
      throw new Error('Channel Access Token is required');
    }
    if (!channelId) {
      throw new Error('Channel ID is required');
    }
    
    // Store provider ID for potential future use in verification
    this.providerId = providerId;
    
    // Log provider ID if available for debugging
    if (this.providerId) {
      Logger.debug(`Provider ID: ${this.providerId}`);
    }
  }

  /**
   * Verify Messaging API Channel setup and status
   */
  async verifyMessagingApiChannel(): Promise<{
    exists: boolean;
    active: boolean;
    info?: LineChannelInfo;
    error?: string;
  }> {
    try {
      Logger.info('Verifying Messaging API Channel...');
      
      const response: AxiosResponse<LineChannelInfo> = await axios.get(
        this.messagingApiEndpoint,
        {
          headers: {
            Authorization: `Bearer ${this.channelAccessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const channelInfo = response.data;
      
      if (channelInfo && channelInfo.bot && channelInfo.bot.id) {
        Logger.info(`Messaging API Channel verified successfully. Bot ID: ${channelInfo.bot.id}`);
        return {
          exists: true,
          active: true,
          info: channelInfo
        };
      } else {
        Logger.warn('Messaging API Channel response is missing required bot information');
        return {
          exists: false,
          active: false,
          error: 'Channel response missing bot information'
        };
      }
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      Logger.error('Failed to verify Messaging API Channel:', errorMessage);
      
      return {
        exists: false,
        active: false,
        error: errorMessage
      };
    }
  }

  /**
   * Verify Official Account setup and friend prompt configuration
   */
  async verifyOfficialAccount(): Promise<{
    exists: boolean;
    active: boolean;
    info?: OfficialAccountInfo;
    error?: string;
    friendPromptConfigured: boolean;
  }> {
    try {
      Logger.info('Verifying Official Account setup...');
      
      // Get bot info which includes Official Account status
      const response: AxiosResponse<LineChannelInfo> = await axios.get(
        this.messagingApiEndpoint,
        {
          headers: {
            Authorization: `Bearer ${this.channelAccessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const channelInfo = response.data;
      
      if (channelInfo && channelInfo.bot && channelInfo.bot.id) {
        // Check if we can send messages (indicates OA is properly linked)
        const canSendMessages = await this.checkMessagingCapability();
        
        // Check Rich Menu configuration
        const richMenuResult = await this.verifyRichMenu();
        
        Logger.info(`Official Account verified. Bot ID: ${channelInfo.bot.id}`);
        
        return {
          exists: true,
          active: true,
          info: {
            botId: channelInfo.bot.id,
            isActive: true,
            canSendMessages,
            webhookActive: canSendMessages, // If we can send messages, webhook is likely active
            richMenu: richMenuResult
          },
          friendPromptConfigured: true // This would need manual verification
        };
      } else {
        Logger.warn('Official Account response is missing required bot information');
        return {
          exists: false,
          active: false,
          friendPromptConfigured: false,
          error: 'Channel response missing bot information'
        };
      }
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      Logger.error('Failed to verify Official Account:', errorMessage);
      
      return {
        exists: false,
        active: false,
        friendPromptConfigured: false,
        error: errorMessage
      };
    }
  }

  /**
   * Check if we can send messages to verify OA messaging capability
   */
  private async checkMessagingCapability(): Promise<boolean> {
    try {
      // Try to get bot info as a proxy for messaging capability
      await axios.get(this.messagingApiEndpoint, {
        headers: {
          Authorization: `Bearer ${this.channelAccessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify Rich Menu configuration
   */
  async verifyRichMenu(): Promise<{
    exists: boolean;
    configured: boolean;
    info?: RichMenuInfo;
    error?: string;
  }> {
    try {
      Logger.info('Verifying Rich Menu configuration...');
      
      // Get list of rich menus
      const response = await axios.get(this.richMenuEndpoint, {
        headers: {
          Authorization: `Bearer ${this.channelAccessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const richMenus = response.data.richmenus;
      
      if (!richMenus || richMenus.length === 0) {
        return {
          exists: false,
          configured: false,
          error: 'No rich menus found'
        };
      }

      // Find the default/active rich menu
      const activeRichMenu = richMenus.find((menu: any) => menu.selected) || richMenus[0];
      
      if (!activeRichMenu) {
        return {
          exists: false,
          configured: false,
          error: 'No active rich menu found'
        };
      }

      // Validate rich menu configuration
      const isValidConfiguration = this.validateRichMenuConfiguration(activeRichMenu);
      
      Logger.info(`Rich Menu verified. ID: ${activeRichMenu.richMenuId}, Valid: ${isValidConfiguration}`);
      
      return {
        exists: true,
        configured: isValidConfiguration,
        info: activeRichMenu
      };
      
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      Logger.error('Failed to verify Rich Menu:', errorMessage);
      
      return {
        exists: false,
        configured: false,
        error: errorMessage
      };
    }
  }

  /**
   * Validate Rich Menu configuration according to Kaia Wave guidelines
   */
  private validateRichMenuConfiguration(richMenu: any): boolean {
    try {
      // Check if rich menu has the required structure
      if (!richMenu.areas || !Array.isArray(richMenu.areas) || richMenu.areas.length < 4) {
        return false;
      }

      // Check if size is correct (2500x1686)
      if (richMenu.size?.width !== 2500 || richMenu.size?.height !== 1686) {
        return false;
      }

      // Check if areas are properly configured
      const areas = richMenu.areas;
      
      // Area A: Mini Dapp (top-left, 1250x843)
      const areaA = areas[0];
      if (!areaA || !this.isValidArea(areaA, 0, 0, 1250, 843)) {
        return false;
      }

      // Area B: Social Channel 1 (top-center, 625x843)
      const areaB = areas[1];
      if (!areaB || !this.isValidArea(areaB, 1250, 0, 625, 843)) {
        return false;
      }

      // Area C: Social Channel 2 (top-right, 625x843)
      const areaC = areas[2];
      if (!areaC || !this.isValidArea(areaC, 1875, 0, 625, 843)) {
        return false;
      }

      // Area D: Dapp Portal (bottom, full width, 2500x843)
      const areaD = areas[3];
      if (!areaD || !this.isValidArea(areaD, 0, 843, 2500, 843)) {
        return false;
      }

      // Check if Area D has the correct Dapp Portal URL
      const dappPortalUrl = 'https://liff.line.me/2006533014-8gD06D64';
      if (areaD.action?.uri !== dappPortalUrl) {
        Logger.warn(`Area D URI mismatch. Expected: ${dappPortalUrl}, Got: ${areaD.action?.uri}`);
        return false;
      }

      return true;
    } catch (error) {
      Logger.error('Error validating Rich Menu configuration:', error);
      return false;
    }
  }

  /**
   * Check if an area has the correct bounds and action
   */
  private isValidArea(area: any, expectedX: number, expectedY: number, expectedWidth: number, expectedHeight: number): boolean {
    const bounds = area.bounds;
    const action = area.action;
    
    return bounds &&
           bounds.x === expectedX &&
           bounds.y === expectedY &&
           bounds.width === expectedWidth &&
           bounds.height === expectedHeight &&
           action &&
           action.type === 'uri' &&
           action.uri &&
           action.uri.startsWith('http');
  }

  /**
   * Verify LIFF Apps setup and list published apps
   */
  async verifyLiffApps(): Promise<{
    exists: boolean;
    count: number;
    apps: LiffApp[];
    error?: string;
  }> {
    try {
      Logger.info('Verifying LIFF Apps...');
      
      const response: AxiosResponse<LiffAppsResponse> = await axios.get(
        `${this.liffApiEndpoint}?channelId=${this.channelId}`,
        {
          headers: {
            Authorization: `Bearer ${this.channelAccessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const liffApps = response.data;
      
      if (liffApps && liffApps.apps && Array.isArray(liffApps.apps)) {
        const publishedApps = liffApps.apps.filter(app => 
          app.view && app.view.url && app.liffId
        );
        
        Logger.info(`Found ${publishedApps.length} published LIFF apps`);
        
        return {
          exists: publishedApps.length > 0,
          count: publishedApps.length,
          apps: publishedApps
        };
      } else {
        Logger.warn('LIFF Apps response is missing or invalid');
        return {
          exists: false,
          count: 0,
          apps: [],
          error: 'Invalid LIFF apps response'
        };
      }
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      Logger.error('Failed to verify LIFF Apps:', errorMessage);
      
      return {
        exists: false,
        count: 0,
        apps: [],
        error: errorMessage
      };
    }
  }

  /**
   * Perform comprehensive verification of LINE setup
   */
  async verifyCompleteSetup(): Promise<VerificationResult> {
    Logger.info('Starting comprehensive LINE setup verification...');
    
    const [messagingResult, liffResult, oaResult] = await Promise.all([
      this.verifyMessagingApiChannel(),
      this.verifyLiffApps(),
      this.verifyOfficialAccount()
    ]);

    // Determine overall status
    let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy';
    
    if (!messagingResult.exists || !messagingResult.active) {
      overallStatus = 'error';
    } else if (!liffResult.exists || liffResult.count === 0 || !oaResult.exists || !oaResult.active) {
      overallStatus = 'warning';
    }

    const result: VerificationResult = {
      success: overallStatus === 'healthy',
      messagingApiChannel: messagingResult,
      liffApps: liffResult,
      officialAccount: oaResult,
      overallStatus,
      timestamp: new Date().toISOString()
    };

    Logger.info(`Verification completed. Overall status: ${overallStatus}`);
    return result;
  }

  /**
   * Get detailed setup recommendations based on verification results
   */
  getSetupRecommendations(result: VerificationResult): string[] {
    const recommendations: string[] = [];

    if (!result.messagingApiChannel.exists) {
      recommendations.push('Create a LINE Official Account and enable Messaging API');
      recommendations.push('Generate a Channel Access Token with bot scope permissions');
    } else if (!result.messagingApiChannel.active) {
      recommendations.push('Ensure Messaging API Channel is properly activated');
      recommendations.push('Verify Channel Access Token has correct permissions');
    }

    if (!result.liffApps.exists || result.liffApps.count === 0) {
      recommendations.push('Create and publish at least one LIFF app in LINE Developers Console');
      recommendations.push('Configure LIFF app with appropriate view type and URL');
      recommendations.push('Ensure LIFF app is published (not in draft state)');
    }

    if (!result.officialAccount.exists || !result.officialAccount.active) {
      recommendations.push('Ensure Official Account is properly linked to Messaging API Channel');
      recommendations.push('Verify Official Account can send and receive messages');
    } else if (!result.officialAccount.info?.canSendMessages) {
      recommendations.push('Configure webhook URL for Official Account messaging');
      recommendations.push('Ensure Official Account has messaging permissions');
    }

    // Add friend prompt recommendations
    recommendations.push('IMPORTANT: Manually configure "Add friend option" in LINE Developers Console');
    recommendations.push('Go to LINE Login Channel > LIFF > Add friend option > Set to "On (aggressive)"');
    recommendations.push('This enables automatic friend prompting when users access your LIFF app');

    if (result.overallStatus === 'healthy') {
      recommendations.push('LINE setup is properly configured and ready for development');
      recommendations.push('Consider implementing programmatic friend prompting in your LIFF app');
    }

    return recommendations;
  }

  /**
   * Extract meaningful error message from axios error
   */
  private extractErrorMessage(error: any): string {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        return 'Unauthorized: Invalid or expired Channel Access Token';
      } else if (status === 403) {
        return 'Forbidden: Insufficient permissions for this operation';
      } else if (status === 404) {
        return 'Not Found: Channel or resource does not exist';
      } else if (status === 429) {
        return 'Rate Limited: Too many requests, please try again later';
      } else {
        return `HTTP ${status}: ${data?.message || 'Unknown server error'}`;
      }
    } else if (error.request) {
      // Request was made but no response received
      return 'Network Error: Unable to reach LINE API servers';
    } else {
      // Something else happened
      return error.message || 'Unknown error occurred';
    }
  }

  /**
   * Validate configuration parameters
   */
  static validateConfiguration(
    channelAccessToken: string,
    channelId: string,
    providerId?: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!channelAccessToken || typeof channelAccessToken !== 'string') {
      errors.push('Channel Access Token is required and must be a string');
    } else if (channelAccessToken.length < 10) {
      errors.push('Channel Access Token appears to be too short');
    }

    if (!channelId || typeof channelId !== 'string') {
      errors.push('Channel ID is required and must be a string');
    } else if (!/^\d+$/.test(channelId)) {
      errors.push('Channel ID must be a numeric string');
    }

    if (providerId && typeof providerId !== 'string') {
      errors.push('Provider ID must be a string if provided');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
