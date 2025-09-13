import axios, { AxiosResponse } from 'axios';
import { Logger } from '../utils/logger';
import { RichMenuInfo } from './line-verification-service';

export interface RichMenuTemplate {
  name: string;
  chatBarText: string;
  miniDappUrl: string;
  socialChannel1Url: string;
  socialChannel2Url: string;
  dappPortalUrl: string;
}

export interface RichMenuUploadResult {
  success: boolean;
  richMenuId?: string;
  error?: string;
}

export class RichMenuService {
  private readonly richMenuEndpoint = 'https://api.line.me/v2/bot/richmenu';
  private readonly uploadEndpoint = 'https://api.line.me/v2/bot/richmenu/upload';

  constructor(private readonly channelAccessToken: string) {
    if (!channelAccessToken) {
      throw new Error('Channel Access Token is required');
    }
  }

  /**
   * Generate Rich Menu JSON configuration according to Kaia Wave guidelines
   */
  generateRichMenuConfig(template: RichMenuTemplate): any {
    const config = {
      size: {
        width: 2500,
        height: 1686
      },
      selected: false,
      name: template.name,
      chatBarText: template.chatBarText,
      areas: [
        {
          // Area A: Mini Dapp (top-left, 1250x843)
          bounds: {
            x: 0,
            y: 0,
            width: 1250,
            height: 843
          },
          action: {
            type: 'uri',
            label: 'Mini Dapp',
            uri: template.miniDappUrl
          }
        },
        {
          // Area B: Social Channel 1 (top-center, 625x843)
          bounds: {
            x: 1250,
            y: 0,
            width: 625,
            height: 843
          },
          action: {
            type: 'uri',
            label: 'Website',
            uri: template.socialChannel1Url
          }
        },
        {
          // Area C: Social Channel 2 (top-right, 625x843)
          bounds: {
            x: 1875,
            y: 0,
            width: 625,
            height: 843
          },
          action: {
            type: 'uri',
            label: 'Social',
            uri: template.socialChannel2Url
          }
        },
        {
          // Area D: Dapp Portal (bottom, full width, 2500x843)
          bounds: {
            x: 0,
            y: 843,
            width: 2500,
            height: 843
          },
          action: {
            type: 'uri',
            label: 'Dapp Portal',
            uri: template.dappPortalUrl
          }
        }
      ]
    };

    Logger.info('Generated Rich Menu configuration:', {
      name: config.name,
      areas: config.areas.length,
      size: `${config.size.width}x${config.size.height}`
    });

    return config;
  }

