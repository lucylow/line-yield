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
      // 1. Detect browser language first
      const browserLang = navigator.language || navigator.userLanguage || 'en';
      let langCode: SupportedLang = 'en';
      
      if (browserLang.startsWith('ja')) {
        langCode = 'ja';
      } else if (browserLang.startsWith('en')) {
        langCode = 'en';
      }

      // 2. Optionally, enhance detection using IP-based geolocation service for accuracy
      // Example with free geo IP API (uncomment below if desired):
      /*
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data && data.country_code === 'JP') {
          langCode = 'ja';
        }
      } catch (e) {
        // ignore errors and fallback to browser lang
      }
      */

      setLocalization({
        lang: langCode,
        strings: translations[langCode],
      });
    }

    detectLanguage();
  }, []);

  return localization;
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
