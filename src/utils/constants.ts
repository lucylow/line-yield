export const VAULT_ADDRESS = "0x742d35Cc6635C0532925a3b8D5c6E59F1a5b7b0F"; // Mock address

export const KLAYTN_MAINNET = {
  chainId: 8217,
  chainName: 'Kaia Mainnet',
  nativeCurrency: {
    name: 'KLAY',
    symbol: 'KLAY',
    decimals: 18,
  },
  rpcUrls: ['https://public-en.kaia.klaytn.net'],
  blockExplorerUrls: ['https://klaytnscope.com/'],
};

export const KLAYTN_TESTNET = {
  chainId: 1001,
  chainName: 'Kaia Testnet',
  nativeCurrency: {
    name: 'KLAY',
    symbol: 'KLAY',
    decimals: 18,
  },
  rpcUrls: ['https://api.baobab.klaytn.net:8651'],
  blockExplorerUrls: ['https://baobab.klaytnscope.com/'],
};

export const VAULT_ABI = [
  'function deposit(uint256 assets, address receiver) returns (uint256 shares)',
  'function withdraw(uint256 assets, address receiver, address owner) returns (uint256 shares)',
  'function balanceOf(address account) view returns (uint256)',
  'function totalAssets() view returns (uint256)',
  'function convertToAssets(uint256 shares) view returns (uint256)',
  'function getApy() view returns (uint256)',
  'function earned(address account) view returns (uint256)',
];