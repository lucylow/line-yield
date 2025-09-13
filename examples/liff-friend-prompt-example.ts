/**
 * LIFF Friend Prompt Example
 * 
 * This example demonstrates how to implement aggressive friend prompting
 * in a LINE LIFF Mini App using the actual LINE SDK.
 * 
 * Requirements:
 * - @line/liff package installed
 * - LIFF app configured in LINE Developers Console
 * - "Add friend option" set to "On (aggressive)" in console
 */

import liff from '@line/liff';

interface LiffConfig {
  liffId: string;
  withLogin?: boolean;
}

interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

class LiffFriendPromptService {
  private liffId: string;
  private officialAccountUserId?: string;
  private isInitialized = false;

  constructor(liffId: string, officialAccountUserId?: string) {
    this.liffId = liffId;
    this.officialAccountUserId = officialAccountUserId;
  }

  /**
   * Initialize LIFF SDK
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing LIFF SDK...');
      
      await liff.init({ 
        liffId: this.liffId,
        withLogin: true 
      });

      this.isInitialized = true;
      console.log('LIFF SDK initialized successfully');

      // Check if user is logged in, if not, trigger login
      if (!liff.isLoggedIn()) {
        console.log('User not logged in, redirecting to login...');
        liff.login();
        return;
      }

      console.log('User is logged in');
      
      // Auto-prompt for friend addition if in LINE client
      if (liff.isInClient()) {
        await this.autoPromptFriend();
      }
      
    } catch (error) {
      console.error('Failed to initialize LIFF:', error);
      throw error;
    }
  }

  /**
   * Automatically prompt user to add Official Account as friend
   */
  async autoPromptFriend(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('LIFF not initialized');
    }

    if (!liff.isInClient()) {
      console.log('Not in LINE client, friend prompting not available');
      return;
    }

    if (!this.officialAccountUserId) {
      console.warn('Official Account User ID not provided');
      return;
    }

    try {
      console.log('Prompting user to add Official Account...');
      
      // Use liff.follow() to prompt user to add friend
      await liff.follow(this.officialAccountUserId);
      
      console.log('Friend prompt triggered successfully');
      
    } catch (error) {
      console.error('Failed to prompt add friend:', error);
      throw error;
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(): Promise<LiffProfile | null> {
    if (!this.isInitialized || !liff.isLoggedIn()) {
      return null;
    }

    try {
      const profile = await liff.getProfile();
      return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage
      };
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * Send a message to the user (if they're friends)
   */
  async sendWelcomeMessage(message: string = 'Welcome to LINE Yield! Start earning yield on your crypto assets.'): Promise<void> {
    if (!this.isInitialized || !liff.isInClient()) {
      throw new Error('Messaging only available in LINE client');
    }

    try {
      const messages = [{
        type: 'text',
        text: message
      }];

      await liff.sendMessages(messages);
      console.log('Welcome message sent successfully');
      
    } catch (error) {
      console.error('Failed to send welcome message:', error);
      throw error;
    }
  }

  /**
   * Share content with friends
   */
  async shareWithFriends(message: string): Promise<void> {
    if (!this.isInitialized || !liff.isInClient()) {
      throw new Error('Sharing only available in LINE client');
    }

    try {
      await liff.shareTargetPicker([{
        type: 'text',
        text: message
      }]);
      
      console.log('Content shared successfully');
      
    } catch (error) {
      console.error('Failed to share content:', error);
      throw error;
    }
  }

  /**
   * Check if user is in LINE client
   */
  isInLineClient(): boolean {
    return this.isInitialized && liff.isInClient();
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.isInitialized && liff.isLoggedIn();
  }

  /**
   * Get LIFF context information
   */
  getContext() {
    if (!this.isInitialized) {
      return null;
    }

    return {
      isInClient: liff.isInClient(),
      isLoggedIn: liff.isLoggedIn(),
      context: liff.getContext(),
      os: liff.getOS(),
      version: liff.getVersion(),
      language: liff.getLanguage(),
      accessToken: liff.getAccessToken()
    };
  }

  /**
   * Logout user
   */
  logout(): void {
    if (this.isInitialized && liff.isLoggedIn()) {
      liff.logout();
    }
  }
}

// Example usage
async function initializeLiffApp() {
  const LIFF_ID = 'YOUR_LIFF_ID'; // Replace with your actual LIFF ID
  const OFFICIAL_ACCOUNT_USER_ID = 'YOUR_OA_USER_ID'; // Replace with your OA user ID

  const liffService = new LiffFriendPromptService(LIFF_ID, OFFICIAL_ACCOUNT_USER_ID);

  try {
    // Initialize LIFF
    await liffService.initialize();

    // Get user profile
    const profile = await liffService.getUserProfile();
    if (profile) {
      console.log('User profile:', profile);
    }

    // Get LIFF context
    const context = liffService.getContext();
    console.log('LIFF context:', context);

    // Auto-prompt for friend addition (if not already done)
    if (liffService.isInLineClient() && liffService.isLoggedIn()) {
      await liffService.autoPromptFriend();
      
      // Send welcome message after friend prompt
      setTimeout(async () => {
        try {
          await liffService.sendWelcomeMessage();
        } catch (error) {
          console.log('Could not send welcome message (user might not be friend yet)');
        }
      }, 2000);
    }

  } catch (error) {
    console.error('LIFF initialization failed:', error);
  }
}

// React hook example
export function useLiffFriendPrompt(liffId: string, officialAccountUserId?: string) {
  const [liffService, setLiffService] = useState<LiffFriendPromptService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initLiff = async () => {
      try {
        const service = new LiffFriendPromptService(liffId, officialAccountUserId);
        await service.initialize();
        
        setLiffService(service);
        setIsInitialized(true);
        
        const userProfile = await service.getUserProfile();
        setProfile(userProfile);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize LIFF');
      }
    };

    initLiff();
  }, [liffId, officialAccountUserId]);

  const promptAddFriend = async () => {
    if (!liffService) return;
    
    try {
      await liffService.autoPromptFriend();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to prompt add friend');
    }
  };

  const sendMessage = async (message: string) => {
    if (!liffService) return;
    
    try {
      await liffService.sendWelcomeMessage(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const shareContent = async (message: string) => {
    if (!liffService) return;
    
    try {
      await liffService.shareWithFriends(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share content');
    }
  };

  return {
    liffService,
    isInitialized,
    profile,
    error,
    isInLineClient: liffService?.isInLineClient() || false,
    isLoggedIn: liffService?.isLoggedIn() || false,
    promptAddFriend,
    sendMessage,
    shareContent
  };
}

// Initialize LIFF when script loads (for non-React usage)
if (typeof window !== 'undefined') {
  // Only initialize if we're in a LIFF environment
  if (window.location.href.includes('liff') || window.navigator.userAgent.includes('Line')) {
    initializeLiffApp().catch(console.error);
  }
}

export { LiffFriendPromptService };
export default initializeLiffApp;


