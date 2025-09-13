import { ethers } from 'ethers';
import { CONFIG } from '../config';
import { Logger } from '../utils/logger';
import { createClient } from '@supabase/supabase-js';

const logger = new Logger('LoanService');

// Initialize Supabase client with service role key (backend only)
const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.serviceRoleKey);

export interface LoanType {
  id: number;
  name: string;
  description: string;
  maxAmount: string;
  minAmount: string;
  interestRateBps: number;
  collateralRatioBps: number;
  durationSeconds: number;
  liquidationThresholdBps: number;
  penaltyRateBps: number;
  active: boolean;
  requiresKYC: boolean;
  maxBorrowers: number;
  currentBorrowers: number;
}

export interface Loan {
  id: number;
  loanTypeId: number;
  borrower: string;
  principal: string;
  collateral: string;
  startTimestamp: number;
  repaidAmount: string;
  lastPaymentTimestamp: number;
  status: 'Active' | 'Repaid' | 'Liquidated' | 'Defaulted' | 'Cancelled';
  interestAccrued: string;
  isLiquidated: boolean;
  totalOwed?: string;
  interestOwed?: string;
  penaltyOwed?: string;
  daysRemaining?: number;
  collateralRatio?: number;
}

export interface LoanApplication {
  loanTypeId: number;
  principalRequested: string;
  collateralAmount: string;
  borrowerAddress: string;
  kycVerified: boolean;
  creditScore: number;
}

export interface LoanRepayment {
  loanId: number;
  amount: string;
  interestPaid: string;
  principalPaid: string;
  remainingBalance: string;
}

export interface LoanLiquidation {
  loanId: number;
  liquidator: string;
  collateralSeized: string;
  debtAmount: string;
  reason: string;
}

export class LoanService {
  private static instance: LoanService;
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private isInitialized: boolean = false;

  // Loan type configurations
  private readonly DEFAULT_LOAN_TYPES = [
    {
      name: "Quick Cash",
      description: "Short-term loan for immediate liquidity needs",
      maxAmount: ethers.parseEther("1000"),
      minAmount: ethers.parseEther("100"),
      interestRateBps: 500, // 5% APR
      collateralRatioBps: 15000, // 150%
      durationSeconds: 30 * 24 * 60 * 60, // 30 days
      liquidationThresholdBps: 12000, // 120%
      penaltyRateBps: 1000, // 10% APR penalty
      requiresKYC: false,
      maxBorrowers: 0 // Unlimited
    },
    {
      name: "Business Loan",
      description: "Medium-term loan for business operations",
      maxAmount: ethers.parseEther("10000"),
      minAmount: ethers.parseEther("1000"),
      interestRateBps: 800, // 8% APR
      collateralRatioBps: 20000, // 200%
      durationSeconds: 90 * 24 * 60 * 60, // 90 days
      liquidationThresholdBps: 15000, // 150%
      penaltyRateBps: 1500, // 15% APR penalty
      requiresKYC: true,
      maxBorrowers: 100
    },
    {
      name: "Premium Loan",
      description: "Long-term loan with competitive rates for high-value borrowers",
      maxAmount: ethers.parseEther("100000"),
      minAmount: ethers.parseEther("10000"),
      interestRateBps: 300, // 3% APR
      collateralRatioBps: 30000, // 300%
      durationSeconds: 365 * 24 * 60 * 60, // 1 year
      liquidationThresholdBps: 25000, // 250%
      penaltyRateBps: 500, // 5% APR penalty
      requiresKYC: true,
      maxBorrowers: 50
    }
  ];

  private constructor() {
    this.provider = new ethers.JsonRpcProvider(CONFIG.kaia.rpcUrl);
    this.wallet = new ethers.Wallet(CONFIG.kaia.walletPrivateKey, this.provider);
  }

  public static getInstance(): LoanService {
    if (!LoanService.instance) {
      LoanService.instance = new LoanService();
    }
    return LoanService.instance;
  }

