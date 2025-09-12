export interface RelayerTransaction {
  to: string;
  data: string;
  value: string;
  gasLimit?: string;
  nonce?: string;
  signature?: string;
}

export interface RelayerResponse {
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: string;
  blockNumber?: number;
}

export class RelayerService {
  private apiBaseUrl: string;
  private apiKey: string;

  constructor() {
    this.apiBaseUrl = process.env.VITE_RELAYER_API_URL || 'http://localhost:3000';
    this.apiKey = process.env.VITE_RELAYER_API_KEY || 'dev-key';
  }

  async relayTransaction(transaction: RelayerTransaction): Promise<RelayerResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/relay/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          ...transaction,
          // Add platform-specific metadata
          platform: 'liff',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Relayer request failed: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        transactionHash: result.transactionHash,
        status: 'pending', // Relayer transactions are initially pending
        gasUsed: result.gasUsed,
        blockNumber: result.blockNumber,
      };
    } catch (error) {
      console.error('Relayer transaction failed:', error);
      throw new Error(`Failed to relay transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTransactionStatus(transactionHash: string): Promise<RelayerResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/relay/status/${transactionHash}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get transaction status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      throw error;
    }
  }

  async getRelayerBalance(): Promise<string> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/relay/balance`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get relayer balance: ${response.status}`);
      }

      const data = await response.json();
      return data.balance;
    } catch (error) {
      console.error('Failed to get relayer balance:', error);
      return '0';
    }
  }

  // For development/testing purposes
  async simulateTransaction(transaction: RelayerTransaction): Promise<RelayerResponse> {
    console.log('Simulating relayer transaction:', transaction);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock response
    return {
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      status: 'confirmed',
      gasUsed: '150000',
      blockNumber: 12345678,
    };
  }
}
