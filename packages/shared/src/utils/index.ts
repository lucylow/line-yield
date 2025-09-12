// Utility functions can be added here
export const formatCurrency = (amount: number, currency: string): string => {
  return `${amount} ${currency}`;
};

export const truncateAddress = (address: string, start = 6, end = 4): string => {
  if (!address) return "";
  return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
};
