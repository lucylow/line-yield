import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface CreditProfile {
  score: number;
  totalBorrowed: string;
  totalRepaid: string;
  activeLoans: number;
  completedLoans: number;
  latePayments: number;
  onTimePayments: number;
  lastActivity: number;
  isActive: boolean;
  tier: string;
  color: string;
}

export interface Loan {
  id: number;
  borrower: string;
  amount: string;
  interestRate: number;
  duration: number;
  startTime: number;
  dueDate: number;
  amountRepaid: string;
  isActive: boolean;
  isDefaulted: boolean;
  purpose: string;
}

export interface CreditEvent {
  id: string;
  userId: string;
  type: 'loan_created' | 'loan_repaid' | 'loan_defaulted' | 'score_updated' | 'profile_created';
  amount?: string;
  score?: number;
  reason: string;
  timestamp: string;
  txHash?: string;
}

export interface LoanApplication {
  userId: string;
  amount: string;
  duration: number;
  purpose: string;
  collateralAmount?: string;
  collateralToken?: string;
}

export interface LoanEligibility {
  eligible: boolean;
  requestedAmount: string;
  recommendedAmount: string;
  creditScore: number;
  tier: string;
}

export interface LoanStatistics {
  totalLoans: number;
  activeLoans: number;
  totalBorrowed: string;
  totalRepaid: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class CreditApiClient {
  private static instance: CreditApiClient;
  private api: AxiosInstance;
  private baseURL: string;

  private constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    
    this.api = axios.create({
      baseURL: `${this.baseURL}/api/credit`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[CreditAPI] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[CreditAPI] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        console.error('[CreditAPI] Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): CreditApiClient {
    if (!CreditApiClient.instance) {
      CreditApiClient.instance = new CreditApiClient();
    }
    return CreditApiClient.instance;
  }

  /**
   * Create credit profile for user
   */
  public async createCreditProfile(userAddress: string): Promise<{ message: string; userAddress: string }> {
    try {
      const response = await this.api.post(`/profile/${userAddress}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create credit profile');
    }
  }

  /**
   * Get user's credit profile
   */
  public async getCreditProfile(userAddress: string): Promise<CreditProfile> {
    try {
      const response = await this.api.get(`/profile/${userAddress}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get credit profile');
    }
  }

  /**
   * Get user's credit score
   */
  public async getCreditScore(userAddress: string): Promise<{ score: number; tier: string; color: string }> {
    try {
      const response = await this.api.get(`/score/${userAddress}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get credit score');
    }
  }

  /**
   * Calculate interest rate for user
   */
  public async calculateInterestRate(userAddress: string): Promise<{ interestRate: number; interestRatePercent: string }> {
    try {
      const response = await this.api.get(`/interest-rate/${userAddress}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to calculate interest rate');
    }
  }

  /**
   * Check loan eligibility
   */
  public async checkLoanEligibility(userAddress: string, amount: string): Promise<LoanEligibility> {
    try {
      const response = await this.api.post(`/eligibility/${userAddress}`, { amount });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to check loan eligibility');
    }
  }

  /**
   * Create a new loan
   */
  public async createLoan(application: LoanApplication): Promise<{ loanId: number; message: string }> {
    try {
      const response = await this.api.post('/loan', application);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create loan');
    }
  }

  /**
   * Record loan repayment
   */
  public async recordRepayment(loanId: number, amount: string): Promise<{ message: string; loanId: number; amount: string }> {
    try {
      const response = await this.api.post(`/repayment/${loanId}`, { amount });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to record repayment');
    }
  }

  /**
   * Record loan default
   */
  public async recordDefault(loanId: number): Promise<{ message: string; loanId: number }> {
    try {
      const response = await this.api.post(`/default/${loanId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to record default');
    }
  }

  /**
   * Get user's loan history
   */
  public async getUserLoans(userAddress: string): Promise<Loan[]> {
    try {
      const response = await this.api.get(`/loans/${userAddress}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get user loans');
    }
  }

  /**
   * Get loan details
   */
  public async getLoan(loanId: number): Promise<Loan> {
    try {
      const response = await this.api.get(`/loan/${loanId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get loan details');
    }
  }

  /**
   * Get credit events for user
   */
  public async getCreditEvents(userAddress: string, limit: number = 50): Promise<CreditEvent[]> {
    try {
      const response = await this.api.get(`/events/${userAddress}?limit=${limit}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get credit events');
    }
  }

  /**
   * Get loan statistics
   */
  public async getLoanStatistics(): Promise<LoanStatistics> {
    try {
      const response = await this.api.get('/statistics');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get loan statistics');
    }
  }

  /**
   * Update credit score manually (admin only)
   */
  public async updateScore(userAddress: string, score: number, reason: string): Promise<{ message: string; userAddress: string; newScore: number; reason: string }> {
    try {
      const response = await this.api.put(`/score/${userAddress}`, { score, reason });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update credit score');
    }
  }

  /**
   * Apply score decay for inactive user
   */
  public async applyScoreDecay(userAddress: string): Promise<{ message: string; userAddress: string }> {
    try {
      const response = await this.api.post(`/decay/${userAddress}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to apply score decay');
    }
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<any> {
    try {
      const response = await this.api.get('/health');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Health check failed');
    }
  }
}

// Export singleton instance
export const creditApiClient = CreditApiClient.getInstance();


