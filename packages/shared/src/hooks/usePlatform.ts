import { useState, useEffect } from 'react'

interface PlatformInfo {
  isLiff: boolean
  isWeb: boolean
  isMobile: boolean
  platform: 'liff' | 'web'
}

export const usePlatform = (): PlatformInfo => {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    isLiff: false,
    isWeb: true,
    isMobile: false,
    platform: 'web'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const userAgent = window.navigator.userAgent
    const isLiff = window.location.href.includes('liff') ||
                   userAgent.includes('Line') ||
                   import.meta.env.VITE_APP_MODE === 'liff'
    
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

    setPlatformInfo({
      isLiff,
      isWeb: !isLiff,
      isMobile,
      platform: isLiff ? 'liff' : 'web'
    })
  }, [])

  return platformInfo
}