import { useState, useEffect } from 'react';

type SupportedLang = 'en' | 'ja';

interface Localization {
  lang: SupportedLang;
  strings: Record<string, string>;
}

const translations: Record<SupportedLang, Record<string, string>> = {
  en: {
    // Common UI strings
    welcome: 'Welcome',
    connectWallet: 'Connect Wallet',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    yield: 'Yield',
    balance: 'Balance',
    transactionHistory: 'Transaction History',
    noTransactions: 'No transactions yet',
    transactionHistoryDescription: 'Your transaction history will appear here',
    
    // Transaction types
    transactionTypeDeposit: 'Deposit',
    transactionTypeWithdraw: 'Withdraw',
    transactionTypeYield: 'Yield',
    
    // Transaction status
    statusPending: 'Pending',
    statusConfirmed: 'Confirmed',
    statusCompleted: 'Completed',
    statusFailed: 'Failed',
    
    // Payment flow
    paymentAmount: 'Payment Amount',
    paymentMethod: 'Payment Method',
    confirmPayment: 'Confirm Payment',
    paymentSuccess: 'Payment Successful',
    paymentFailed: 'Payment Failed',
    
    // Wallet
    walletConnected: 'Wallet Connected',
    walletDisconnected: 'Wallet Disconnected',
    connectToWallet: 'Connect to Wallet',
    disconnectWallet: 'Disconnect Wallet',
    
    // Platform
    platformLiff: 'LINE Mini App',
    platformWeb: 'Web App',
    
    // Common actions
    confirm: 'Confirm',
    cancel: 'Cancel',
    retry: 'Retry',
    back: 'Back',
    next: 'Next',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Time formats
    timeFormat: 'MMM d, h:mm a',
    
    // Currency
    currencyUsdc: 'USDC',
    currencyUsdt: 'USDT',
    
    // Wallet Connection
    connecting: 'Connecting...',
    connected: 'Connected',
    connectToDeposit: 'Connect to Deposit',
    connectToWithdraw: 'Connect to Withdraw',
    connectToBuy: 'Connect to Buy',
    connectToClaim: 'Connect to Claim',
    connectToTransfer: 'Connect to Transfer',
    walletRequiredForDeposit: 'Wallet connection required to deposit funds',
    walletRequiredForWithdraw: 'Wallet connection required to withdraw funds',
    walletRequiredForBuy: 'Wallet connection required to complete purchase',
    walletRequiredForClaim: 'Wallet connection required to claim rewards',
    walletRequiredForTransfer: 'Wallet connection required to transfer tokens',
    walletRequiredForAction: 'Wallet connection required for this action',
    readyTo: 'Ready to',
    processing: 'Processing...',
    
    // Mini Dapp specific
    miniDappTitle: 'LINE Yield',
    miniDappDescription: 'Seamless DeFi experience inside LINE Messenger powered by Kaia Blockchain. Earn automated yield on your USDT with 8.64% APY.',
    miniDappTagline: 'Maximize your stablecoin earnings through automated DeFi strategies',
    
    // Navigation
    home: 'Home',
    dashboard: 'Dashboard',
    portfolio: 'Portfolio',
    settings: 'Settings',
    help: 'Help',
    about: 'About',
    
    // DeFi specific
    apy: 'APY',
    totalValueLocked: 'Total Value Locked',
    totalAssets: 'Total Assets',
    userShares: 'User Shares',
    userAssets: 'User Assets',
    earnedYield: 'Earned Yield',
    strategies: 'Strategies',
    allocation: 'Allocation',
    tvl: 'TVL',
    
    // Actions
    buy: 'Buy',
    sell: 'Sell',
    swap: 'Swap',
    stake: 'Stake',
    unstake: 'Unstake',
    claim: 'Claim',
    transfer: 'Transfer',
    
    // Messages
    welcomeMessage: 'Welcome to LINE Yield! Start earning automated yield on your USDT.',
    connectWalletMessage: 'Connect your wallet to start earning yield',
    depositMessage: 'Deposit USDT to start earning automated yield',
    withdrawMessage: 'Withdraw your USDT and earned yield',
    yieldMessage: 'Your automated yield is being earned',
    
    // Errors
    connectionError: 'Connection failed. Please try again.',
    transactionError: 'Transaction failed. Please check your balance and try again.',
    networkError: 'Network error. Please check your connection.',
    insufficientBalance: 'Insufficient balance for this transaction',
    transactionPending: 'Transaction is pending. Please wait.',
    
    // Success messages
    walletConnectedSuccess: 'Wallet connected successfully!',
    depositSuccess: 'Deposit successful!',
    withdrawSuccess: 'Withdrawal successful!',
    transactionSuccess: 'Transaction completed successfully!',
    
    // Language
    language: 'Language',
    english: 'English',
    japanese: '日本語',
    selectLanguage: 'Select Language',
    
    // Date and time
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    
    // Numbers and formatting
    thousandSeparator: ',',
    decimalSeparator: '.',
    currencySymbol: '$',
    
    // Accessibility
    close: 'Close',
    open: 'Open',
    expand: 'Expand',
    collapse: 'Collapse',
    showMore: 'Show More',
    showLess: 'Show Less',
  },
  ja: {
    // Common UI strings
    welcome: 'ようこそ',
    connectWallet: 'ウォレットを接続',
    deposit: '入金',
    withdraw: '出金',
    yield: '利回り',
    balance: '残高',
    transactionHistory: '取引履歴',
    noTransactions: 'まだ取引がありません',
    transactionHistoryDescription: '取引履歴がここに表示されます',
    
    // Transaction types
    transactionTypeDeposit: '入金',
    transactionTypeWithdraw: '出金',
    transactionTypeYield: '利回り',
    
    // Transaction status
    statusPending: '処理中',
    statusConfirmed: '確認済み',
    statusCompleted: '完了',
    statusFailed: '失敗',
    
    // Payment flow
    paymentAmount: '支払い金額',
    paymentMethod: '支払い方法',
    confirmPayment: '支払い確認',
    paymentSuccess: '支払い成功',
    paymentFailed: '支払い失敗',
    
    // Wallet
    walletConnected: 'ウォレット接続済み',
    walletDisconnected: 'ウォレット切断',
    connectToWallet: 'ウォレットに接続',
    disconnectWallet: 'ウォレットを切断',
    
    // Platform
    platformLiff: 'LINE ミニアプリ',
    platformWeb: 'ウェブアプリ',
    
    // Common actions
    confirm: '確認',
    cancel: 'キャンセル',
    retry: '再試行',
    back: '戻る',
    next: '次へ',
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',
    
    // Time formats
    timeFormat: 'M月d日 H:mm',
    
    // Currency
    currencyUsdc: 'USDC',
    currencyUsdt: 'USDT',
    
    // Wallet Connection
    connecting: '接続中...',
    connected: '接続済み',
    connectToDeposit: '入金のために接続',
    connectToWithdraw: '出金のために接続',
    connectToBuy: '購入のために接続',
    connectToClaim: '受け取りのために接続',
    connectToTransfer: '送金のために接続',
    walletRequiredForDeposit: '入金にはウォレット接続が必要です',
    walletRequiredForWithdraw: '出金にはウォレット接続が必要です',
    walletRequiredForBuy: '購入にはウォレット接続が必要です',
    walletRequiredForClaim: '受け取りにはウォレット接続が必要です',
    walletRequiredForTransfer: '送金にはウォレット接続が必要です',
    walletRequiredForAction: 'この操作にはウォレット接続が必要です',
    readyTo: '準備完了',
    processing: '処理中...',
    
    // Mini Dapp specific
    miniDappTitle: 'LINE Yield',
    miniDappDescription: 'Kaia Blockchainを活用したLINE Messenger内でのシームレスなDeFi体験。USDTで8.64%のAPYを自動獲得。',
    miniDappTagline: '自動化されたDeFi戦略でステーブルコインの収益を最大化',
    
    // Navigation
    home: 'ホーム',
    dashboard: 'ダッシュボード',
    portfolio: 'ポートフォリオ',
    settings: '設定',
    help: 'ヘルプ',
    about: 'について',
    
    // DeFi specific
    apy: 'APY',
    totalValueLocked: '総ロック価値',
    totalAssets: '総資産',
    userShares: 'ユーザーシェア',
    userAssets: 'ユーザー資産',
    earnedYield: '獲得利回り',
    strategies: '戦略',
    allocation: '配分',
    tvl: 'TVL',
    
    // Actions
    buy: '購入',
    sell: '売却',
    swap: 'スワップ',
    stake: 'ステーキング',
    unstake: 'アンステーキング',
    claim: '受け取り',
    transfer: '送金',
    
    // Messages
    welcomeMessage: 'LINE Yieldへようこそ！USDTで自動利回りを獲得しましょう。',
    connectWalletMessage: 'ウォレットを接続して利回り獲得を開始',
    depositMessage: 'USDTを入金して自動利回り獲得を開始',
    withdrawMessage: 'USDTと獲得した利回りを出金',
    yieldMessage: '自動利回りが獲得されています',
    
    // Errors
    connectionError: '接続に失敗しました。もう一度お試しください。',
    transactionError: '取引に失敗しました。残高を確認してもう一度お試しください。',
    networkError: 'ネットワークエラーです。接続を確認してください。',
    insufficientBalance: 'この取引に十分な残高がありません',
    transactionPending: '取引が処理中です。お待ちください。',
    
    // Success messages
    walletConnectedSuccess: 'ウォレットが正常に接続されました！',
    depositSuccess: '入金が成功しました！',
    withdrawSuccess: '出金が成功しました！',
    transactionSuccess: '取引が正常に完了しました！',
    
    // Language
    language: '言語',
    english: 'English',
    japanese: '日本語',
    selectLanguage: '言語を選択',
    
    // Date and time
    today: '今日',
    yesterday: '昨日',
    thisWeek: '今週',
    thisMonth: '今月',
    lastMonth: '先月',
    
    // Numbers and formatting
    thousandSeparator: ',',
    decimalSeparator: '.',
    currencySymbol: '¥',
    
    // Accessibility
    close: '閉じる',
    open: '開く',
    expand: '展開',
    collapse: '折りたたむ',
    showMore: 'もっと見る',
    showLess: '少なく表示',
  },
};

