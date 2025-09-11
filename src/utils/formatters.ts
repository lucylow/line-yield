import { ethers } from 'ethers';

export const formatCurrency = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatBalance = (balance: ethers.BigNumberish, decimals: number = 4): string => {
  const formatted = ethers.formatUnits(balance, 6); // USDT has 6 decimals
  return formatCurrency(parseFloat(formatted), decimals);
};

export const truncateAddress = (address: string, start: number = 6, end: number = 4): string => {
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export const formatApy = (apy: number): string => {
  return `${(apy * 100).toFixed(2)}%`;
};