  /**
   * Initialize the loan service with contract address
   */
  public async initialize(contractAddress: string): Promise<void> {
    try {
      // Contract ABI (simplified for this example)
      const contractABI = [
        "function createLoanType(string memory name, string memory description, uint256 maxAmount, uint256 minAmount, uint256 interestRateBps, uint256 collateralRatioBps, uint256 durationSeconds, uint256 liquidationThresholdBps, uint256 penaltyRateBps, bool requiresKYC, uint256 maxBorrowers) external",
        "function createLoan(uint256 loanTypeId, uint256 principalRequested, uint256 collateralAmount) external",
        "function repayLoan(uint256 loanId, uint256 amount) external",
        "function addCollateral(uint256 loanId, uint256 additionalAmount) external",
        "function withdrawExcessCollateral(uint256 loanId, uint256 amount) external",
        "function liquidateLoan(uint256 loanId) external",
        "function setKYCVerified(address user, bool verified) external",
        "function updateCreditScore(address borrower, uint256 score) external",
        "function updateTokenPrice(address token, uint256 price) external",
        "function getLoan(uint256 loanId) external view returns (uint256, address, uint256, uint256, uint256, uint256, uint256, uint8, uint256, bool)",
        "function getLoanType(uint256 loanTypeId) external view returns (string memory, string memory, uint256, uint256, uint256, uint256, uint256, uint256, uint256, bool, bool, uint256, uint256)",
        "function getBorrowerLoans(address borrower) external view returns (uint256[] memory)",
        "function getLoanTypeCount() external view returns (uint256)",
        "function getLoanCount() external view returns (uint256)",
        "function calculateTotalOwed(uint256 loanId) external view returns (uint256)",
        "function calculateInterest(uint256 loanId) external view returns (uint256)",
        "function calculatePenalty(uint256 loanId) external view returns (uint256)",
        "function isLoanLiquidatable(uint256 loanId) external view returns (bool)",
        "function calculateRequiredCollateral(uint256 loanAmount, uint256 collateralRatioBps) external pure returns (uint256)",
        "event LoanTypeCreated(uint256 indexed loanTypeId, string name, uint256 maxAmount, uint256 minAmount, uint256 interestRateBps, uint256 collateralRatioBps, uint256 durationSeconds)",
        "event LoanCreated(uint256 indexed loanId, uint256 indexed loanTypeId, address indexed borrower, uint256 principal, uint256 collateral, uint256 startTimestamp)",
        "event LoanRepaid(uint256 indexed loanId, uint256 amount, uint256 interestPaid, uint256 remainingBalance)",
        "event LoanLiquidated(uint256 indexed loanId, address indexed liquidator, uint256 collateralSeized, uint256 debtAmount)"
      ];

      this.contract = new ethers.Contract(contractAddress, contractABI, this.wallet);
      this.isInitialized = true;
      
      logger.info(`Loan Service initialized with contract: ${contractAddress}`);
    } catch (error) {
      logger.error('Failed to initialize loan service:', error);
      throw new Error('Failed to initialize loan service');
    }
  }

  /**
   * Initialize default loan types
   */
  public async initializeDefaultLoanTypes(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Loan Service not initialized');
    }