/**
 * Detect language from browser settings or fallback to English.
 * Optionally, detect locale from IP via an external service.
 */
export function useLocalization() {
  const [localization, setLocalization] = useState<Localization>({
    lang: 'en',
    strings: translations['en'],
  });

  useEffect(() => {
    async function detectLanguage() {
      // 1. Check localStorage for saved language preference
      const savedLang = localStorage.getItem('preferred-language') as SupportedLang;
      if (savedLang && translations[savedLang]) {
        setLocalization({
          lang: savedLang,
          strings: translations[savedLang],
        });
        return;
      }

      // 2. Detect browser language first
      const browserLang = navigator.language || 'en';
      let langCode: SupportedLang = 'en';
      
      if (browserLang.startsWith('ja')) {
        langCode = 'ja';
      } else if (browserLang.startsWith('en')) {
        langCode = 'en';
      }

      // 3. Optionally, enhance detection using IP-based geolocation service for accuracy
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data && data.country_code === 'JP') {
          langCode = 'ja';
        }
      } catch (e) {
        // ignore errors and fallback to browser lang
      }

      setLocalization({
        lang: langCode,
        strings: translations[langCode],
      });
    }

    detectLanguage();
  }, []);

  const setLanguage = (lang: SupportedLang) => {
    setLocalization({
      lang,
      strings: translations[lang],
    });
    localStorage.setItem('preferred-language', lang);
  };

  return { ...localization, setLanguage };
}

