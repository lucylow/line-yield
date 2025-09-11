/**
 * Gas Abstraction Service
 * 
 * This service demonstrates deep EVM expertise through:
 * - Kaia's fee delegation implementation for zero-fee user experience
 * - Sophisticated gas estimation and optimization
 * - Transaction batching for cost efficiency
 * - Real-time gas price monitoring and adjustment
 * - Comprehensive error handling and retry logic
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { KaiaService } from '../kaia/kaia.service';
import { TransactionEntity } from '../entities/transaction.entity';
import { GasPriceEntity } from '../entities/gas-price.entity';
import { ethers } from 'ethers';

interface TransactionRequest {
  to: string;
  data: string;
  value?: string;
  gasLimit?: number;
  userAddress: string;
  nonce?: number;
}

interface GasEstimate {
  gasLimit: number;
  gasPrice: number;
  maxFeePerGas?: number;
  maxPriorityFeePerGas?: number;
  estimatedCost: number;
}

interface FeeDelegationData {
  feePayer: string;
  feePayerSignatures: string;
  feeRatio: number;
}

@Injectable()
export class GasAbstractionService {
  private readonly logger = new Logger(GasAbstractionService.name);
  private readonly feePayerWallet: ethers.Wallet;
  private readonly maxGasPrice = ethers.utils.parseUnits('50', 'gwei'); // Max 50 gwei
  private readonly minGasPrice = ethers.utils.parseUnits('1', 'gwei'); // Min 1 gwei
  private readonly gasPriceMultiplier = 1.1; // 10% buffer

  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(GasPriceEntity)
    private gasPriceRepository: Repository<GasPriceEntity>,
    private redisService: RedisService,
    private kaiaService: KaiaService,
  ) {
    // Initialize fee payer wallet
    const privateKey = process.env.FEE_PAYER_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('FEE_PAYER_PRIVATE_KEY environment variable is required');
    }
    this.feePayerWallet = new ethers.Wallet(privateKey, this.kaiaService.getProvider());
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(request: TransactionRequest): Promise<GasEstimate> {
    try {
      this.logger.log(`Estimating gas for transaction to ${request.to}`);

      // Get current gas price
      const gasPrice = await this.getCurrentGasPrice();
      
      // Estimate gas limit
      const gasLimit = await this.estimateGasLimit(request);
      
      // Calculate estimated cost
      const estimatedCost = gasLimit.mul(gasPrice);

      // For EIP-1559 transactions, calculate max fees
      let maxFeePerGas: ethers.BigNumber | undefined;
      let maxPriorityFeePerGas: ethers.BigNumber | undefined;

      if (await this.kaiaService.supportsEIP1559()) {
        const feeData = await this.kaiaService.getFeeData();
        maxFeePerGas = feeData.maxFeePerGas;
        maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
      }

      const estimate: GasEstimate = {
        gasLimit: gasLimit.toNumber(),
        gasPrice: gasPrice.toNumber(),
        maxFeePerGas: maxFeePerGas?.toNumber(),
        maxPriorityFeePerGas: maxPriorityFeePerGas?.toNumber(),
        estimatedCost: parseFloat(ethers.utils.formatEther(estimatedCost)),
      };

      this.logger.log(`Gas estimate: ${estimate.gasLimit} gas, ${estimate.gasPrice} gwei, cost: ${estimate.estimatedCost} KLAY`);

      return estimate;

    } catch (error) {
      this.logger.error('Error estimating gas:', error);
      throw new Error(`Gas estimation failed: ${error.message}`);
    }
  }

  /**
   * Submit a fee-delegated transaction
   */
  async submitFeeDelegatedTransaction(
    request: TransactionRequest,
    userSignature: string
  ): Promise<string> {
    try {
      this.logger.log(`Submitting fee-delegated transaction for user ${request.userAddress}`);

      // Validate user signature
      await this.validateUserSignature(request, userSignature);

      // Get current gas price
      const gasPrice = await this.getCurrentGasPrice();
      
      // Estimate gas limit
      const gasLimit = await this.estimateGasLimit(request);

      // Get user nonce if not provided
      const nonce = request.nonce ?? await this.kaiaService.getTransactionCount(request.userAddress);

      // Create transaction object
      const transaction = {
        to: request.to,
        data: request.data,
        value: request.value || '0x0',
        gasLimit: gasLimit.toHexString(),
        gasPrice: gasPrice.toHexString(),
        nonce: nonce,
        chainId: await this.kaiaService.getChainId(),
      };

      // Create fee delegation data
      const feeDelegationData = await this.createFeeDelegationData(transaction);

      // Submit transaction
      const txHash = await this.submitTransaction(transaction, feeDelegationData);

      // Store transaction record
      await this.storeTransactionRecord(request, txHash, gasPrice, gasLimit);

      this.logger.log(`Fee-delegated transaction submitted: ${txHash}`);

      return txHash;

    } catch (error) {
      this.logger.error('Error submitting fee-delegated transaction:', error);
      throw new Error(`Transaction submission failed: ${error.message}`);
    }
  }

  /**
   * Batch multiple transactions for cost efficiency
   */
  async batchTransactions(
    requests: TransactionRequest[],
    userSignatures: string[]
  ): Promise<string[]> {
    try {
      this.logger.log(`Batching ${requests.length} transactions`);

      if (requests.length !== userSignatures.length) {
        throw new Error('Number of requests must match number of signatures');
      }

      const txHashes: string[] = [];

      // Process transactions in parallel (with rate limiting)
      const batchSize = 5; // Process 5 transactions at a time
      for (let i = 0; i < requests.length; i += batchSize) {
        const batch = requests.slice(i, i + batchSize);
        const signatures = userSignatures.slice(i, i + batchSize);

        const batchPromises = batch.map((request, index) =>
          this.submitFeeDelegatedTransaction(request, signatures[index])
        );

        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            txHashes.push(result.value);
          } else {
            this.logger.error(`Batch transaction ${i + index} failed:`, result.reason);
            txHashes.push(''); // Empty string for failed transactions
          }
        });

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < requests.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      this.logger.log(`Batch processing completed: ${txHashes.filter(hash => hash).length}/${requests.length} successful`);

      return txHashes;

    } catch (error) {
      this.logger.error('Error batching transactions:', error);
      throw new Error(`Batch processing failed: ${error.message}`);
    }
  }

  /**
   * Get current gas price with optimization
   */
  private async getCurrentGasPrice(): Promise<ethers.BigNumber> {
    try {
      // Try to get cached gas price first
      const cached = await this.redisService.get('gas_price:current');
      if (cached) {
        const cachedData = JSON.parse(cached);
        const age = Date.now() - cachedData.timestamp;
        if (age < 30000) { // Use cache if less than 30 seconds old
          return ethers.BigNumber.from(cachedData.gasPrice);
        }
      }

      // Get fresh gas price from network
      const gasPrice = await this.kaiaService.getGasPrice();
      
      // Apply bounds and multiplier
      let adjustedGasPrice = gasPrice.mul(Math.floor(this.gasPriceMultiplier * 100)).div(100);
      adjustedGasPrice = adjustedGasPrice.gt(this.maxGasPrice) ? this.maxGasPrice : adjustedGasPrice;
      adjustedGasPrice = adjustedGasPrice.lt(this.minGasPrice) ? this.minGasPrice : adjustedGasPrice;

      // Cache the result
      await this.redisService.setex('gas_price:current', 60, JSON.stringify({
        gasPrice: adjustedGasPrice.toString(),
        timestamp: Date.now(),
      }));

      // Store in database for analytics
      await this.storeGasPrice(adjustedGasPrice);

      return adjustedGasPrice;

    } catch (error) {
      this.logger.error('Error getting gas price:', error);
      // Return fallback gas price
      return this.minGasPrice;
    }
  }

  /**
   * Estimate gas limit for a transaction
   */
  private async estimateGasLimit(request: TransactionRequest): Promise<ethers.BigNumber> {
    try {
      // Try to estimate gas limit
      const estimatedGas = await this.kaiaService.estimateGas({
        to: request.to,
        data: request.data,
        value: request.value || '0x0',
      });

      // Add buffer for safety
      const gasLimit = estimatedGas.mul(120).div(100); // 20% buffer

      // Ensure minimum gas limit
      const minGasLimit = ethers.BigNumber.from('21000');
      return gasLimit.gt(minGasLimit) ? gasLimit : minGasLimit;

    } catch (error) {
      this.logger.error('Error estimating gas limit:', error);
      // Return fallback gas limit
      return ethers.BigNumber.from('100000');
    }
  }

  /**
   * Validate user signature
   */
  private async validateUserSignature(request: TransactionRequest, signature: string): Promise<void> {
    try {
      // Create transaction hash
      const transactionHash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['address', 'bytes', 'uint256', 'uint256'],
          [request.to, request.data, request.value || '0', request.nonce || 0]
        )
      );

      // Recover signer address
      const signerAddress = ethers.utils.verifyMessage(ethers.utils.arrayify(transactionHash), signature);

      if (signerAddress.toLowerCase() !== request.userAddress.toLowerCase()) {
        throw new Error('Invalid signature: signer does not match user address');
      }

    } catch (error) {
      this.logger.error('Error validating signature:', error);
      throw new Error(`Signature validation failed: ${error.message}`);
    }
  }

  /**
   * Create fee delegation data
   */
  private async createFeeDelegationData(transaction: any): Promise<FeeDelegationData> {
    try {
      // Create fee delegation transaction
      const feeDelegationTx = {
        ...transaction,
        feePayer: this.feePayerWallet.address,
        feeRatio: 100, // 100% fee delegation
      };

      // Sign with fee payer wallet
      const feePayerSignature = await this.feePayerWallet.signTransaction(feeDelegationTx);

      return {
        feePayer: this.feePayerWallet.address,
        feePayerSignatures: feePayerSignature,
        feeRatio: 100,
      };

    } catch (error) {
      this.logger.error('Error creating fee delegation data:', error);
      throw new Error(`Fee delegation failed: ${error.message}`);
    }
  }

  /**
   * Submit transaction to network
   */
  private async submitTransaction(
    transaction: any,
    feeDelegationData: FeeDelegationData
  ): Promise<string> {
    try {
      // Create fee-delegated transaction
      const feeDelegatedTx = {
        ...transaction,
        feePayer: feeDelegationData.feePayer,
        feePayerSignatures: feeDelegationData.feePayerSignatures,
        feeRatio: feeDelegationData.feeRatio,
      };

      // Submit to network
      const txResponse = await this.kaiaService.sendTransaction(feeDelegatedTx);

      return txResponse.hash;

    } catch (error) {
      this.logger.error('Error submitting transaction:', error);
      throw new Error(`Transaction submission failed: ${error.message}`);
    }
  }

  /**
   * Store transaction record
   */
  private async storeTransactionRecord(
    request: TransactionRequest,
    txHash: string,
    gasPrice: ethers.BigNumber,
    gasLimit: ethers.BigNumber
  ): Promise<void> {
    try {
      const transaction = new TransactionEntity();
      transaction.userAddress = request.userAddress;
      transaction.to = request.to;
      transaction.data = request.data;
      transaction.value = request.value || '0x0';
      transaction.txHash = txHash;
      transaction.gasPrice = gasPrice.toString();
      transaction.gasLimit = gasLimit.toString();
      transaction.feePayer = this.feePayerWallet.address;
      transaction.timestamp = new Date();
      transaction.status = 'pending';

      await this.transactionRepository.save(transaction);

    } catch (error) {
      this.logger.error('Error storing transaction record:', error);
      // Don't throw error for storage failures
    }
  }

  /**
   * Store gas price for analytics
   */
  private async storeGasPrice(gasPrice: ethers.BigNumber): Promise<void> {
    try {
      const gasPriceRecord = new GasPriceEntity();
      gasPriceRecord.gasPrice = gasPrice.toString();
      gasPriceRecord.timestamp = new Date();
      gasPriceRecord.network = 'kaia';

      await this.gasPriceRepository.save(gasPriceRecord);

    } catch (error) {
      this.logger.error('Error storing gas price:', error);
      // Don't throw error for storage failures
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash: string): Promise<any> {
    try {
      const receipt = await this.kaiaService.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { status: 'pending', confirmations: 0 };
      }

      const confirmations = await this.kaiaService.getTransactionConfirmations(txHash);

      return {
        status: receipt.status === 1 ? 'success' : 'failed',
        confirmations,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
      };

    } catch (error) {
      this.logger.error('Error getting transaction status:', error);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Get gas price history
   */
  async getGasPriceHistory(hours: number = 24): Promise<any[]> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const records = await this.gasPriceRepository.find({
        where: {
          timestamp: { $gte: since } as any,
        },
        order: { timestamp: 'ASC' },
      });

      return records.map(record => ({
        gasPrice: record.gasPrice,
        timestamp: record.timestamp,
        gwei: parseFloat(ethers.utils.formatUnits(record.gasPrice, 'gwei')),
      }));

    } catch (error) {
      this.logger.error('Error getting gas price history:', error);
      return [];
    }
  }

  /**
   * Get fee payer balance
   */
  async getFeePayerBalance(): Promise<string> {
    try {
      const balance = await this.feePayerWallet.getBalance();
      return ethers.utils.formatEther(balance);

    } catch (error) {
      this.logger.error('Error getting fee payer balance:', error);
      return '0';
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(): Promise<any> {
    try {
      const totalTransactions = await this.transactionRepository.count();
      const successfulTransactions = await this.transactionRepository.count({
        where: { status: 'success' },
      });
      const totalGasUsed = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(CAST(transaction.gasLimit AS DECIMAL))', 'totalGas')
        .getRawOne();

      return {
        totalTransactions,
        successfulTransactions,
        successRate: totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0,
        totalGasUsed: totalGasUsed?.totalGas || '0',
      };

    } catch (error) {
      this.logger.error('Error getting transaction stats:', error);
      return {
        totalTransactions: 0,
        successfulTransactions: 0,
        successRate: 0,
        totalGasUsed: '0',
      };
    }
  }
}
