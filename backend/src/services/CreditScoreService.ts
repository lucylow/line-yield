import { ethers } from 'ethers';
import { CONFIG } from '../config';
import { Logger } from '../utils/logger';
import { createClient } from '@supabase/supabase-js';

const logger = new Logger('CreditScoreService');

// Initialize Supabase client
const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.serviceRoleKey);

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

export class CreditScoreService {
  private static instance: CreditScoreService;
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  
  // Contract ABI (simplified for this example)
  private readonly CONTRACT_ABI = [
    "function createCreditProfile(address user) external",
    "function getCreditScore(address user) external view returns (uint256)",
    "function getCreditProfile(address user) external view returns (tuple(uint256 score, uint256 totalBorrowed, uint256 totalRepaid, uint256 activeLoans, uint256 completedLoans, uint256 latePayments, uint256 onTimePayments, uint256 lastActivity, bool isActive))",
    "function calculateInterestRate(address user) external view returns (uint256)",
    "function createLoan(address borrower, uint256 amount, uint256 duration, string memory purpose) external returns (uint256)",
    "function recordRepayment(uint256 loanId, uint256 amount) external",
    "function recordDefault(uint256 loanId) external",
    "function isEligibleForLoan(address user, uint256 amount) external view returns (bool)",
    "function getUserLoans(address user) external view returns (uint256[])",
    "function getLoan(uint256 loanId) external view returns (tuple(uint256 id, address borrower, uint256 amount, uint256 interestRate, uint256 duration, uint256 startTime, uint256 dueDate, uint256 amountRepaid, bool isActive, bool isDefaulted, string purpose))",
    "function getTotalLoans() external view returns (uint256)",
    "function getLoanStatistics() external view returns (uint256, uint256, uint256, uint256)",
    "event CreditScoreUpdated(address indexed user, uint256 newScore, string reason)",
    "event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 interestRate)",
    "event LoanRepaid(uint256 indexed loanId, uint256 amount)",
    "event LoanDefaulted(uint256 indexed loanId)",
    "event CreditProfileCreated(address indexed user)"
  ];

  private constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(CONFIG.kaia.rpcUrl);
    this.wallet = new ethers.Wallet(CONFIG.kaia.walletPrivateKey, this.provider);
    
