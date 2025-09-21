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
        // Default web wallet connection (MetaMask, Kaia Wallet, etc.)
        // Check for Kaia wallet first, then fallback to ethereum
        let provider = (window as any).kaia || (window as any).ethereum
        
        if (!provider) {
          throw new Error('No wallet found. Please install Kaia Wallet or MetaMask.')
        }
        
        try {
          const accounts = await provider.request({ method: 'eth_requestAccounts' })
          const address = accounts[0]
          
          // If using Kaia wallet, switch to Kaia network
          if ((window as any).kaia) {
            try {
              await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x2019' }], // Kaia chain ID in hex
              })
            } catch (switchError: any) {
              // If the network doesn't exist, add it
              if (switchError.code === 4902) {
                await provider.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0x2019',
                    chainName: 'Kaia Mainnet',
                    rpcUrls: ['https://public-en.node.kaia.io'],
                    blockExplorerUrls: ['https://kaiascan.io'],
                    nativeCurrency: {
                      name: 'Kaia',
                      symbol: 'KAIA',
                      decimals: 18,
                    },
                  }],
                })
              }
            }
          }
          
          setWallet({
            isConnected: true,
            address,
            provider
          })
          
          console.log(`Successfully connected to wallet: ${address}`)
        } catch (error) {
          console.error('Wallet connection failed:', error)
          throw error
        }
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