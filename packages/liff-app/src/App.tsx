import React from 'react'
import { ConnectWallet } from '@shared/components/ConnectWallet'
import { usePlatform } from '@shared/hooks/usePlatform'

function App() {
  const { isLiff, isMobile } = usePlatform()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">LINE Yield</h1>
              {isLiff && (
                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                  LIFF
                </span>
              )}
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              <ConnectWallet />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to LINE Yield
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {isLiff ? 'Your DeFi platform optimized for LINE' : 'Your DeFi platform'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Loan Management</h3>
              <p className="text-gray-600 text-sm">
                Manage your DeFi loans with multiple loan types and flexible terms.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Referral Program</h3>
              <p className="text-gray-600 text-sm">
                Invite friends and earn rewards together.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">NFT Collection</h3>
              <p className="text-gray-600 text-sm">
                Collect and trade NFT badges based on your Yield Points.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 LINE Yield. All rights reserved.</p>
            <div className="mt-4 space-x-6">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms of Service</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App