    // Contract address from config
    const contractAddress = CONFIG.contracts.creditScoreAddress;
    this.contract = new ethers.Contract(contractAddress, this.CONTRACT_ABI, this.wallet);
  }

  public static getInstance(): CreditScoreService {
    if (!CreditScoreService.instance) {
      CreditScoreService.instance = new CreditScoreService();
    }
    return CreditScoreService.instance;
  }

  /**
   * Create a credit profile for a new user
   */
  public async createCreditProfile(userAddress: string): Promise<void> {
    try {
      const tx = await this.contract.createCreditProfile(userAddress);
      await tx.wait();

      // Log the event in Supabase
      await this.logCreditEvent({
        userId: userAddress,
        type: 'profile_created',
        reason: 'New user profile created',
        timestamp: new Date().toISOString(),
        txHash: tx.hash
      });

      logger.info(`Credit profile created for user ${userAddress}`);
    } catch (error) {
      logger.error('Error creating credit profile:', error);
      throw new Error('Failed to create credit profile');
    }
  }

  /**
   * Get user's credit score
   */
  public async getCreditScore(userAddress: string): Promise<number> {
    try {
      const score = await this.contract.getCreditScore(userAddress);
      return score.toNumber();
    } catch (error) {
      logger.error('Error getting credit score:', error);
      throw new Error('Failed to get credit score');
    }
  }

  /**
   * Get complete credit profile
   */
  public async getCreditProfile(userAddress: string): Promise<CreditProfile> {
    try {
      const profile = await this.contract.getCreditProfile(userAddress);
      
      return {
        score: profile.score.toNumber(),
        totalBorrowed: profile.totalBorrowed.toString(),
        totalRepaid: profile.totalRepaid.toString(),
        activeLoans: profile.activeLoans.toNumber(),
        completedLoans: profile.completedLoans.toNumber(),
        latePayments: profile.latePayments.toNumber(),
        onTimePayments: profile.onTimePayments.toNumber(),
        lastActivity: profile.lastActivity.toNumber(),
        isActive: profile.isActive
      };
    } catch (error) {
      logger.error('Error getting credit profile:', error);
      throw new Error('Failed to get credit profile');
    }
  }

  /**
   * Calculate interest rate based on credit score
   */
  public async calculateInterestRate(userAddress: string): Promise<number> {
    try {
      const rate = await this.contract.calculateInterestRate(userAddress);
      return rate.toNumber();
    } catch (error) {
      logger.error('Error calculating interest rate:', error);
      throw new Error('Failed to calculate interest rate');
    }
  }

  /**
   * Check if user is eligible for a loan
   */
  public async isEligibleForLoan(userAddress: string, amount: string): Promise<boolean> {
    try {
      const eligible = await this.contract.isEligibleForLoan(userAddress, ethers.utils.parseEther(amount));
      return eligible;
    } catch (error) {
      logger.error('Error checking loan eligibility:', error);
      throw new Error('Failed to check loan eligibility');
    }
  }

  /**
   * Create a new loan
   */
  public async createLoan(application: LoanApplication): Promise<number> {
    try {
      const tx = await this.contract.createLoan(
        application.userId,
        ethers.utils.parseEther(application.amount),
        application.duration,
        application.purpose
      );
      
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === 'LoanCreated');
      const loanId = event?.args?.loanId.toNumber();

      // Log the event in Supabase
      await this.logCreditEvent({
        userId: application.userId,
        type: 'loan_created',
        amount: application.amount,
        reason: `Loan created for ${application.purpose}`,
        timestamp: new Date().toISOString(),
        txHash: tx.hash
      });

      logger.info(`Loan created for user ${application.userId}, loan ID: ${loanId}`);
      return loanId || 0;
    } catch (error) {
      logger.error('Error creating loan:', error);
      throw new Error('Failed to create loan');
    }
  }

  /**
   * Record a loan repayment
   */
  public async recordRepayment(loanId: number, amount: string): Promise<void> {
    try {
      const tx = await this.contract.recordRepayment(loanId, ethers.utils.parseEther(amount));
      await tx.wait();

      // Get loan details to log the event
      const loan = await this.getLoan(loanId);

      await this.logCreditEvent({
        userId: loan.borrower,
        type: 'loan_repaid',
        amount: amount,
        reason: `Repayment of ${amount} for loan ${loanId}`,
        timestamp: new Date().toISOString(),
        txHash: tx.hash
      });

      logger.info(`Repayment recorded for loan ${loanId}, amount: ${amount}`);
    } catch (error) {
      logger.error('Error recording repayment:', error);
      throw new Error('Failed to record repayment');
    }
  }

  /**
   * Record a loan default
   */
  public async recordDefault(loanId: number): Promise<void> {
    try {
      const tx = await this.contract.recordDefault(loanId);
      await tx.wait();

      // Get loan details to log the event
      const loan = await this.getLoan(loanId);

      await this.logCreditEvent({
        userId: loan.borrower,
        type: 'loan_defaulted',
        reason: `Loan ${loanId} defaulted`,
        timestamp: new Date().toISOString(),
        txHash: tx.hash
      });

      logger.info(`Default recorded for loan ${loanId}`);
    } catch (error) {
      logger.error('Error recording default:', error);
      throw new Error('Failed to record default');
    }
  }

  /**
   * Get user's loan history
   */
  public async getUserLoans(userAddress: string): Promise<Loan[]> {
    try {
      const loanIds = await this.contract.getUserLoans(userAddress);
      const loans: Loan[] = [];

      for (const loanId of loanIds) {
        const loan = await this.getLoan(loanId.toNumber());
        loans.push(loan);
      }

      return loans;
    } catch (error) {
      logger.error('Error getting user loans:', error);
      throw new Error('Failed to get user loans');
    }
  }

  /**
   * Get loan details
   */
  public async getLoan(loanId: number): Promise<Loan> {
    try {
      const loan = await this.contract.getLoan(loanId);
      
      return {
        id: loan.id.toNumber(),
        borrower: loan.borrower,
        amount: ethers.utils.formatEther(loan.amount),
        interestRate: loan.interestRate.toNumber(),
        duration: loan.duration.toNumber(),
        startTime: loan.startTime.toNumber(),
        dueDate: loan.dueDate.toNumber(),
        amountRepaid: ethers.utils.formatEther(loan.amountRepaid),
        isActive: loan.isActive,
        isDefaulted: loan.isDefaulted,
        purpose: loan.purpose
      };
    } catch (error) {
      logger.error('Error getting loan:', error);
      throw new Error('Failed to get loan details');
    }
  }

  /**
   * Get loan statistics
   */
  public async getLoanStatistics(): Promise<{
    totalLoans: number;
    activeLoans: number;
    totalBorrowed: string;
    totalRepaid: string;
  }> {
    try {
      const [totalLoans, activeLoans, totalBorrowed, totalRepaid] = await this.contract.getLoanStatistics();
      
      return {
        totalLoans: totalLoans.toNumber(),
        activeLoans: activeLoans.toNumber(),
        totalBorrowed: ethers.utils.formatEther(totalBorrowed),
        totalRepaid: ethers.utils.formatEther(totalRepaid)
      };
    } catch (error) {
      logger.error('Error getting loan statistics:', error);
      throw new Error('Failed to get loan statistics');
    }
  }

  /**
   * Get credit score tier
   */
  public getCreditScoreTier(score: number): string {
    if (score >= 800) return 'Excellent';
    if (score >= 700) return 'Good';
    if (score >= 600) return 'Fair';
    if (score >= 500) return 'Poor';
    return 'Very Poor';
  }

  /**
   * Get credit score color for UI
   */
  public getCreditScoreColor(score: number): string {
    if (score >= 800) return 'text-green-600 bg-green-100';
    if (score >= 700) return 'text-blue-600 bg-blue-100';
    if (score >= 600) return 'text-yellow-600 bg-yellow-100';
    if (score >= 500) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  }

  /**
   * Calculate loan-to-value ratio
   */
  public calculateLTV(loanAmount: string, collateralValue: string): number {
    const loan = parseFloat(loanAmount);
    const collateral = parseFloat(collateralValue);
    
    if (collateral === 0) return 0;
    return (loan / collateral) * 100;
  }

  /**
   * Get recommended loan amount based on credit score
   */
  public getRecommendedLoanAmount(score: number, totalRepaid: string): string {
    const repaid = parseFloat(totalRepaid);
    
    if (score >= 800) {
      return (repaid * 3).toString(); // Can borrow 3x total repaid
    } else if (score >= 700) {
      return (repaid * 2.5).toString(); // Can borrow 2.5x total repaid
    } else if (score >= 600) {
      return (repaid * 2).toString(); // Can borrow 2x total repaid
    } else if (score >= 500) {
      return (repaid * 1.5).toString(); // Can borrow 1.5x total repaid
    } else {
      return (repaid * 1).toString(); // Can borrow 1x total repaid
    }
  }

  /**
   * Log credit event to Supabase
   */
  private async logCreditEvent(event: Omit<CreditEvent, 'id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('credit_events')
        .insert([{
          user_id: event.userId,
          type: event.type,
          amount: event.amount,
          score: event.score,
          reason: event.reason,
          timestamp: event.timestamp,
          tx_hash: event.txHash
        }]);

      if (error) throw error;
    } catch (error) {
      logger.error('Error logging credit event:', error);
      // Don't throw error here as it's not critical
    }
  }

  /**
   * Get credit events for a user
   */
  public async getCreditEvents(userId: string, limit: number = 50): Promise<CreditEvent[]> {
    try {
      const { data, error } = await supabase
        .from('credit_events')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error getting credit events:', error);
      throw new Error('Failed to get credit events');
    }
  }

  /**
   * Update credit score manually (admin function)
   */
  public async updateScore(userAddress: string, newScore: number, reason: string): Promise<void> {
    try {
      const tx = await this.contract.updateScore(userAddress, newScore, reason);
      await tx.wait();

      await this.logCreditEvent({
        userId: userAddress,
        type: 'score_updated',
        score: newScore,
        reason: reason,
        timestamp: new Date().toISOString(),
        txHash: tx.hash
      });

      logger.info(`Credit score updated for user ${userAddress} to ${newScore}`);
    } catch (error) {
      logger.error('Error updating credit score:', error);
      throw new Error('Failed to update credit score');
    }
  }

  /**
   * Apply score decay for inactive users
   */
  public async applyScoreDecay(userAddress: string): Promise<void> {
    try {
      const tx = await this.contract.applyScoreDecay(userAddress);
      await tx.wait();

      logger.info(`Score decay applied for user ${userAddress}`);
    } catch (error) {
      logger.error('Error applying score decay:', error);
      throw new Error('Failed to apply score decay');
    }
  }
}

// Export singleton instance
export const creditScoreService = CreditScoreService.getInstance();