  /**
   * Create a Rich Menu using the Messaging API
   */
  async createRichMenu(template: RichMenuTemplate): Promise<RichMenuUploadResult> {
    try {
      Logger.info('Creating Rich Menu...');
      
      const config = this.generateRichMenuConfig(template);
      
      const response: AxiosResponse<{ richMenuId: string }> = await axios.post(
        this.richMenuEndpoint,
        config,
        {
          headers: {
            Authorization: `Bearer ${this.channelAccessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const richMenuId = response.data.richMenuId;
      Logger.info(`Rich Menu created successfully. ID: ${richMenuId}`);

      return {
        success: true,
        richMenuId
      };

    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      Logger.error('Failed to create Rich Menu:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Upload Rich Menu image
   */
  async uploadRichMenuImage(richMenuId: string, imageBuffer: Buffer, contentType: string = 'image/jpeg'): Promise<RichMenuUploadResult> {
    try {
      Logger.info(`Uploading Rich Menu image for ID: ${richMenuId}`);
      
      await axios.post(
        `${this.uploadEndpoint}/${richMenuId}`,
        imageBuffer,
        {
          headers: {
            Authorization: `Bearer ${this.channelAccessToken}`,
            'Content-Type': contentType
          },
          timeout: 30000 // Longer timeout for image upload
        }
      );

      Logger.info(`Rich Menu image uploaded successfully for ID: ${richMenuId}`);

      return {
        success: true,
        richMenuId
      };

    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      Logger.error(`Failed to upload Rich Menu image for ID ${richMenuId}:`, errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Set Rich Menu as default for all users
   */
  async setDefaultRichMenu(richMenuId: string): Promise<RichMenuUploadResult> {
    try {
      Logger.info(`Setting Rich Menu as default. ID: ${richMenuId}`);
      
      await axios.post(
        `${this.richMenuEndpoint}/${richMenuId}/user/all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.channelAccessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      Logger.info(`Rich Menu set as default successfully. ID: ${richMenuId}`);

      return {
        success: true,
        richMenuId
      };

    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      Logger.error(`Failed to set Rich Menu as default for ID ${richMenuId}:`, errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get all Rich Menus
   */
  async getRichMenus(): Promise<{ success: boolean; richMenus?: RichMenuInfo[]; error?: string }> {
    try {
      Logger.info('Fetching Rich Menus...');
      
      const response: AxiosResponse<{ richmenus: RichMenuInfo[] }> = await axios.get(
        this.richMenuEndpoint,
        {
          headers: {
            Authorization: `Bearer ${this.channelAccessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const richMenus = response.data.richmenus;
      Logger.info(`Found ${richMenus.length} Rich Menu(s)`);

      return {
        success: true,
        richMenus
      };

    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      Logger.error('Failed to fetch Rich Menus:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Delete a Rich Menu
   */
  async deleteRichMenu(richMenuId: string): Promise<RichMenuUploadResult> {
    try {
      Logger.info(`Deleting Rich Menu. ID: ${richMenuId}`);
      
      await axios.delete(
        `${this.richMenuEndpoint}/${richMenuId}`,
        {
          headers: {
            Authorization: `Bearer ${this.channelAccessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      Logger.info(`Rich Menu deleted successfully. ID: ${richMenuId}`);

      return {
        success: true,
        richMenuId
      };

    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      Logger.error(`Failed to delete Rich Menu for ID ${richMenuId}:`, errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Complete Rich Menu setup (create, upload image, set as default)
   */
  async setupCompleteRichMenu(
    template: RichMenuTemplate, 
    imageBuffer: Buffer, 
    contentType: string = 'image/jpeg'
  ): Promise<{ success: boolean; richMenuId?: string; error?: string }> {
    try {
      Logger.info('Starting complete Rich Menu setup...');

      // Step 1: Create Rich Menu
      const createResult = await this.createRichMenu(template);
      if (!createResult.success || !createResult.richMenuId) {
        return createResult;
      }

      const richMenuId = createResult.richMenuId;

      // Step 2: Upload image
      const uploadResult = await this.uploadRichMenuImage(richMenuId, imageBuffer, contentType);
      if (!uploadResult.success) {
        // Clean up created Rich Menu if image upload fails
        await this.deleteRichMenu(richMenuId);
        return uploadResult;
      }

      // Step 3: Set as default
      const defaultResult = await this.setDefaultRichMenu(richMenuId);
      if (!defaultResult.success) {
        return defaultResult;
      }

      Logger.info('Complete Rich Menu setup finished successfully');
      return {
        success: true,
        richMenuId
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Logger.error('Complete Rich Menu setup failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Extract meaningful error message from axios error
   */
  private extractErrorMessage(error: any): string {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        return 'Unauthorized: Invalid or expired Channel Access Token';
      } else if (status === 403) {
        return 'Forbidden: Insufficient permissions for Rich Menu operations';
      } else if (status === 400) {
        return `Bad Request: ${data?.message || 'Invalid Rich Menu configuration'}`;
      } else if (status === 429) {
        return 'Rate Limited: Too many requests, please try again later';
      } else {
        return `HTTP ${status}: ${data?.message || 'Unknown server error'}`;
      }
    } else if (error.request) {
      return 'Network Error: Unable to reach LINE API servers';
    } else {
      return error.message || 'Unknown error occurred';
    }
  }
}


