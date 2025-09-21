import React, { useState } from 'react'
import { useUniversalWallet } from '../hooks/useUniversalWallet'
import { usePlatform } from '../hooks/usePlatform'
import { ConnectWalletModal } from './ConnectWalletModal'
import { WalletConnectionToast } from './WalletConnectionToast'
import { Button } from './Button'
import { cn } from '../utils/cn'

interface ConnectWalletProps {
  className?: string
}

export const ConnectWallet: React.FC<ConnectWalletProps> = ({ className = '' }) => {
  const { wallet, connectWallet, disconnectWallet } = useUniversalWallet()
  const { isLiff } = usePlatform()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    isVisible: false,
    message: '',
    type: 'success'
  })

  const handleConnect = async (walletType?: string) => {
    try {
      console.log(`Attempting to connect wallet with type: ${walletType || 'default'}`)
      if (walletType) {
        await connectWallet({ type: walletType })
      } else {
        await connectWallet()
      }
      console.log('Wallet connected successfully!')
      setIsModalOpen(false) // Close modal on successful connection
      setToast({
        isVisible: true,
        message: `Successfully connected to ${walletType || 'wallet'}!`,
        type: 'success'
      })
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setToast({
        isVisible: true,
        message: `Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      })
    }
  }

  const handleButtonClick = () => {
    if (wallet.isConnected) {
      disconnectWallet()
    } else {
      setIsModalOpen(true) // Open modal when not connected
    }
  }

  return (
    <>
      <div className={`connect-wallet ${className}`}>
        {wallet.isConnected ? (
          <div className="wallet-info flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Connected: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
            </span>
            <button
              onClick={handleButtonClick}
              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <Button 
            onClick={handleButtonClick}
            className={cn(
              'connect-btn',
              isLiff 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700',
              className
            )}
          >
            {isLiff ? 'Connect LINE Wallet' : 'Connect Wallet'}
          </Button>
        )}
      </div>
      
      <ConnectWalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnect}
      />
      
      <WalletConnectionToast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </>
  )
}