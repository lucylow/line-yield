import { Logger } from '../utils/logger';

// Supported languages
export type SupportedLanguage = 'en' | 'ja';

// Language detection methods
export type LanguageDetectionMethod = 'browser' | 'ip' | 'manual';

// Translation keys interface
export interface TranslationKeys {
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    sort: string;
    refresh: string;
    retry: string;
    close: string;
    open: string;
    yes: string;
    no: string;
    ok: string;
    signIn: string;
    signOut: string;
    language: string;
    browser: string;
    ip: string;
    manual: string;
    browserDetection: string;
    ipDetection: string;
    manualSelection: string;
    detectionMethod: string;
  };
  
  // API Messages
  api: {
    welcome: string;
    healthCheck: string;
    serviceRunning: string;
    endpointNotFound: string;
    methodNotAllowed: string;
    validationError: string;
    authenticationRequired: string;
    insufficientPermissions: string;
    rateLimitExceeded: string;
    serverError: string;
    maintenanceMode: string;
  };
  
  // Wallet
  wallet: {
    connect: string;
    disconnect: string;
    connected: string;
    connecting: string;
    balance: string;
    address: string;
    network: string;
    switchNetwork: string;
    addToken: string;
    copyAddress: string;
    viewOnExplorer: string;
    transactionSubmitted: string;
    transactionConfirmed: string;
    transactionFailed: string;
    insufficientBalance: string;
    networkError: string;
  };
  
  // NFT Collateral
  nftCollateral: {
    title: string;
    description: string;
    depositNft: string;
    borrowStablecoin: string;
    loanToValue: string;
    interestRate: string;
    collateralValue: string;
    borrowedAmount: string;
    availableToBorrow: string;
    liquidationThreshold: string;
    healthFactor: string;
    repayLoan: string;
    withdrawCollateral: string;
    selectNft: string;
    nftDetails: string;
    estimatedValue: string;
    maxBorrowAmount: string;
    currentDebt: string;
    interestAccrued: string;
    timeToLiquidation: string;
    liquidationPrice: string;
    positionCreated: string;
    positionUpdated: string;
    positionClosed: string;
    liquidationTriggered: string;
  };
  
  // Marketplace
  marketplace: {
    title: string;
    description: string;
    browseNfts: string;
    buyNft: string;
    sellNft: string;
    listNft: string;
    price: string;
    highestBid: string;
    timeLeft: string;
    category: string;
    rarity: string;
    collection: string;
    creator: string;
    owner: string;
    viewDetails: string;
    makeOffer: string;
    acceptOffer: string;
    rejectOffer: string;
    placeBid: string;
    buyNow: string;
    auctionEnds: string;
    reservePrice: string;
    currentBid: string;
    bidHistory: string;
    similarItems: string;
    listingCreated: string;
    listingUpdated: string;
    listingCancelled: string;
    purchaseCompleted: string;
    offerSubmitted: string;
    offerAccepted: string;
    offerRejected: string;
  };
  
  // QR Payment
  qrPayment: {
    title: string;
    description: string;
    generateQr: string;
    scanQr: string;
    paymentAmount: string;
    paymentDescription: string;
    paymentStatus: string;
    waitingForPayment: string;
    paymentReceived: string;
    paymentFailed: string;
    paymentExpired: string;
    paymentCancelled: string;
    paymentPending: string;
    paymentConfirmed: string;
    paymentId: string;
    transactionHash: string;
    paymentMethod: string;
    processingTime: string;
    refundPolicy: string;
    contactSupport: string;
    sessionCreated: string;
    sessionExpired: string;
    sessionCancelled: string;
    paymentProcessed: string;
  };
  
  // Errors
  errors: {
    networkError: string;
    walletNotConnected: string;
    insufficientBalance: string;
    transactionFailed: string;
    transactionRejected: string;
    invalidAddress: string;
    invalidAmount: string;
    nftNotFound: string;
    paymentFailed: string;
    serverError: string;
    unknownError: string;
    tryAgain: string;
    contactSupport: string;
    validationFailed: string;
    authenticationFailed: string;
    authorizationFailed: string;
    resourceNotFound: string;
    conflictError: string;
    timeoutError: string;
  };
  
  // Success messages
  success: {
    walletConnected: string;
    transactionSubmitted: string;
    transactionConfirmed: string;
    nftDeposited: string;
    loanCreated: string;
    loanRepaid: string;
    nftPurchased: string;
    nftListed: string;
    paymentReceived: string;
    settingsSaved: string;
    profileUpdated: string;
    dataRetrieved: string;
    operationCompleted: string;
  };
}

