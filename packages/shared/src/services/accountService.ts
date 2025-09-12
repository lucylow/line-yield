export interface AccountLinkData {
  walletAddress: string;
  platform: 'liff' | 'web';
  userId?: string;
  linkedAt: Date;
}

export class AccountService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = process.env.VITE_API_BASE_URL || 'http://localhost:3000') {
    this.apiBaseUrl = apiBaseUrl;
  }

  async linkAccounts(walletAddress: string, liffUserId?: string): Promise<AccountLinkData> {
    const linkData: AccountLinkData = {
      walletAddress,
      platform: liffUserId ? 'liff' : 'web',
      userId: liffUserId,
      linkedAt: new Date()
    };

    // Store locally for now
    localStorage.setItem('linked_account', JSON.stringify(linkData));

    // In a real implementation, this would call your backend API
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/accounts/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(linkData),
      });

      if (!response.ok) {
        throw new Error('Failed to link account');
      }

      return await response.json();
    } catch (error) {
      console.warn('Failed to sync account link with backend:', error);
      return linkData;
    }
  }

  async getLinkedAccount(walletAddress: string): Promise<AccountLinkData | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/accounts/${walletAddress}`);
      
      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch linked account:', error);
      
      // Fallback to local storage
      const localData = localStorage.getItem('linked_account');
      if (localData) {
        const parsed = JSON.parse(localData);
        if (parsed.walletAddress === walletAddress) {
          return parsed;
        }
      }
      
      return null;
    }
  }

  async unlinkAccount(walletAddress: string): Promise<void> {
    localStorage.removeItem('linked_account');

    try {
      await fetch(`${this.apiBaseUrl}/api/accounts/${walletAddress}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('Failed to unlink account from backend:', error);
    }
  }
}
