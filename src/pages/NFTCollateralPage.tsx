import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NFTCollateral } from '../components/NFTCollateral';
import { Image, Shield, TrendingUp, DollarSign, Info } from 'lucide-react';

export const NFTCollateralPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">NFT Collateral System</h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Use your NFTs as collateral to borrow stablecoins with competitive interest rates. 
          Access liquidity without selling your valuable digital assets.
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Image className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold mb-2">NFT Collateral</h3>
              <p className="text-sm text-muted-foreground">
                Use your NFTs as collateral for loans
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold mb-2">Instant Liquidity</h3>
              <p className="text-sm text-muted-foreground">
                Get instant access to stablecoin liquidity
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <h3 className="font-semibold mb-2">Secure & Safe</h3>
              <p className="text-sm text-muted-foreground">
                Advanced liquidation protection and risk management
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-orange-600" />
              <h3 className="font-semibold mb-2">Competitive Rates</h3>
              <p className="text-sm text-muted-foreground">
                Low interest rates with flexible repayment terms
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main NFT Collateral Component */}
      <NFTCollateral />

      {/* Information Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            How NFT Collateral Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">For Borrowers:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Select an NFT from your wallet that's supported as collateral</li>
                <li>Choose the amount of stablecoin you want to borrow (up to the LTV limit)</li>
                <li>Deposit your NFT and receive instant stablecoin liquidity</li>
                <li>Pay interest on your loan over time</li>
                <li>Repay the loan to reclaim your NFT</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">For Liquidators:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Monitor positions for liquidation opportunities</li>
                <li>When collateral ratio falls below threshold, liquidate the position</li>
                <li>Pay the outstanding debt and receive the NFT as collateral</li>
                <li>Earn liquidation bonuses for maintaining system health</li>
                <li>Help protect the protocol from bad debt</li>
              </ol>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3">Key Features:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Multiple NFT Collections</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Real-time Price Oracle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Automatic Liquidations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Interest Accrual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Flexible Repayment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Risk Management</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Transparent Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>24/7 Monitoring</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3">Risk Management:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900 mb-1">Loan-to-Value (LTV)</div>
                <div className="text-blue-700">Maximum borrowing limit based on NFT value (typically 60-70%)</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="font-medium text-yellow-900 mb-1">Liquidation Threshold</div>
                <div className="text-yellow-700">Minimum collateral ratio before liquidation (typically 75-80%)</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="font-medium text-red-900 mb-1">Liquidation Bonus</div>
                <div className="text-red-700">Incentive for liquidators to maintain system health (typically 5%)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