// Translation data
const translations: Record<SupportedLanguage, TranslationKeys> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      refresh: 'Refresh',
      retry: 'Retry',
      close: 'Close',
      open: 'Open',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      language: 'Language',
      browser: 'Browser',
      ip: 'IP',
      manual: 'Manual',
      browserDetection: 'Detect from browser settings',
      ipDetection: 'Detect from IP location',
      manualSelection: 'Manual selection',
      detectionMethod: 'Detection Method',
    },
    api: {
      welcome: 'Welcome to LINE Yield API',
      healthCheck: 'Health check endpoint',
      serviceRunning: 'Service is running',
      endpointNotFound: 'API endpoint not found',
      methodNotAllowed: 'Method not allowed',
      validationError: 'Validation error',
      authenticationRequired: 'Authentication required',
      insufficientPermissions: 'Insufficient permissions',
      rateLimitExceeded: 'Rate limit exceeded',
      serverError: 'Internal server error',
      maintenanceMode: 'Service is under maintenance',
    },
    wallet: {
      connect: 'Connect Wallet',
      disconnect: 'Disconnect',
      connected: 'Connected',
      connecting: 'Connecting...',
      balance: 'Balance',
      address: 'Address',
      network: 'Network',
      switchNetwork: 'Switch Network',
      addToken: 'Add Token',
      copyAddress: 'Copy Address',
      viewOnExplorer: 'View on Explorer',
      transactionSubmitted: 'Transaction submitted successfully',
      transactionConfirmed: 'Transaction confirmed',
      transactionFailed: 'Transaction failed',
      insufficientBalance: 'Insufficient balance',
      networkError: 'Network error',
    },
    nftCollateral: {
      title: 'NFT Collateral',
      description: 'Use your NFTs as collateral to borrow stablecoins with competitive rates.',
      depositNft: 'Deposit NFT',
      borrowStablecoin: 'Borrow Stablecoin',
      loanToValue: 'Loan-to-Value',
      interestRate: 'Interest Rate',
      collateralValue: 'Collateral Value',
      borrowedAmount: 'Borrowed Amount',
      availableToBorrow: 'Available to Borrow',
      liquidationThreshold: 'Liquidation Threshold',
      healthFactor: 'Health Factor',
      repayLoan: 'Repay Loan',
      withdrawCollateral: 'Withdraw Collateral',
      selectNft: 'Select NFT',
      nftDetails: 'NFT Details',
      estimatedValue: 'Estimated Value',
      maxBorrowAmount: 'Max Borrow Amount',
      currentDebt: 'Current Debt',
      interestAccrued: 'Interest Accrued',
      timeToLiquidation: 'Time to Liquidation',
      liquidationPrice: 'Liquidation Price',
      positionCreated: 'Collateral position created successfully',
      positionUpdated: 'Collateral position updated successfully',
      positionClosed: 'Collateral position closed successfully',
      liquidationTriggered: 'Liquidation triggered',
    },
    marketplace: {
      title: 'NFT Marketplace',
      description: 'Discover, buy, and sell NFTs in our marketplace.',
      browseNfts: 'Browse NFTs',
      buyNft: 'Buy NFT',
      sellNft: 'Sell NFT',
      listNft: 'List NFT',
      price: 'Price',
      highestBid: 'Highest Bid',
      timeLeft: 'Time Left',
      category: 'Category',
      rarity: 'Rarity',
      collection: 'Collection',
      creator: 'Creator',
      owner: 'Owner',
      viewDetails: 'View Details',
      makeOffer: 'Make Offer',
      acceptOffer: 'Accept Offer',
      rejectOffer: 'Reject Offer',
      placeBid: 'Place Bid',
      buyNow: 'Buy Now',
      auctionEnds: 'Auction Ends',
      reservePrice: 'Reserve Price',
      currentBid: 'Current Bid',
      bidHistory: 'Bid History',
      similarItems: 'Similar Items',
      listingCreated: 'NFT listing created successfully',
      listingUpdated: 'NFT listing updated successfully',
      listingCancelled: 'NFT listing cancelled successfully',
      purchaseCompleted: 'Purchase completed successfully',
      offerSubmitted: 'Offer submitted successfully',
      offerAccepted: 'Offer accepted successfully',
      offerRejected: 'Offer rejected successfully',
    },
    qrPayment: {
      title: 'QR Code Payment',
      description: 'Generate QR codes for easy payments.',
      generateQr: 'Generate QR Code',
      scanQr: 'Scan QR Code',
      paymentAmount: 'Payment Amount',
      paymentDescription: 'Payment Description',
      paymentStatus: 'Payment Status',
      waitingForPayment: 'Waiting for Payment',
      paymentReceived: 'Payment Received',
      paymentFailed: 'Payment Failed',
      paymentExpired: 'Payment Expired',
      paymentCancelled: 'Payment Cancelled',
      paymentPending: 'Payment Pending',
      paymentConfirmed: 'Payment Confirmed',
      paymentId: 'Payment ID',
      transactionHash: 'Transaction Hash',
      paymentMethod: 'Payment Method',
      processingTime: 'Processing Time',
      refundPolicy: 'Refund Policy',
      contactSupport: 'Contact Support',
      sessionCreated: 'Payment session created successfully',
      sessionExpired: 'Payment session expired',
      sessionCancelled: 'Payment session cancelled',
      paymentProcessed: 'Payment processed successfully',
    },
    errors: {
      networkError: 'Network error. Please check your connection.',
      walletNotConnected: 'Wallet not connected. Please connect your wallet.',
      insufficientBalance: 'Insufficient balance for this transaction.',
      transactionFailed: 'Transaction failed. Please try again.',
      transactionRejected: 'Transaction rejected by user.',
      invalidAddress: 'Invalid address provided.',
      invalidAmount: 'Invalid amount provided.',
      nftNotFound: 'NFT not found.',
      paymentFailed: 'Payment failed. Please try again.',
      serverError: 'Server error. Please try again later.',
      unknownError: 'An unknown error occurred.',
      tryAgain: 'Try Again',
      contactSupport: 'Contact Support',
      validationFailed: 'Validation failed',
      authenticationFailed: 'Authentication failed',
      authorizationFailed: 'Authorization failed',
      resourceNotFound: 'Resource not found',
      conflictError: 'Conflict error',
      timeoutError: 'Request timeout',
    },
    success: {
      walletConnected: 'Wallet connected successfully!',
      transactionSubmitted: 'Transaction submitted successfully!',
      transactionConfirmed: 'Transaction confirmed!',
      nftDeposited: 'NFT deposited successfully!',
      loanCreated: 'Loan created successfully!',
      loanRepaid: 'Loan repaid successfully!',
      nftPurchased: 'NFT purchased successfully!',
      nftListed: 'NFT listed successfully!',
      paymentReceived: 'Payment received successfully!',
      settingsSaved: 'Settings saved successfully!',
      profileUpdated: 'Profile updated successfully!',
      dataRetrieved: 'Data retrieved successfully!',
      operationCompleted: 'Operation completed successfully!',
    },
  },
  ja: {
    common: {
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
      cancel: 'キャンセル',
      confirm: '確認',
      save: '保存',
      delete: '削除',
      edit: '編集',
      back: '戻る',
      next: '次へ',
      previous: '前へ',
      search: '検索',
      filter: 'フィルター',
      sort: '並び替え',
      refresh: '更新',
      retry: '再試行',
      close: '閉じる',
      open: '開く',
      yes: 'はい',
      no: 'いいえ',
      ok: 'OK',
      signIn: 'サインイン',
      signOut: 'サインアウト',
      language: '言語',
      browser: 'ブラウザ',
      ip: 'IP',
      manual: '手動',
      browserDetection: 'ブラウザ設定から検出',
      ipDetection: 'IP位置から検出',
      manualSelection: '手動選択',
      detectionMethod: '検出方法',
    },
    api: {
      welcome: 'LINE Yield APIへようこそ',
      healthCheck: 'ヘルスチェックエンドポイント',
      serviceRunning: 'サービスが稼働中です',
      endpointNotFound: 'APIエンドポイントが見つかりません',
      methodNotAllowed: 'メソッドが許可されていません',
      validationError: 'バリデーションエラー',
      authenticationRequired: '認証が必要です',
      insufficientPermissions: '権限が不足しています',
      rateLimitExceeded: 'レート制限を超過しました',
      serverError: '内部サーバーエラー',
      maintenanceMode: 'サービスはメンテナンス中です',
    },
    wallet: {
      connect: 'ウォレット接続',
      disconnect: '切断',
      connected: '接続済み',
      connecting: '接続中...',
      balance: '残高',
      address: 'アドレス',
      network: 'ネットワーク',
      switchNetwork: 'ネットワーク切り替え',
      addToken: 'トークン追加',
      copyAddress: 'アドレスコピー',
      viewOnExplorer: 'エクスプローラーで表示',
      transactionSubmitted: 'トランザクションが正常に送信されました',
      transactionConfirmed: 'トランザクションが確認されました',
      transactionFailed: 'トランザクションが失敗しました',
      insufficientBalance: '残高不足',
      networkError: 'ネットワークエラー',
    },
    nftCollateral: {
      title: 'NFT担保',
      description: 'NFTを担保として使用し、競争力のある金利でステーブルコインを借り入れできます。',
      depositNft: 'NFT入金',
      borrowStablecoin: 'ステーブルコイン借入',
      loanToValue: 'ローン・トゥ・バリュー',
      interestRate: '金利',
      collateralValue: '担保価値',
      borrowedAmount: '借入金額',
      availableToBorrow: '借入可能額',
      liquidationThreshold: '清算閾値',
      healthFactor: 'ヘルスファクター',
      repayLoan: 'ローン返済',
      withdrawCollateral: '担保引き出し',
      selectNft: 'NFT選択',
      nftDetails: 'NFT詳細',
      estimatedValue: '推定価値',
      maxBorrowAmount: '最大借入額',
      currentDebt: '現在の債務',
      interestAccrued: '発生利息',
      timeToLiquidation: '清算までの時間',
      liquidationPrice: '清算価格',
      positionCreated: '担保ポジションが正常に作成されました',
      positionUpdated: '担保ポジションが正常に更新されました',
      positionClosed: '担保ポジションが正常に閉じられました',
      liquidationTriggered: '清算が実行されました',
    },
    marketplace: {
      title: 'NFTマーケットプレイス',
      description: 'マーケットプレイスでNFTを発見、購入、販売しましょう。',
      browseNfts: 'NFTを閲覧',
      buyNft: 'NFT購入',
      sellNft: 'NFT販売',
      listNft: 'NFT出品',
      price: '価格',
      highestBid: '最高入札',
      timeLeft: '残り時間',
      category: 'カテゴリー',
      rarity: 'レアリティ',
      collection: 'コレクション',
      creator: 'クリエイター',
      owner: 'オーナー',
      viewDetails: '詳細を見る',
      makeOffer: 'オファー作成',
      acceptOffer: 'オファー承認',
      rejectOffer: 'オファー拒否',
      placeBid: '入札',
      buyNow: '今すぐ購入',
      auctionEnds: 'オークション終了',
      reservePrice: '最低価格',
      currentBid: '現在の入札',
      bidHistory: '入札履歴',
      similarItems: '類似アイテム',
      listingCreated: 'NFT出品が正常に作成されました',
      listingUpdated: 'NFT出品が正常に更新されました',
      listingCancelled: 'NFT出品が正常にキャンセルされました',
      purchaseCompleted: '購入が正常に完了しました',
      offerSubmitted: 'オファーが正常に送信されました',
      offerAccepted: 'オファーが正常に承認されました',
      offerRejected: 'オファーが正常に拒否されました',
    },
    qrPayment: {
      title: 'QRコード決済',
      description: '簡単な決済のためのQRコードを生成します。',
      generateQr: 'QRコード生成',
      scanQr: 'QRコードスキャン',
      paymentAmount: '決済金額',
      paymentDescription: '決済説明',
      paymentStatus: '決済ステータス',
      waitingForPayment: '決済待機中',
      paymentReceived: '決済受領済み',
      paymentFailed: '決済失敗',
      paymentExpired: '決済期限切れ',
      paymentCancelled: '決済キャンセル',
      paymentPending: '決済処理中',
      paymentConfirmed: '決済確認済み',
      paymentId: '決済ID',
      transactionHash: 'トランザクションハッシュ',
      paymentMethod: '決済方法',
      processingTime: '処理時間',
      refundPolicy: '返金ポリシー',
      contactSupport: 'サポートに連絡',
      sessionCreated: '決済セッションが正常に作成されました',
      sessionExpired: '決済セッションが期限切れです',
      sessionCancelled: '決済セッションがキャンセルされました',
      paymentProcessed: '決済が正常に処理されました',
    },
    errors: {
      networkError: 'ネットワークエラー。接続を確認してください。',
      walletNotConnected: 'ウォレットが接続されていません。ウォレットを接続してください。',
      insufficientBalance: 'この取引に十分な残高がありません。',
      transactionFailed: '取引が失敗しました。再試行してください。',
      transactionRejected: '取引がユーザーによって拒否されました。',
      invalidAddress: '無効なアドレスが提供されました。',
      invalidAmount: '無効な金額が提供されました。',
      nftNotFound: 'NFTが見つかりません。',
      paymentFailed: '決済が失敗しました。再試行してください。',
      serverError: 'サーバーエラー。後でもう一度お試しください。',
      unknownError: '不明なエラーが発生しました。',
      tryAgain: '再試行',
      contactSupport: 'サポートに連絡',
      validationFailed: 'バリデーションに失敗しました',
      authenticationFailed: '認証に失敗しました',
      authorizationFailed: '認可に失敗しました',
      resourceNotFound: 'リソースが見つかりません',
      conflictError: '競合エラー',
      timeoutError: 'リクエストタイムアウト',
    },
    success: {
      walletConnected: 'ウォレットが正常に接続されました！',
      transactionSubmitted: 'トランザクションが正常に送信されました！',
      transactionConfirmed: 'トランザクションが確認されました！',
      nftDeposited: 'NFTが正常に入金されました！',
      loanCreated: 'ローンが正常に作成されました！',
      loanRepaid: 'ローンが正常に返済されました！',
      nftPurchased: 'NFTが正常に購入されました！',
      nftListed: 'NFTが正常に出品されました！',
      paymentReceived: '決済が正常に受領されました！',
      settingsSaved: '設定が正常に保存されました！',
      profileUpdated: 'プロフィールが正常に更新されました！',
      dataRetrieved: 'データが正常に取得されました！',
      operationCompleted: '操作が正常に完了しました！',
    },
  },
};

