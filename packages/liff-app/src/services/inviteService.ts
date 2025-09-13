import liff from '@line/liff';

export interface InviteMessage {
  type: 'text' | 'image' | 'sticker' | 'template';
  text?: string;
  originalContentUrl?: string;
  previewImageUrl?: string;
  packageId?: string;
  stickerId?: string;
  altText?: string;
  template?: any;
}

export interface InviteOptions {
  isMultiple: boolean;
}

export class InviteService {
  private static instance: InviteService;
  
  private constructor() {}
  
  public static getInstance(): InviteService {
    if (!InviteService.instance) {
      InviteService.instance = new InviteService();
    }
    return InviteService.instance;
  }

  /**
   * Check if ShareTargetPicker API is available
   */
  public isShareTargetPickerAvailable(): boolean {
    return liff.isApiAvailable('shareTargetPicker');
  }

  /**
   * Invite friends with a text message
   */
  public async inviteFriendsWithText(
    message: string,
    options: InviteOptions = { isMultiple: false }
  ): Promise<void> {
    if (!this.isShareTargetPickerAvailable()) {
      throw new Error('ShareTargetPicker is not available in this environment');
    }

    const messages: InviteMessage[] = [
      {
        type: 'text',
        text: message
      }
    ];

    try {
      await liff.shareTargetPicker(messages, options);
    } catch (error) {
      console.error('Error inviting friends:', error);
      throw new Error(`Failed to invite friends: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Invite friends with a rich message template
   */
  public async inviteFriendsWithTemplate(
    template: any,
    options: InviteOptions = { isMultiple: false }
  ): Promise<void> {
    if (!this.isShareTargetPickerAvailable()) {
      throw new Error('ShareTargetPicker is not available in this environment');
    }

    const messages: InviteMessage[] = [
      {
        type: 'template',
        template: template,
        altText: 'Join me on LINE Yield!'
      }
    ];

    try {
      await liff.shareTargetPicker(messages, options);
    } catch (error) {
      console.error('Error inviting friends with template:', error);
      throw new Error(`Failed to invite friends: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Invite friends with an image
   */
  public async inviteFriendsWithImage(
    imageUrl: string,
    previewUrl: string,
    text: string = 'Join me on LINE Yield!',
    options: InviteOptions = { isMultiple: false }
  ): Promise<void> {
    if (!this.isShareTargetPickerAvailable()) {
      throw new Error('ShareTargetPicker is not available in this environment');
    }

    const messages: InviteMessage[] = [
      {
        type: 'image',
        originalContentUrl: imageUrl,
        previewImageUrl: previewUrl
      },
      {
        type: 'text',
        text: text
      }
    ];

    try {
      await liff.shareTargetPicker(messages, options);
    } catch (error) {
      console.error('Error inviting friends with image:', error);
      throw new Error(`Failed to invite friends: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get default invite message for LINE Yield
   */
  public getDefaultInviteMessage(): string {
    return 'Join me on LINE Yield! Earn yield on your Kaia-USDT safely and easily! 🚀💰';
  }

  /**
   * Get default invite message with user's current yield
   */
  public getPersonalizedInviteMessage(userYield?: string, currentAPY?: number): string {
    const baseMessage = 'Join me on LINE Yield!';
    const yieldInfo = userYield ? ` I\'ve already earned ${userYield} USDC` : '';
    const apyInfo = currentAPY ? ` at ${currentAPY}% APY` : '';
    
    return `${baseMessage}${yieldInfo}${apyInfo}! Earn yield on your Kaia-USDT safely and easily! 🚀💰`;
  }

  /**
   * Create a carousel template for inviting friends
   */
  public createInviteCarouselTemplate(): any {
    return {
      type: 'carousel',
      columns: [
        {
          thumbnailImageUrl: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=LINE+Yield',
          title: 'LINE Yield',
          text: 'Earn yield on your Kaia-USDT safely and easily!',
          actions: [
            {
              type: 'uri',
              label: 'Open LINE Yield',
              uri: liff.getContext()?.endpointUrl || 'https://line-yield.com'
            }
          ]
        },
        {
          thumbnailImageUrl: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Gasless+Transactions',
          title: 'Gasless Transactions',
          text: 'No gas fees! Transactions powered by LINE',
          actions: [
            {
              type: 'uri',
              label: 'Learn More',
              uri: 'https://line-yield.com/features'
            }
          ]
        }
      ]
    };
  }
}

// Export singleton instance
export const inviteService = InviteService.getInstance();


