import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface MarketplaceItem {
  itemId: string;
  nftContract: string;
  tokenId: string;
  seller: string;
  price: string;
  fiatPrice: string;
  isInAppItem: boolean;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface InAppItem {
  itemId: string;
  name: string;
  description: string;
  imageUrl: string;
  cryptoPrice: string;
  fiatPrice: string;
  maxSupply: number;
  currentSupply: number;
  isActive: boolean;
  creator: string;
}

export interface PaymentRequest {
  paymentId: string;
  buyer: string;
  fiatAmount: string;
  cryptoAmount: string;
  currency: string;
  stablecoin: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: number;
  completedAt?: number;
  lineTransactionId?: string;
}

export interface ExchangeRate {
  currency: string;
  rate: number;
  lastUpdated: number;
  isActive: boolean;
}

export interface LinePaymentConfig {
  apiEndpoint: string;
  merchantId: string;
  apiKey: string;
  webhookSecret: string;
}

export class MarketplaceService {
  private items: Map<string, MarketplaceItem> = new Map();
  private inAppItems: Map<string, InAppItem> = new Map();
  private payments: Map<string, PaymentRequest> = new Map();
  private exchangeRates: Map<string, ExchangeRate> = new Map();
  private lineConfig: LinePaymentConfig;

  constructor() {
    this.lineConfig = {
      apiEndpoint: process.env.LINE_PAYMENT_API_ENDPOINT || 'https://api.line.me/v2/payments',
      merchantId: process.env.LINE_MERCHANT_ID || '',
      apiKey: process.env.LINE_API_KEY || '',
      webhookSecret: process.env.LINE_WEBHOOK_SECRET || '',
    };

    this.initializeExchangeRates();
  }

  private initializeExchangeRates(): void {
    // Initialize default exchange rates
    this.exchangeRates.set('JPY', {
      currency: 'JPY',
      rate: 150000, // 1 JPY = 0.0067 USDT (approximate)
      lastUpdated: Date.now(),
      isActive: true,
    });

    this.exchangeRates.set('USD', {
      currency: 'USD',
      rate: 10000, // 1 USD = 1 USDT
      lastUpdated: Date.now(),
      isActive: true,
    });

    this.exchangeRates.set('KRW', {
      currency: 'KRW',
      rate: 120000, // 1 KRW = 0.0008 USDT (approximate)
      lastUpdated: Date.now(),
      isActive: true,
    });
  }

  // NFT Marketplace functions
  async listNFT(
    nftContract: string,
    tokenId: string,
    seller: string,
    price: string,
    fiatPrice: string,
    stablecoin: string
  ): Promise<MarketplaceItem> {
    const itemId = uuidv4();
    const item: MarketplaceItem = {
      itemId,
      nftContract,
      tokenId,
      seller,
      price,
      fiatPrice,
      isInAppItem: false,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.items.set(itemId, item);
    return item;
  }

  async buyNFT(
    itemId: string,
    buyer: string,
    stablecoin: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    const item = this.items.get(itemId);
    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    if (!item.isActive) {
      return { success: false, error: 'Item is not active' };
    }

    if (item.seller === buyer) {
      return { success: false, error: 'Cannot buy your own item' };
    }

    // In a real implementation, this would interact with the smart contract
    // For now, we'll simulate the transaction
    const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    // Update item status
    item.isActive = false;
    item.updatedAt = Date.now();

    return { success: true, transactionHash };
  }

  async cancelListing(itemId: string, seller: string): Promise<{ success: boolean; error?: string }> {
    const item = this.items.get(itemId);
    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    if (item.seller !== seller) {
      return { success: false, error: 'Not the item owner' };
    }

    if (!item.isActive) {
      return { success: false, error: 'Item is not active' };
    }

    item.isActive = false;
    item.updatedAt = Date.now();

    return { success: true };
  }

  async updatePrice(
    itemId: string,
    seller: string,
    newPrice: string,
    newFiatPrice: string
  ): Promise<{ success: boolean; error?: string }> {
    const item = this.items.get(itemId);
    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    if (item.seller !== seller) {
      return { success: false, error: 'Not the item owner' };
    }

    if (!item.isActive) {
      return { success: false, error: 'Item is not active' };
    }

    item.price = newPrice;
    item.fiatPrice = newFiatPrice;
    item.updatedAt = Date.now();

    return { success: true };
  }

  // In-app item functions
  async createInAppItem(
    name: string,
    description: string,
    imageUrl: string,
    cryptoPrice: string,
    fiatPrice: string,
    maxSupply: number,
    creator: string
  ): Promise<InAppItem> {
    const itemId = uuidv4();
    const item: InAppItem = {
      itemId,
      name,
      description,
      imageUrl,
      cryptoPrice,
      fiatPrice,
      maxSupply,
      currentSupply: 0,
      isActive: true,
      creator,
    };

    this.inAppItems.set(itemId, item);
    return item;
  }

  async purchaseInAppItemWithFiat(
    itemId: string,
    buyer: string,
    paymentId: string,
    stablecoin: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    const item = this.inAppItems.get(itemId);
    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    if (!item.isActive) {
      return { success: false, error: 'Item is not active' };
    }

    if (item.maxSupply > 0 && item.currentSupply >= item.maxSupply) {
      return { success: false, error: 'Item sold out' };
    }

    // Check if payment ID is already used
    if (this.payments.has(paymentId)) {
      return { success: false, error: 'Payment ID already used' };
    }

    // Create payment request
    const payment: PaymentRequest = {
      paymentId,
      buyer,
      fiatAmount: item.fiatPrice,
      cryptoAmount: item.cryptoPrice,
      currency: 'JPY', // Default currency
      stablecoin,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.payments.set(paymentId, payment);

    // Simulate LINE payment processing
    const result = await this.processLinePayment(paymentId);
    
    if (result.success) {
      item.currentSupply++;
      return { success: true, transactionHash: result.transactionHash };
    } else {
      return { success: false, error: result.error };
    }
  }

  async purchaseInAppItemWithCrypto(
    itemId: string,
    buyer: string,
    stablecoin: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    const item = this.inAppItems.get(itemId);
    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    if (!item.isActive) {
      return { success: false, error: 'Item is not active' };
    }

    if (item.maxSupply > 0 && item.currentSupply >= item.maxSupply) {
      return { success: false, error: 'Item sold out' };
    }

    // In a real implementation, this would interact with the smart contract
    const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    item.currentSupply++;

    return { success: true, transactionHash };
  }

  // LINE Payment functions
  async initiateLinePayment(
    buyer: string,
    fiatAmount: string,
    currency: string,
    stablecoin: string
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    const paymentId = uuidv4();
    
    // Calculate crypto amount based on exchange rate
    const exchangeRate = this.exchangeRates.get(currency);
    if (!exchangeRate || !exchangeRate.isActive) {
      return { success: false, error: 'Currency not supported' };
    }

    const cryptoAmount = this.calculateCryptoAmount(fiatAmount, currency);
    if (cryptoAmount <= 0) {
      return { success: false, error: 'Invalid crypto amount' };
    }

    const payment: PaymentRequest = {
      paymentId,
      buyer,
      fiatAmount,
      cryptoAmount: cryptoAmount.toString(),
      currency,
      stablecoin,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.payments.set(paymentId, payment);

    // In a real implementation, this would call LINE payment API
    const linePaymentResult = await this.callLinePaymentAPI(payment);
    
    if (linePaymentResult.success) {
      payment.status = 'processing';
      payment.lineTransactionId = linePaymentResult.transactionId;
      return { success: true, paymentId };
    } else {
      return { success: false, error: linePaymentResult.error };
    }
  }

  async processLinePayment(paymentId: string): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }

    if (payment.status !== 'pending' && payment.status !== 'processing') {
      return { success: false, error: 'Payment already processed' };
    }

    // Simulate LINE payment processing
    // In a real implementation, this would:
    // 1. Check LINE payment status
    // 2. Verify payment completion
    // 3. Transfer stablecoins to buyer
    
    payment.status = 'completed';
    payment.completedAt = Date.now();
    
    const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    return { success: true, transactionHash };
  }

  async handleLineWebhook(
    webhookData: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify webhook signature
      const isValidSignature = this.verifyWebhookSignature(webhookData);
      if (!isValidSignature) {
        return { success: false, error: 'Invalid webhook signature' };
      }

      const { paymentId, status, transactionId } = webhookData;
      const payment = this.payments.get(paymentId);
      
      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      if (status === 'completed') {
        payment.status = 'completed';
        payment.completedAt = Date.now();
        payment.lineTransactionId = transactionId;
      } else if (status === 'failed') {
        payment.status = 'failed';
        payment.completedAt = Date.now();
        payment.lineTransactionId = transactionId;
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Webhook processing failed' };
    }
  }

  // Exchange rate functions
  async updateExchangeRate(
    currency: string,
    rate: number
  ): Promise<{ success: boolean; error?: string }> {
    if (rate <= 0) {
      return { success: false, error: 'Invalid exchange rate' };
    }

    this.exchangeRates.set(currency, {
      currency,
      rate,
      lastUpdated: Date.now(),
      isActive: true,
    });

    return { success: true };
  }

  private calculateCryptoAmount(fiatAmount: string, currency: string): number {
    const exchangeRate = this.exchangeRates.get(currency);
    if (!exchangeRate || !exchangeRate.isActive) {
      return 0;
    }

    const fiat = parseFloat(fiatAmount);
    const baseAmount = (fiat * exchangeRate.rate) / 10000;
    const processingFee = (baseAmount * 100) / 10000; // 1% processing fee
    
    return baseAmount - processingFee;
  }

  private async callLinePaymentAPI(payment: PaymentRequest): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // In a real implementation, this would make an HTTP request to LINE payment API
      // For demo purposes, we'll simulate the response
      
      const response = {
        success: true,
        transactionId: `LINE_${payment.paymentId}`,
      };

      return response;
    } catch (error) {
      return { success: false, error: 'LINE payment API call failed' };
    }
  }

  private verifyWebhookSignature(webhookData: any): boolean {
    // In a real implementation, this would verify the webhook signature
    // For demo purposes, we'll always return true
    return true;
  }

  // View functions
  getItem(itemId: string): MarketplaceItem | undefined {
    return this.items.get(itemId);
  }

  getInAppItem(itemId: string): InAppItem | undefined {
    return this.inAppItems.get(itemId);
  }

  getPayment(paymentId: string): PaymentRequest | undefined {
    return this.payments.get(paymentId);
  }

  getExchangeRate(currency: string): ExchangeRate | undefined {
    return this.exchangeRates.get(currency);
  }

  getAllItems(): MarketplaceItem[] {
    return Array.from(this.items.values());
  }

  getAllInAppItems(): InAppItem[] {
    return Array.from(this.inAppItems.values());
  }

  getActiveItems(): MarketplaceItem[] {
    return Array.from(this.items.values()).filter(item => item.isActive);
  }

  getActiveInAppItems(): InAppItem[] {
    return Array.from(this.inAppItems.values()).filter(item => item.isActive);
  }

  getUserItems(userAddress: string): MarketplaceItem[] {
    return Array.from(this.items.values()).filter(item => item.seller === userAddress);
  }

  getUserInAppItems(userAddress: string): InAppItem[] {
    return Array.from(this.inAppItems.values()).filter(item => item.creator === userAddress);
  }

  getSupportedCurrencies(): string[] {
    return Array.from(this.exchangeRates.keys());
  }

  // Statistics
  getMarketplaceStats(): {
    totalItems: number;
    activeItems: number;
    totalInAppItems: number;
    activeInAppItems: number;
    totalVolume: string;
    totalFiatVolume: string;
  } {
    const allItems = this.getAllItems();
    const allInAppItems = this.getAllInAppItems();
    
    const totalVolume = allItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
    const totalFiatVolume = allItems.reduce((sum, item) => sum + parseFloat(item.fiatPrice), 0);

    return {
      totalItems: allItems.length,
      activeItems: allItems.filter(item => item.isActive).length,
      totalInAppItems: allInAppItems.length,
      activeInAppItems: allInAppItems.filter(item => item.isActive).length,
      totalVolume: totalVolume.toString(),
      totalFiatVolume: totalFiatVolume.toString(),
    };
  }
}