// Language detection utilities
export const detectLanguageFromBrowser = (acceptLanguage?: string): SupportedLanguage => {
  if (!acceptLanguage) {
    return 'en';
  }
  
  // Check for Japanese
  if (acceptLanguage.includes('ja')) {
    return 'ja';
  }
  
  // Default to English
  return 'en';
};

export const detectLanguageFromIP = async (ip?: string): Promise<SupportedLanguage> => {
  try {
    if (!ip) {
      return 'en';
    }
    
    // Use a free IP geolocation service
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    
    // Check if country is Japan
    if (data.country_code === 'JP') {
      return 'ja';
    }
    
    return 'en';
  } catch (error) {
    Logger.warn('Failed to detect language from IP:', error);
    return 'en'; // Fallback to English
  }
};

// Localization service class
export class LocalizationService {
  private static instance: LocalizationService;
  private currentLanguage: SupportedLanguage = 'en';

  private constructor() {}

  public static getInstance(): LocalizationService {
    if (!LocalizationService.instance) {
      LocalizationService.instance = new LocalizationService();
    }
    return LocalizationService.instance;
  }

  public setLanguage(language: SupportedLanguage): void {
    this.currentLanguage = language;
  }

  public getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  public translate(key: string): string {
    const keys = key.split('.');
    let value: any = translations[this.currentLanguage];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key; // Return key if translation not found
  }

  public async detectLanguage(
    acceptLanguage?: string,
    ip?: string,
    method: LanguageDetectionMethod = 'browser'
  ): Promise<SupportedLanguage> {
    try {
      switch (method) {
        case 'ip':
          return await detectLanguageFromIP(ip);
        case 'browser':
        default:
          return detectLanguageFromBrowser(acceptLanguage);
      }
    } catch (error) {
      Logger.warn('Language detection failed:', error);
      return 'en'; // Fallback to English
    }
  }

  public getTranslations(): TranslationKeys {
    return translations[this.currentLanguage];
  }

  public getSupportedLanguages(): SupportedLanguage[] {
    return ['en', 'ja'];
  }
}

export default LocalizationService;
