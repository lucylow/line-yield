// Translation data structure for LINE Yield dApp
// Default language: English
// Secondary language: Japanese
// Extensible for additional languages

export interface TranslationKeys {
  // Common UI elements
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    sort: string;
    refresh: string;
    retry: string;
    copy: string;
    share: string;
    download: string;
    upload: string;
    yes: string;
    no: string;
    ok: string;
    selected: string;
    days: string;
  };

  // Navigation
  navigation: {
    home: string;
    dashboard: string;
    wallet: string;
    transactions: string;
    staking: string;
    rewards: string;
    settings: string;
    help: string;
    about: string;
    contact: string;
    privacy: string;
    terms: string;
  };

  // Wallet related
  wallet: {
    connect: string;
    disconnect: string;
    connected: string;
    balance: string;
    address: string;
    network: string;
    switchNetwork: string;
    copyAddress: string;
    viewExplorer: string;
    refreshBalance: string;
    connectWallet: string;
    walletNotFound: string;
    connectionFailed: string;
    disconnectionFailed: string;
    insufficientBalance: string;
    transactionPending: string;
    transactionConfirmed: string;
    transactionFailed: string;
  };

  // Token management
  tokens: {
    tokenBalance: string;
    totalSupply: string;
    userRewards: string;
    pendingRewards: string;
    claimRewards: string;
    stakeTokens: string;
    unstakeTokens: string;
    vestingSchedule: string;
    releaseTokens: string;
    stakingPools: string;
    rewardRate: string;
    lockPeriod: string;
    minStake: string;
    maxStake: string;
    totalStaked: string;
    yourStakes: string;
    noActiveStakes: string;
    stakeNow: string;
    unlocked: string;
    locked: string;
    vestingProgress: string;
    releasableAmount: string;
    vestedAmount: string;
    totalAmount: string;
    lytTokenManagement: string;
    tokenManagementDescription: string;
    tokenOverview: string;
    lytBalance: string;
    availableTokens: string;
    totalRewards: string;
    lifetimeEarnings: string;
    readyToClaim: string;
    overview: string;
    vesting: string;
    pools: string;
    rewardPools: string;
    incentivesPool: string;
    availableForRewards: string;
    stakingPool: string;
    stakingRewards: string;
    referralPool: string;
    referralRewards: string;
    quickActions: string;
    claimAllRewards: string;
    checkVesting: string;
    active: string;
    inactive: string;
    pool: string;
    lock: string;
    amountToStake: string;
    stake: string;
    stakeDescription: string;
    unlocks: string;
    stakedAmount: string;
    stakedSince: string;
    unstake: string;
    tokenVesting: string;
    noVestingSchedule: string;
    noVestingDescription: string;
    totalVestingAmount: string;
    alreadyVested: string;
    releasable: string;
    readyToRelease: string;
    startTime: string;
    duration: string;
    cliffPeriod: string;
    revocable: string;
    releaseVestedTokens: string;
    rewardPoolStatistics: string;
    incentivesPoolDescription: string;
    stakingPoolDescription: string;
    referralPoolDescription: string;
  };

  // Transaction related
  transactions: {
    deposit: string;
    withdraw: string;
    transfer: string;
    swap: string;
    stake: string;
    unstake: string;
    claim: string;
    send: string;
    receive: string;
    transactionHistory: string;
    noTransactions: string;
    transactionHash: string;
    amount: string;
    fee: string;
    gasFee: string;
    gasDelegation: string;
    confirmTransaction: string;
    transactionSubmitted: string;
    transactionConfirmed: string;
    transactionFailed: string;
    viewOnExplorer: string;
    copyHash: string;
  };

  // LINE integration
  line: {
    inviteFriends: string;
    shareToLine: string;
    shareToFriends: string;
    referralLink: string;
    copyInviteLink: string;
    referralRewards: string;
    totalReferrals: string;
    referralEarnings: string;
    commissionRate: string;
    inviteMessage: string;
    customMessage: string;
    shareViaLine: string;
    shareViaTwitter: string;
    shareViaTelegram: string;
    shareViaWhatsApp: string;
  };

  // Yield farming
  yield: {
    apy: string;
    currentYield: string;
    estimatedEarnings: string;
    yieldFarming: string;
    autoCompound: string;
    strategy: string;
    riskLevel: string;
    lowRisk: string;
    mediumRisk: string;
    highRisk: string;
    totalValueLocked: string;
    yourDeposits: string;
    totalEarnings: string;
    dailyEarnings: string;
    weeklyEarnings: string;
    monthlyEarnings: string;
    yearlyEarnings: string;
  };

  // Error messages
  errors: {
    networkError: string;
    walletError: string;
    transactionError: string;
    insufficientFunds: string;
    userRejected: string;
    networkMismatch: string;
    contractError: string;
    unknownError: string;
    tryAgain: string;
    contactSupport: string;
    checkConnection: string;
    refreshPage: string;
  };

  // Success messages
  success: {
    walletConnected: string;
    transactionSubmitted: string;
    transactionConfirmed: string;
    tokensClaimed: string;
    tokensStaked: string;
    tokensUnstaked: string;
    referralSent: string;
    settingsSaved: string;
    copiedToClipboard: string;
    linkShared: string;
  };

  // Settings
  settings: {
    language: string;
    theme: string;
    notifications: string;
    security: string;
    privacy: string;
    account: string;
    preferences: string;
    darkMode: string;
    lightMode: string;
    autoMode: string;
    enableNotifications: string;
    emailNotifications: string;
    pushNotifications: string;
    smsNotifications: string;
  };

  // Maintenance and errors
  maintenance: {
    underMaintenance: string;
    maintenanceMessage: string;
    estimatedDuration: string;
    progress: string;
    checkAgain: string;
    getUpdates: string;
    contactSupport: string;
    whyMaintenance: string;
    maintenanceReason: string;
  };

  // Landing page
  landing: {
    title: string;
    subtitle: string;
    description: string;
    getStarted: string;
    learnMore: string;
    features: string;
    security: string;
    performance: string;
    easeOfUse: string;
    community: string;
    testimonials: string;
    faq: string;
    joinNow: string;
  };
}