/**
 * Get a localized string by key
 */
export function useT() {
  const { strings } = useLocalization();
  return (key: string, fallback?: string) => strings[key] || fallback || key;
}

/**
 * Format date according to locale
 */
export function useDateFormat() {
  const { lang } = useLocalization();
  
  return (date: Date | number, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    const locale = lang === 'ja' ? 'ja-JP' : 'en-US';
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options,
    };
    
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  };
}

/**
 * Format numbers according to locale
 */
export function useNumberFormat() {
  const { lang } = useLocalization();
  
  return (value: number, options?: Intl.NumberFormatOptions) => {
    const locale = lang === 'ja' ? 'ja-JP' : 'en-US';
    
    const defaultOptions: Intl.NumberFormatOptions = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    };
    
    return new Intl.NumberFormat(locale, defaultOptions).format(value);
  };
}

/**
 * Format currency according to locale
 */
export function useCurrencyFormat() {
  const { lang } = useLocalization();
  
  return (value: number, currency: string = 'USD', options?: Intl.NumberFormatOptions) => {
    const locale = lang === 'ja' ? 'ja-JP' : 'en-US';
    
    const defaultOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    };
    
    return new Intl.NumberFormat(locale, defaultOptions).format(value);
  };
}

/**
 * Format percentage according to locale
 */
export function usePercentageFormat() {
  const { lang } = useLocalization();
  
  return (value: number, options?: Intl.NumberFormatOptions) => {
    const locale = lang === 'ja' ? 'ja-JP' : 'en-US';
    
    const defaultOptions: Intl.NumberFormatOptions = {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    };
    
    return new Intl.NumberFormat(locale, defaultOptions).format(value / 100);
  };
}