    try {
      for (const loanType of this.DEFAULT_LOAN_TYPES) {
        const tx = await this.contract.createLoanType(
          loanType.name,
          loanType.description,
          loanType.maxAmount,
          loanType.minAmount,
          loanType.interestRateBps,
          loanType.collateralRatioBps,
          loanType.durationSeconds,
          loanType.liquidationThresholdBps,
          loanType.penaltyRateBps,
          loanType.requiresKYC,
          loanType.maxBorrowers
        );
        await tx.wait();
        
        logger.info(`Created loan type: ${loanType.name}`);
      }
    } catch (error) {
      logger.error('Failed to initialize default loan types:', error);
      throw new Error('Failed to initialize default loan types');
    }
  }

  /**
   * Create a new loan
   */
  public async createLoan(
    loanTypeId: number,
    principalRequested: string,
    collateralAmount: string,
    borrowerAddress: string
  ): Promise<{ success: boolean; loanId?: number; error?: string }> {
    if (!this.isInitialized) {
      throw new Error('Loan Service not initialized');
    }

    try {
      // Check borrower eligibility
      const eligibility = await this.checkBorrowerEligibility(borrowerAddress, loanTypeId);
      if (!eligibility.eligible) {
        return { success: false, error: eligibility.reason };
      }

      // Create loan transaction
      const tx = await this.contract.createLoan(
        loanTypeId,
        ethers.parseEther(principalRequested),
        ethers.parseEther(collateralAmount)
      );
      const receipt = await tx.wait();

      // Extract loan ID from event
      const loanCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed.name === 'LoanCreated';
        } catch {
          return false;
        }
      });

      let loanId: number;
      if (loanCreatedEvent) {
        const parsed = this.contract.interface.parseLog(loanCreatedEvent);
        loanId = Number(parsed.args.loanId);
      } else {
        // Fallback: get latest loan count
        loanId = Number(await this.contract.getLoanCount()) - 1;
      }

      // Log to database
      await this.logLoanCreation(loanId, loanTypeId, borrowerAddress, principalRequested, collateralAmount);

      logger.info(`Loan created: ID ${loanId} for ${borrowerAddress}`);
      return { success: true, loanId };
    } catch (error) {
      logger.error('Failed to create loan:', error);
      return { success: false, error: 'Failed to create loan' };
    }
  }

  /**
   * Repay loan
   */
  public async repayLoan(loanId: number, amount: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      throw new Error('Loan Service not initialized');
    }

    try {
      const tx = await this.contract.repayLoan(loanId, ethers.parseEther(amount));
      await tx.wait();

      // Log to database
      await this.logLoanRepayment(loanId, amount);

      logger.info(`Loan ${loanId} repaid: ${amount}`);
      return { success: true };
    } catch (error) {
      logger.error('Failed to repay loan:', error);
      return { success: false, error: 'Failed to repay loan' };
    }
  }

  /**
   * Add collateral to existing loan
   */
  public async addCollateral(loanId: number, additionalAmount: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      throw new Error('Loan Service not initialized');
    }

    try {
      const tx = await this.contract.addCollateral(loanId, ethers.parseEther(additionalAmount));
      await tx.wait();

      logger.info(`Added collateral to loan ${loanId}: ${additionalAmount}`);
      return { success: true };
    } catch (error) {
      logger.error('Failed to add collateral:', error);
      return { success: false, error: 'Failed to add collateral' };
    }
  }

  /**
   * Liquidate loan
   */
  public async liquidateLoan(loanId: number): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      throw new Error('Loan Service not initialized');
    }

    try {
      const tx = await this.contract.liquidateLoan(loanId);
      await tx.wait();

      // Log to database
      await this.logLoanLiquidation(loanId);

      logger.info(`Loan ${loanId} liquidated`);
      return { success: true };
    } catch (error) {
      logger.error('Failed to liquidate loan:', error);
      return { success: false, error: 'Failed to liquidate loan' };
    }
  }

  /**
   * Get all loan types
   */
  public async getAllLoanTypes(): Promise<LoanType[]> {
    if (!this.isInitialized) {
      throw new Error('Loan Service not initialized');
    }

    try {
      const loanTypeCount = Number(await this.contract.getLoanTypeCount());
      const loanTypes: LoanType[] = [];

      for (let i = 0; i < loanTypeCount; i++) {
        const loanTypeData = await this.contract.getLoanType(i);
        loanTypes.push({
          id: i,
          name: loanTypeData[0],
          description: loanTypeData[1],
          maxAmount: ethers.formatEther(loanTypeData[2]),
          minAmount: ethers.formatEther(loanTypeData[3]),
          interestRateBps: Number(loanTypeData[4]),
          collateralRatioBps: Number(loanTypeData[5]),
          durationSeconds: Number(loanTypeData[6]),
          liquidationThresholdBps: Number(loanTypeData[7]),
          penaltyRateBps: Number(loanTypeData[8]),
          active: loanTypeData[9],
          requiresKYC: loanTypeData[10],
          maxBorrowers: Number(loanTypeData[11]),
          currentBorrowers: Number(loanTypeData[12])
        });
      }

      return loanTypes;
    } catch (error) {
      logger.error('Failed to get loan types:', error);
      throw new Error('Failed to get loan types');
    }
  }

  /**
   * Get user's loans
   */
  public async getUserLoans(userAddress: string): Promise<Loan[]> {
    if (!this.isInitialized) {
      throw new Error('Loan Service not initialized');
    }

    try {
      const loanIds = await this.contract.getBorrowerLoans(userAddress);
      const loans: Loan[] = [];

      for (const loanId of loanIds) {
        const loanData = await this.contract.getLoan(loanId);
        const totalOwed = await this.contract.calculateTotalOwed(loanId);
        const interestOwed = await this.contract.calculateInterest(loanId);
        const penaltyOwed = await this.contract.calculatePenalty(loanId);
        const isLiquidatable = await this.contract.isLoanLiquidatable(loanId);

        const loanType = await this.contract.getLoanType(loanData[0]);
        const collateralRatio = Number(loanData[3]) > 0 ? 
          (Number(loanData[3]) * 10000) / Number(totalOwed) : 0;

        const daysRemaining = Math.max(0, 
          Math.ceil((Number(loanData[4]) + Number(loanType[6]) - Date.now() / 1000) / (24 * 60 * 60))
        );

        loans.push({
          id: Number(loanId),
          loanTypeId: Number(loanData[0]),
          borrower: loanData[1],
          principal: ethers.formatEther(loanData[2]),
          collateral: ethers.formatEther(loanData[3]),
          startTimestamp: Number(loanData[4]),
          repaidAmount: ethers.formatEther(loanData[5]),
          lastPaymentTimestamp: Number(loanData[6]),
          status: this.mapLoanStatus(Number(loanData[7])),
          interestAccrued: ethers.formatEther(loanData[8]),
          isLiquidated: loanData[9],
          totalOwed: ethers.formatEther(totalOwed),
          interestOwed: ethers.formatEther(interestOwed),
          penaltyOwed: ethers.formatEther(penaltyOwed),
          daysRemaining,
          collateralRatio
        });
      }

      return loans;
    } catch (error) {
      logger.error('Failed to get user loans:', error);
      throw new Error('Failed to get user loans');
    }
  }

  /**
   * Get loan details
   */
  public async getLoan(loanId: number): Promise<Loan | null> {
    if (!this.isInitialized) {
      throw new Error('Loan Service not initialized');
    }

    try {
      const loanData = await this.contract.getLoan(loanId);
      const totalOwed = await this.contract.calculateTotalOwed(loanId);
      const interestOwed = await this.contract.calculateInterest(loanId);
      const penaltyOwed = await this.contract.calculatePenalty(loanId);

      const loanType = await this.contract.getLoanType(loanData[0]);
      const collateralRatio = Number(loanData[3]) > 0 ? 
        (Number(loanData[3]) * 10000) / Number(totalOwed) : 0;

      const daysRemaining = Math.max(0, 
        Math.ceil((Number(loanData[4]) + Number(loanType[6]) - Date.now() / 1000) / (24 * 60 * 60))
      );

      return {
        id: loanId,
        loanTypeId: Number(loanData[0]),
        borrower: loanData[1],
        principal: ethers.formatEther(loanData[2]),
        collateral: ethers.formatEther(loanData[3]),
        startTimestamp: Number(loanData[4]),
        repaidAmount: ethers.formatEther(loanData[5]),
        lastPaymentTimestamp: Number(loanData[6]),
        status: this.mapLoanStatus(Number(loanData[7])),
        interestAccrued: ethers.formatEther(loanData[8]),
        isLiquidated: loanData[9],
        totalOwed: ethers.formatEther(totalOwed),
        interestOwed: ethers.formatEther(interestOwed),
        penaltyOwed: ethers.formatEther(penaltyOwed),
        daysRemaining,
        collateralRatio
      };
    } catch (error) {
      logger.error('Failed to get loan:', error);
      return null;
    }
  }

  /**
   * Check borrower eligibility
   */
  public async checkBorrowerEligibility(userAddress: string, loanTypeId: number): Promise<{ eligible: boolean; reason?: string }> {
    try {
      const loanTypes = await this.getAllLoanTypes();
      const loanType = loanTypes.find(lt => lt.id === loanTypeId);
      
      if (!loanType) {
        return { eligible: false, reason: 'Invalid loan type' };
      }

      if (!loanType.active) {
        return { eligible: false, reason: 'Loan type is not active' };
      }

      if (loanType.maxBorrowers > 0 && loanType.currentBorrowers >= loanType.maxBorrowers) {
        return { eligible: false, reason: 'Maximum borrowers reached for this loan type' };
      }

      if (loanType.requiresKYC) {
        // Check KYC status from database
        const { data: kycData } = await supabase
          .from('user_kyc')
          .select('verified')
          .eq('user_address', userAddress.toLowerCase())
          .single();

        if (!kycData?.verified) {
          return { eligible: false, reason: 'KYC verification required' };
        }
      }

      return { eligible: true };
    } catch (error) {
      logger.error('Failed to check borrower eligibility:', error);
      return { eligible: false, reason: 'Error checking eligibility' };
    }
  }

  /**
   * Calculate required collateral
   */
  public async calculateRequiredCollateral(loanAmount: string, collateralRatioBps: number): Promise<string> {
    try {
      const requiredCollateral = await this.contract.calculateRequiredCollateral(
        ethers.parseEther(loanAmount),
        collateralRatioBps
      );
      return ethers.formatEther(requiredCollateral);
    } catch (error) {
      logger.error('Failed to calculate required collateral:', error);
      throw new Error('Failed to calculate required collateral');
    }
  }

  /**
   * Set KYC verification status
   */
  public async setKYCVerified(userAddress: string, verified: boolean): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Loan Service not initialized');
    }

    try {
      const tx = await this.contract.setKYCVerified(userAddress, verified);
      await tx.wait();

      // Update database
      await supabase
        .from('user_kyc')
        .upsert({
          user_address: userAddress.toLowerCase(),
          verified: verified,
          updated_at: new Date().toISOString()
        });

      logger.info(`KYC status updated for ${userAddress}: ${verified}`);
    } catch (error) {
      logger.error('Failed to set KYC verification:', error);
      throw new Error('Failed to set KYC verification');
    }
  }

  /**
   * Update token prices
   */
  public async updateTokenPrices(prices: Record<string, string>): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Loan Service not initialized');
    }

    try {
      for (const [token, price] of Object.entries(prices)) {
        const tx = await this.contract.updateTokenPrice(token, ethers.parseEther(price));
        await tx.wait();
      }

      logger.info('Token prices updated');
    } catch (error) {
      logger.error('Failed to update token prices:', error);
      throw new Error('Failed to update token prices');
    }
  }

  /**
   * Log loan creation to database
   */
  private async logLoanCreation(
    loanId: number,
    loanTypeId: number,
    borrowerAddress: string,
    principal: string,
    collateral: string
  ): Promise<void> {
    try {
      await supabase
        .from('loan_logs')
        .insert([{
          loan_id: loanId,
          loan_type_id: loanTypeId,
          borrower_address: borrowerAddress.toLowerCase(),
          principal_amount: principal,
          collateral_amount: collateral,
          action: 'created',
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      logger.error('Failed to log loan creation:', error);
    }
  }

  /**
   * Log loan repayment to database
   */
  private async logLoanRepayment(loanId: number, amount: string): Promise<void> {
    try {
      await supabase
        .from('loan_logs')
        .insert([{
          loan_id: loanId,
          action: 'repaid',
          amount: amount,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      logger.error('Failed to log loan repayment:', error);
    }
  }

  /**
   * Log loan liquidation to database
   */
  private async logLoanLiquidation(loanId: number): Promise<void> {
    try {
      await supabase
        .from('loan_logs')
        .insert([{
          loan_id: loanId,
          action: 'liquidated',
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      logger.error('Failed to log loan liquidation:', error);
    }
  }

  /**
   * Map contract loan status to string
   */
  private mapLoanStatus(status: number): 'Active' | 'Repaid' | 'Liquidated' | 'Defaulted' | 'Cancelled' {
    switch (status) {
      case 0: return 'Active';
      case 1: return 'Repaid';
      case 2: return 'Liquidated';
      case 3: return 'Defaulted';
      case 4: return 'Cancelled';
      default: return 'Active';
    }
  }

  /**
   * Check if service is initialized
   */
  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get contract address
   */
  public getContractAddress(): string {
    if (!this.isInitialized) {
      throw new Error('Loan Service not initialized');
    }
    return this.contract.target as string;
  }
}

// Export singleton instance
export const loanService = LoanService.getInstance();


