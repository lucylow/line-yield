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

  const connectWallet = useCallback(async () => {
    try {
      if (isLiff) {
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
      } else {
        // Web wallet connection (MetaMask, etc.)
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