export const translations: Record<string, TranslationKeys> = {
  en: {
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      confirm: "Confirm",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      back: "Back",
      next: "Next",
      previous: "Previous",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      refresh: "Refresh",
      retry: "Retry",
      copy: "Copy",
      share: "Share",
      download: "Download",
      upload: "Upload",
      yes: "Yes",
      no: "No",
      ok: "OK",
      selected: "Selected",
      days: "{{count}} days"
    },

    navigation: {
      home: "Home",
      dashboard: "Dashboard",
      wallet: "Wallet",
      transactions: "Transactions",
      staking: "Staking",
      rewards: "Rewards",
      settings: "Settings",
      help: "Help",
      about: "About",
      contact: "Contact",
      privacy: "Privacy",
      terms: "Terms"
    },

    wallet: {
      connect: "Connect",
      disconnect: "Disconnect",
      connected: "Connected",
      balance: "Balance",
      address: "Address",
      network: "Network",
      switchNetwork: "Switch Network",
      copyAddress: "Copy Address",
      viewExplorer: "View on Explorer",
      refreshBalance: "Refresh Balance",
      connectWallet: "Connect Wallet",
      walletNotFound: "Wallet not found. Please install Kaia Wallet.",
      connectionFailed: "Connection failed. Please try again.",
      disconnectionFailed: "Disconnection failed",
      insufficientBalance: "Insufficient balance",
      transactionPending: "Transaction pending",
      transactionConfirmed: "Transaction confirmed",
      transactionFailed: "Transaction failed"
    },

    tokens: {
      tokenBalance: "Token Balance",
      totalSupply: "Total Supply",
      userRewards: "User Rewards",
      pendingRewards: "Pending Rewards",
      claimRewards: "Claim Rewards",
      stakeTokens: "Stake Tokens",
      unstakeTokens: "Unstake Tokens",
      vestingSchedule: "Vesting Schedule",
      releaseTokens: "Release Tokens",
      stakingPools: "Staking Pools",
      rewardRate: "Reward Rate",
      lockPeriod: "Lock Period",
      minStake: "Min Stake",
      maxStake: "Max Stake",
      totalStaked: "Total Staked",
      yourStakes: "Your Stakes",
      noActiveStakes: "No active stakes",
      stakeNow: "Stake Now",
      unlocked: "Unlocked",
      locked: "Locked",
      vestingProgress: "Vesting Progress",
      releasableAmount: "Releasable Amount",
      vestedAmount: "Vested Amount",
      totalAmount: "Total Amount",
      lytTokenManagement: "LYT Token Management",
      tokenManagementDescription: "Manage your LINE Yield Token (LYT) holdings, staking, and rewards",
      tokenOverview: "Token Overview",
      lytBalance: "LYT Balance",
      availableTokens: "Available tokens",
      totalRewards: "Total Rewards",
      lifetimeEarnings: "Lifetime earnings",
      readyToClaim: "Ready to claim",
      overview: "Overview",
      vesting: "Vesting",
      pools: "Pools",
      rewardPools: "Reward Pools",
      incentivesPool: "Incentives Pool",
      availableForRewards: "Available for rewards",
      stakingPool: "Staking Pool",
      stakingRewards: "Staking rewards",
      referralPool: "Referral Pool",
      referralRewards: "Referral rewards",
      quickActions: "Quick Actions",
      claimAllRewards: "Claim All Rewards",
      checkVesting: "Check Vesting",
      active: "Active",
      inactive: "Inactive",
      pool: "Pool",
      lock: "Lock",
      amountToStake: "Amount to stake",
      stake: "Stake",
      stakeDescription: "Stake your LYT tokens to start earning rewards",
      unlocks: "Unlocks",
      stakedAmount: "Staked Amount",
      stakedSince: "Staked Since",
      unstake: "Unstake",
      tokenVesting: "Token Vesting",
      noVestingSchedule: "No vesting schedule",
      noVestingDescription: "You don't have any vesting tokens",
      totalVestingAmount: "Total vesting amount",
      alreadyVested: "Already vested",
      releasable: "Releasable",
      readyToRelease: "Ready to release",
      startTime: "Start Time",
      duration: "Duration",
      cliffPeriod: "Cliff Period",
      revocable: "Revocable",
      releaseVestedTokens: "Release Vested Tokens",
      rewardPoolStatistics: "Reward Pool Statistics",
      incentivesPoolDescription: "Available for user rewards and incentives",
      stakingPoolDescription: "Rewards for staked token holders",
      referralPoolDescription: "Rewards for successful referrals"
    },

    transactions: {
      deposit: "Deposit",
      withdraw: "Withdraw",
      transfer: "Transfer",
      swap: "Swap",
      stake: "Stake",
      unstake: "Unstake",
      claim: "Claim",
      send: "Send",
      receive: "Receive",
      transactionHistory: "Transaction History",
      noTransactions: "No transactions yet",
      transactionHash: "Transaction Hash",
      amount: "Amount",
      fee: "Fee",
      gasFee: "Gas Fee",
      gasDelegation: "Gas Fee Delegation",
      confirmTransaction: "Confirm Transaction",
      transactionSubmitted: "Transaction submitted",
      transactionConfirmed: "Transaction confirmed",
      transactionFailed: "Transaction failed",
      viewOnExplorer: "View on Explorer",
      copyHash: "Copy Hash"
    },

    line: {
      inviteFriends: "Invite Friends",
      shareToLine: "Share to LINE",
      shareToFriends: "Share to Friends",
      referralLink: "Referral Link",
      copyInviteLink: "Copy Invite Link",
      referralRewards: "Referral Rewards",
      totalReferrals: "Total Referrals",
      referralEarnings: "Referral Earnings",
      commissionRate: "Commission Rate",
      inviteMessage: "Invite Message",
      customMessage: "Custom Message",
      shareViaLine: "Share via LINE",
      shareViaTwitter: "Share via Twitter",
      shareViaTelegram: "Share via Telegram",
      shareViaWhatsApp: "Share via WhatsApp"
    },

    yield: {
      apy: "APY",
      currentYield: "Current Yield",
      estimatedEarnings: "Estimated Earnings",
      yieldFarming: "Yield Farming",
      autoCompound: "Auto Compound",
      strategy: "Strategy",
      riskLevel: "Risk Level",
      lowRisk: "Low Risk",
      mediumRisk: "Medium Risk",
      highRisk: "High Risk",
      totalValueLocked: "Total Value Locked",
      yourDeposits: "Your Deposits",
      totalEarnings: "Total Earnings",
      dailyEarnings: "Daily Earnings",
      weeklyEarnings: "Weekly Earnings",
      monthlyEarnings: "Monthly Earnings",
      yearlyEarnings: "Yearly Earnings"
    },

    errors: {
      networkError: "Network error occurred",
      walletError: "Wallet error occurred",
      transactionError: "Transaction error occurred",
      insufficientFunds: "Insufficient funds",
      userRejected: "User rejected transaction",
      networkMismatch: "Network mismatch",
      contractError: "Contract error occurred",
      unknownError: "Unknown error occurred",
      tryAgain: "Please try again",
      contactSupport: "Contact support",
      checkConnection: "Check your connection",
      refreshPage: "Refresh the page"
    },

    success: {
      walletConnected: "Wallet connected successfully",
      transactionSubmitted: "Transaction submitted successfully",
      transactionConfirmed: "Transaction confirmed",
      tokensClaimed: "Tokens claimed successfully",
      tokensStaked: "Tokens staked successfully",
      tokensUnstaked: "Tokens unstaked successfully",
      referralSent: "Referral sent successfully",
      settingsSaved: "Settings saved successfully",
      copiedToClipboard: "Copied to clipboard",
      linkShared: "Link shared successfully"
    },

    settings: {
      language: "Language",
      theme: "Theme",
      notifications: "Notifications",
      security: "Security",
      privacy: "Privacy",
      account: "Account",
      preferences: "Preferences",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      autoMode: "Auto Mode",
      enableNotifications: "Enable Notifications",
      emailNotifications: "Email Notifications",
      pushNotifications: "Push Notifications",
      smsNotifications: "SMS Notifications"
    },

    maintenance: {
      underMaintenance: "Under Maintenance",
      maintenanceMessage: "We are currently performing scheduled maintenance to improve your experience.",
      estimatedDuration: "Estimated Duration",
      progress: "Progress",
      checkAgain: "Check Again",
      getUpdates: "Get Updates",
      contactSupport: "Contact Support",
      whyMaintenance: "Why Maintenance?",
      maintenanceReason: "We regularly perform maintenance to ensure the highest level of security, performance, and reliability for your DeFi investments."
    },

    landing: {
      title: "LINE Yield",
      subtitle: "Earn Automated Yield on Your USDT",
      description: "LINE Yield lets you maximize your stablecoin earnings through automated DeFi strategies, directly within LINE Messenger. Set it and forget it.",
      getStarted: "Get Started",
      learnMore: "Learn More",
      features: "Features",
      security: "Security",
      performance: "Performance",
      easeOfUse: "Ease of Use",
      community: "Community",
      testimonials: "Testimonials",
      faq: "FAQ",
      joinNow: "Join Now"
    }
  },

  ja: {
    common: {
      loading: "[translate:読み込み中...]",
      error: "[translate:エラー]",
      success: "[translate:成功]",
      cancel: "[translate:キャンセル]",
      confirm: "[translate:確認]",
      save: "[translate:保存]",
      delete: "[translate:削除]",
      edit: "[translate:編集]",
      close: "[translate:閉じる]",
      back: "[translate:戻る]",
      next: "[translate:次へ]",
      previous: "[translate:前へ]",
      search: "[translate:検索]",
      filter: "[translate:フィルター]",
      sort: "[translate:並び替え]",
      refresh: "[translate:更新]",
      retry: "[translate:再試行]",
      copy: "[translate:コピー]",
      share: "[translate:共有]",
      download: "[translate:ダウンロード]",
      upload: "[translate:アップロード]",
      yes: "[translate:はい]",
      no: "[translate:いいえ]",
      ok: "[translate:OK]",
      selected: "[translate:選択済み]",
      days: "[translate:{{count}}日]"
    },

    navigation: {
      home: "[translate:ホーム]",
      dashboard: "[translate:ダッシュボード]",
      wallet: "[translate:ウォレット]",
      transactions: "[translate:取引履歴]",
      staking: "[translate:ステーキング]",
      rewards: "[translate:報酬]",
      settings: "[translate:設定]",
      help: "[translate:ヘルプ]",
      about: "[translate:について]",
      contact: "[translate:お問い合わせ]",
      privacy: "[translate:プライバシー]",
      terms: "[translate:利用規約]"
    },

    wallet: {
      connect: "[translate:接続]",
      disconnect: "[translate:切断]",
      connected: "[translate:接続済み]",
      balance: "[translate:残高]",
      address: "[translate:アドレス]",
      network: "[translate:ネットワーク]",
      switchNetwork: "[translate:ネットワーク切り替え]",
      copyAddress: "[translate:アドレスをコピー]",
      viewExplorer: "[translate:エクスプローラーで表示]",
      refreshBalance: "[translate:残高を更新]",
      connectWallet: "[translate:ウォレットを接続]",
      walletNotFound: "[translate:ウォレットが見つかりません。Kaiaウォレットをインストールしてください。]",
      connectionFailed: "[translate:接続に失敗しました。もう一度お試しください。]",
      disconnectionFailed: "[translate:切断に失敗しました]",
      insufficientBalance: "[translate:残高不足]",
      transactionPending: "[translate:取引処理中]",
      transactionConfirmed: "[translate:取引確認済み]",
      transactionFailed: "[translate:取引失敗]"
    },

    tokens: {
      tokenBalance: "[translate:トークン残高]",
      totalSupply: "[translate:総供給量]",
      userRewards: "[translate:ユーザー報酬]",
      pendingRewards: "[translate:未払い報酬]",
      claimRewards: "[translate:報酬を請求]",
      stakeTokens: "[translate:トークンをステーキング]",
      unstakeTokens: "[translate:ステーキング解除]",
      vestingSchedule: "[translate:ベスティングスケジュール]",
      releaseTokens: "[translate:トークンをリリース]",
      stakingPools: "[translate:ステーキングプール]",
      rewardRate: "[translate:報酬率]",
      lockPeriod: "[translate:ロック期間]",
      minStake: "[translate:最小ステーキング]",
      maxStake: "[translate:最大ステーキング]",
      totalStaked: "[translate:総ステーキング]",
      yourStakes: "[translate:あなたのステーキング]",
      noActiveStakes: "[translate:アクティブなステーキングなし]",
      stakeNow: "[translate:今すぐステーキング]",
      unlocked: "[translate:アンロック済み]",
      locked: "[translate:ロック済み]",
      vestingProgress: "[translate:ベスティング進捗]",
      releasableAmount: "[translate:リリース可能額]",
      vestedAmount: "[translate:ベスティング済み額]",
      totalAmount: "[translate:総額]",
      lytTokenManagement: "[translate:LYTトークン管理]",
      tokenManagementDescription: "[translate:LINE Yieldトークン（LYT）の保有、ステーキング、報酬を管理]",
      tokenOverview: "[translate:トークン概要]",
      lytBalance: "[translate:LYT残高]",
      availableTokens: "[translate:利用可能なトークン]",
      totalRewards: "[translate:総報酬]",
      lifetimeEarnings: "[translate:生涯収益]",
      readyToClaim: "[translate:請求準備完了]",
      overview: "[translate:概要]",
      vesting: "[translate:ベスティング]",
      pools: "[translate:プール]",
      rewardPools: "[translate:報酬プール]",
      incentivesPool: "[translate:インセンティブプール]",
      availableForRewards: "[translate:報酬に利用可能]",
      stakingPool: "[translate:ステーキングプール]",
      stakingRewards: "[translate:ステーキング報酬]",
      referralPool: "[translate:紹介プール]",
      referralRewards: "[translate:紹介報酬]",
      quickActions: "[translate:クイックアクション]",
      claimAllRewards: "[translate:全報酬を請求]",
      checkVesting: "[translate:ベスティングを確認]",
      active: "[translate:アクティブ]",
      inactive: "[translate:非アクティブ]",
      pool: "[translate:プール]",
      lock: "[translate:ロック]",
      amountToStake: "[translate:ステーキング金額]",
      stake: "[translate:ステーキング]",
      stakeDescription: "[translate:LYTトークンをステーキングして報酬獲得を開始]",
      unlocks: "[translate:アンロック]",
      stakedAmount: "[translate:ステーキング金額]",
      stakedSince: "[translate:ステーキング開始日]",
      unstake: "[translate:ステーキング解除]",
      tokenVesting: "[translate:トークンベスティング]",
      noVestingSchedule: "[translate:ベスティングスケジュールなし]",
      noVestingDescription: "[translate:ベスティングトークンがありません]",
      totalVestingAmount: "[translate:総ベスティング金額]",
      alreadyVested: "[translate:既にベスティング済み]",
      releasable: "[translate:リリース可能]",
      readyToRelease: "[translate:リリース準備完了]",
      startTime: "[translate:開始時間]",
      duration: "[translate:期間]",
      cliffPeriod: "[translate:クリフ期間]",
      revocable: "[translate:取り消し可能]",
      releaseVestedTokens: "[translate:ベスティングトークンをリリース]",
      rewardPoolStatistics: "[translate:報酬プール統計]",
      incentivesPoolDescription: "[translate:ユーザー報酬とインセンティブに利用可能]",
      stakingPoolDescription: "[translate:ステーキングトークンホルダーへの報酬]",
      referralPoolDescription: "[translate:成功した紹介への報酬]"
    },

    transactions: {
      deposit: "[translate:入金]",
      withdraw: "[translate:出金]",
      transfer: "[translate:送金]",
      swap: "[translate:スワップ]",
      stake: "[translate:ステーキング]",
      unstake: "[translate:ステーキング解除]",
      claim: "[translate:請求]",
      send: "[translate:送信]",
      receive: "[translate:受信]",
      transactionHistory: "[translate:取引履歴]",
      noTransactions: "[translate:まだ取引がありません]",
      transactionHash: "[translate:取引ハッシュ]",
      amount: "[translate:金額]",
      fee: "[translate:手数料]",
      gasFee: "[translate:ガス手数料]",
      gasDelegation: "[translate:ガス手数料委任]",
      confirmTransaction: "[translate:取引を確認]",
      transactionSubmitted: "[translate:取引が送信されました]",
      transactionConfirmed: "[translate:取引が確認されました]",
      transactionFailed: "[translate:取引が失敗しました]",
      viewOnExplorer: "[translate:エクスプローラーで表示]",
      copyHash: "[translate:ハッシュをコピー]"
    },

    line: {
      inviteFriends: "[translate:友達を招待]",
      shareToLine: "[translate:LINEで共有]",
      shareToFriends: "[translate:友達と共有]",
      referralLink: "[translate:紹介リンク]",
      copyInviteLink: "[translate:招待リンクをコピー]",
      referralRewards: "[translate:紹介報酬]",
      totalReferrals: "[translate:総紹介数]",
      referralEarnings: "[translate:紹介収益]",
      commissionRate: "[translate:コミッション率]",
      inviteMessage: "[translate:招待メッセージ]",
      customMessage: "[translate:カスタムメッセージ]",
      shareViaLine: "[translate:LINEで共有]",
      shareViaTwitter: "[translate:Twitterで共有]",
      shareViaTelegram: "[translate:Telegramで共有]",
      shareViaWhatsApp: "[translate:WhatsAppで共有]"
    },

    yield: {
      apy: "[translate:APY]",
      currentYield: "[translate:現在の利回り]",
      estimatedEarnings: "[translate:推定収益]",
      yieldFarming: "[translate:イールドファーミング]",
      autoCompound: "[translate:自動複利]",
      strategy: "[translate:戦略]",
      riskLevel: "[translate:リスクレベル]",
      lowRisk: "[translate:低リスク]",
      mediumRisk: "[translate:中リスク]",
      highRisk: "[translate:高リスク]",
      totalValueLocked: "[translate:総ロック価値]",
      yourDeposits: "[translate:あなたの入金]",
      totalEarnings: "[translate:総収益]",
      dailyEarnings: "[translate:日次収益]",
      weeklyEarnings: "[translate:週次収益]",
      monthlyEarnings: "[translate:月次収益]",
      yearlyEarnings: "[translate:年次収益]"
    },

    errors: {
      networkError: "[translate:ネットワークエラーが発生しました]",
      walletError: "[translate:ウォレットエラーが発生しました]",
      transactionError: "[translate:取引エラーが発生しました]",
      insufficientFunds: "[translate:資金不足]",
      userRejected: "[translate:ユーザーが取引を拒否しました]",
      networkMismatch: "[translate:ネットワークの不一致]",
      contractError: "[translate:コントラクトエラーが発生しました]",
      unknownError: "[translate:不明なエラーが発生しました]",
      tryAgain: "[translate:もう一度お試しください]",
      contactSupport: "[translate:サポートにお問い合わせください]",
      checkConnection: "[translate:接続を確認してください]",
      refreshPage: "[translate:ページを更新してください]"
    },

    success: {
      walletConnected: "[translate:ウォレットが正常に接続されました]",
      transactionSubmitted: "[translate:取引が正常に送信されました]",
      transactionConfirmed: "[translate:取引が確認されました]",
      tokensClaimed: "[translate:トークンが正常に請求されました]",
      tokensStaked: "[translate:トークンが正常にステーキングされました]",
      tokensUnstaked: "[translate:トークンが正常にステーキング解除されました]",
      referralSent: "[translate:紹介が正常に送信されました]",
      settingsSaved: "[translate:設定が正常に保存されました]",
      copiedToClipboard: "[translate:クリップボードにコピーされました]",
      linkShared: "[translate:リンクが正常に共有されました]"
    },

    settings: {
      language: "[translate:言語]",
      theme: "[translate:テーマ]",
      notifications: "[translate:通知]",
      security: "[translate:セキュリティ]",
      privacy: "[translate:プライバシー]",
      account: "[translate:アカウント]",
      preferences: "[translate:設定]",
      darkMode: "[translate:ダークモード]",
      lightMode: "[translate:ライトモード]",
      autoMode: "[translate:自動モード]",
      enableNotifications: "[translate:通知を有効にする]",
      emailNotifications: "[translate:メール通知]",
      pushNotifications: "[translate:プッシュ通知]",
      smsNotifications: "[translate:SMS通知]"
    },

    maintenance: {
      underMaintenance: "[translate:メンテナンス中]",
      maintenanceMessage: "[translate:現在、サービス向上のための定期メンテナンスを実施しています。]",
      estimatedDuration: "[translate:推定時間]",
      progress: "[translate:進捗]",
      checkAgain: "[translate:再確認]",
      getUpdates: "[translate:更新を取得]",
      contactSupport: "[translate:サポートに連絡]",
      whyMaintenance: "[translate:なぜメンテナンス？]",
      maintenanceReason: "[translate:お客様のDeFi投資の最高レベルのセキュリティ、パフォーマンス、信頼性を確保するため、定期的にメンテナンスを実施しています。]"
    },

    landing: {
      title: "[translate:LINE Yield]",
      subtitle: "[translate:USDTで自動利回りを獲得]",
      description: "[translate:LINE Yieldは、LINEメッセンジャー内で自動化されたDeFi戦略を通じて、ステーブルコインの収益を最大化できます。設定して忘れるだけです。]",
      getStarted: "[translate:始める]",
      learnMore: "[translate:詳細を見る]",
      features: "[translate:機能]",
      security: "[translate:セキュリティ]",
      performance: "[translate:パフォーマンス]",
      easeOfUse: "[translate:使いやすさ]",
      community: "[translate:コミュニティ]",
      testimonials: "[translate:お客様の声]",
      faq: "[translate:よくある質問]",
      joinNow: "[translate:今すぐ参加]"
    }
  }
};

// Language configuration
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' }
];

export const defaultLanguage = 'en';

// Helper function to get nested translation
export const getNestedTranslation = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
};

// Helper function to extract translation from [translate:] markup
export const extractTranslation = (text: string): string => {
  const match = text.match(/\[translate:(.*?)\]/);
  return match ? match[1] : text;
};
