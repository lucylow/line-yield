import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  };
  
  // Navigation
  navigation: {
    home: string;
    dashboard: string;
    portfolio: string;
    marketplace: string;
    nftCollateral: string;
    referral: string;
    rewards: string;
    settings: string;
    profile: string;
    help: string;
    about: string;
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
  };
  
  // Mini Dapp Store
  miniDappStore: {
    title: string;
    description: string;
    featured: string;
    categories: string;
    newItems: string;
    popular: string;
    onSale: string;
    inAppItems: string;
    nfts: string;
    digitalAssets: string;
    virtualGoods: string;
    gameItems: string;
    collectibles: string;
    utilities: string;
    buyWithLinePay: string;
    buyWithCrypto: string;
    priceInFiat: string;
    priceInCrypto: string;
    addToCart: string;
    viewCart: string;
    checkout: string;
    paymentMethod: string;
    totalAmount: string;
    processingFee: string;
    confirmPurchase: string;
    purchaseComplete: string;
    downloadItem: string;
    itemDelivered: string;
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
  };
}

// Language context
interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  detectionMethod: LanguageDetectionMethod;
  setDetectionMethod: (method: LanguageDetectionMethod) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

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
    },
    navigation: {
      home: 'Home',
      dashboard: 'Dashboard',
      portfolio: 'Portfolio',
      marketplace: 'Marketplace',
      nftCollateral: 'NFT Collateral',
      referral: 'Referral',
      rewards: 'Rewards',
      settings: 'Settings',
      profile: 'Profile',
      help: 'Help',
      about: 'About',
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
    },
    miniDappStore: {
      title: 'Mini Dapp Store',
      description: 'Buy NFTs and in-app items with LINE Pay integration.',
      featured: 'Featured',
      categories: 'Categories',
      newItems: 'New Items',
      popular: 'Popular',
      onSale: 'On Sale',
      inAppItems: 'In-App Items',
      nfts: 'NFTs',
      digitalAssets: 'Digital Assets',
      virtualGoods: 'Virtual Goods',
      gameItems: 'Game Items',
      collectibles: 'Collectibles',
      utilities: 'Utilities',
      buyWithLinePay: 'Buy with LINE Pay',
      buyWithCrypto: 'Buy with Crypto',
      priceInFiat: 'Price (Fiat)',
      priceInCrypto: 'Price (Crypto)',
      addToCart: 'Add to Cart',
      viewCart: 'View Cart',
      checkout: 'Checkout',
      paymentMethod: 'Payment Method',
      totalAmount: 'Total Amount',
      processingFee: 'Processing Fee',
      confirmPurchase: 'Confirm Purchase',
      purchaseComplete: 'Purchase Complete',
      downloadItem: 'Download Item',
      itemDelivered: 'Item Delivered',
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
    },
    navigation: {
      home: 'ホーム',
      dashboard: 'ダッシュボード',
      portfolio: 'ポートフォリオ',
      marketplace: 'マーケットプレイス',
      nftCollateral: 'NFT担保',
      referral: '紹介',
      rewards: '報酬',
      settings: '設定',
      profile: 'プロフィール',
      help: 'ヘルプ',
      about: 'について',
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
    },
    miniDappStore: {
      title: 'ミニDappストア',
      description: 'LINE Pay統合でNFTとアプリ内アイテムを購入できます。',
      featured: 'おすすめ',
      categories: 'カテゴリー',
      newItems: '新着アイテム',
      popular: '人気',
      onSale: 'セール中',
      inAppItems: 'アプリ内アイテム',
      nfts: 'NFT',
      digitalAssets: 'デジタルアセット',
      virtualGoods: 'バーチャルグッズ',
      gameItems: 'ゲームアイテム',
      collectibles: 'コレクタブル',
      utilities: 'ユーティリティ',
      buyWithLinePay: 'LINE Payで購入',
      buyWithCrypto: '暗号通貨で購入',
      priceInFiat: '価格（法定通貨）',
      priceInCrypto: '価格（暗号通貨）',
      addToCart: 'カートに追加',
      viewCart: 'カートを見る',
      checkout: 'チェックアウト',
      paymentMethod: '支払い方法',
      totalAmount: '合計金額',
      processingFee: '処理手数料',
      confirmPurchase: '購入確認',
      purchaseComplete: '購入完了',
      downloadItem: 'アイテムダウンロード',
      itemDelivered: 'アイテム配信済み',
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
    },
    success: {
      walletConnected: 'ウォレットが正常に接続されました！',
      transactionSubmitted: '取引が正常に送信されました！',
      transactionConfirmed: '取引が確認されました！',
      nftDeposited: 'NFTが正常に入金されました！',
      loanCreated: 'ローンが正常に作成されました！',
      loanRepaid: 'ローンが正常に返済されました！',
      nftPurchased: 'NFTが正常に購入されました！',
      nftListed: 'NFTが正常に出品されました！',
      paymentReceived: '決済が正常に受領されました！',
      settingsSaved: '設定が正常に保存されました！',
      profileUpdated: 'プロフィールが正常に更新されました！',
    },
  },
};

// Language detection utilities
export const detectLanguageFromBrowser = (): SupportedLanguage => {
  const browserLang = navigator.language || (navigator as any).userLanguage;
  
  // Check for Japanese
  if (browserLang.startsWith('ja')) {
    return 'ja';
  }
  
  // Default to English
  return 'en';
};

export const detectLanguageFromIP = async (): Promise<SupportedLanguage> => {
  try {
    // Use a free IP geolocation service
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    // Check if country is Japan
    if (data.country_code === 'JP') {
      return 'ja';
    }
    
    return 'en';
  } catch (error) {
    console.warn('Failed to detect language from IP:', error);
    return 'en'; // Fallback to English
  }
};

// Language provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [detectionMethod, setDetectionMethod] = useState<LanguageDetectionMethod>('browser');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language detection
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Check for saved language preference
        const savedLanguage = localStorage.getItem('line-yield-language') as SupportedLanguage;
        const savedMethod = localStorage.getItem('line-yield-language-method') as LanguageDetectionMethod;
        
        if (savedLanguage && savedMethod) {
          setLanguage(savedLanguage);
          setDetectionMethod(savedMethod);
          setIsLoading(false);
          return;
        }
        
        // Auto-detect language
        let detectedLanguage: SupportedLanguage;
        
        if (savedMethod === 'ip') {
          detectedLanguage = await detectLanguageFromIP();
        } else {
          detectedLanguage = detectLanguageFromBrowser();
        }
        
        setLanguage(detectedLanguage);
        setDetectionMethod(savedMethod || 'browser');
        
        // Save preferences
        localStorage.setItem('line-yield-language', detectedLanguage);
        localStorage.setItem('line-yield-language-method', savedMethod || 'browser');
        
      } catch (error) {
        console.warn('Language detection failed:', error);
        setLanguage('en');
        setDetectionMethod('browser');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key; // Return key if translation not found
  };

  // Update language and save to localStorage
  const handleSetLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang);
    localStorage.setItem('line-yield-language', lang);
  };

  // Update detection method and save to localStorage
  const handleSetDetectionMethod = (method: LanguageDetectionMethod) => {
    setDetectionMethod(method);
    localStorage.setItem('line-yield-language-method', method);
  };

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    detectionMethod,
    setDetectionMethod: handleSetDetectionMethod,
    t,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Hook for translations
export const useTranslation = () => {
  const { t } = useLanguage();
  return { t };
};

export default translations;
