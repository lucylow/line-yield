import { useState, useCallback } from 'react'
import { usePlatform } from './usePlatform'

interface WalletInfo {
  isConnected: boolean
  address: string | null
  provider: any | null
}

export const useUniversalWallet = () => {
  const { isLiff } = usePlatform()
  const [wallet, setWallet] = useState<WalletInfo>({
    isConnected: false,
    address: null,
    provider: null
  })

  const connectWallet = useCallback(async (options?: { type?: string }) => {
    try {
      const walletType = options?.type
      
      if (isLiff || walletType === 'line') {
        // LIFF wallet connection
        if (typeof window !== 'undefined' && (window as any).liff) {
          const liff = (window as any).liff
          if (!liff.isLoggedIn()) {
            liff.login()
            return
          }
        }
        
        // Use LINE's built-in wallet or external wallet
        if ((window as any).ethereum) {
          const provider = (window as any).ethereum
          const accounts = await provider.request({ method: 'eth_requestAccounts' })
          const address = accounts[0]
          
          setWallet({
            isConnected: true,
            address,
            provider
          })
        }
      } else if (walletType === 'google' || walletType === 'apple' || walletType === 'naver' || walletType === 'kakao') {
        // Social login wallets - redirect to appropriate OAuth
        console.log(`Connecting with ${walletType} - OAuth flow would be implemented here`)
        // For now, we'll simulate a connection
        setWallet({
          isConnected: true,
          address: `0x${walletType}${Date.now().toString(16)}`,
          provider: null
        })
      } else if (walletType === 'okx' || walletType === 'bitget') {
        // External wallet connections
        console.log(`Connecting with ${walletType} wallet`)
        // These would typically open the respective wallet apps
        if ((window as any).ethereum) {
          const provider = (window as any).ethereum
          const accounts = await provider.request({ method: 'eth_requestAccounts' })
          const address = accounts[0]
          
          setWallet({
            isConnected: true,
            address,
            provider
          })
        }
      } else {
        // Default web wallet connection (MetaMask, etc.)
        if (!(window as any).ethereum) {
          throw new Error('No wallet found')
        }
        
        const provider = (window as any).ethereum
        const accounts = await provider.request({ method: 'eth_requestAccounts' })
        const address = accounts[0]
        
        setWallet({
          isConnected: true,
          address,
          provider
        })
      }
    } catch (error) {
      console.error('Wallet connection failed:', error)
      throw error
    }
  }, [isLiff])

  const disconnectWallet = useCallback(() => {
    setWallet({
      isConnected: false,
      address: null,
      provider: null
    })
  }, [])

  return { wallet, connectWallet, disconnectWallet }
}