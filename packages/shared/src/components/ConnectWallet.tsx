import React from 'react'
import { useUniversalWallet } from '../hooks/useUniversalWallet'
import { usePlatform } from '../hooks/usePlatform'

interface ConnectWalletProps {
  className?: string
}

export const ConnectWallet: React.FC<ConnectWalletProps> = ({ className = '' }) => {
  const { wallet, connectWallet, disconnectWallet } = useUniversalWallet()
  const { isLiff } = usePlatform()

  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  return (
    <div className={`connect-wallet ${className}`}>
      {wallet.isConnected ? (
        <div className="wallet-info flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Connected: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
          </span>
          <button
            onClick={disconnectWallet}
            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button 
          onClick={handleConnect}
          className={`connect-btn px-4 py-2 rounded-lg font-medium transition-colors ${
            isLiff 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLiff ? 'Connect LINE Wallet' : 'Connect Wallet'}
        </button>
      )}
    </div>
  )
}