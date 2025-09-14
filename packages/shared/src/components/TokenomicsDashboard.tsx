import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';

interface TokenomicsInfo {
  totalSupply: string;
  maxSupply: string;
  totalStaked: string;
  totalVotingPower: string;
  circulatingSupply: string;
}

interface TokenDistribution {
  category: string;
  percentage: number;
  amount: string;
  description: string;
}

interface PriceData {
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  circulatingSupply: string;
}

interface UserStakingInfo {
  stakedBalance: string;
  votingPower: string;
  pendingRewards: string;
  lastStakeTime: number;
}

interface LeaderboardEntry {
  address: string;
  stakedBalance: string;
  votingPower: string;
  pendingRewards: string;
  rank: number;
}

export const TokenomicsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'staking' | 'governance' | 'distribution'>('overview');
  const [tokenomicsInfo, setTokenomicsInfo] = useState<TokenomicsInfo | null>(null);
  const [distribution, setDistribution] = useState<TokenDistribution[]>([]);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [stakingInfo, setStakingInfo] = useState<UserStakingInfo | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');

  useEffect(() => {
    loadTokenomicsData();
  }, []);

  const loadTokenomicsData = async () => {
    try {
      setLoading(true);
      
      // Load tokenomics info
      const infoResponse = await fetch('/api/tokenomics/info');
      const infoData = await infoResponse.json();
      if (infoData.success) {
        setTokenomicsInfo(infoData.data);
      }

      // Load distribution data
      const distResponse = await fetch('/api/tokenomics/distribution');
      const distData = await distResponse.json();
      if (distData.success) {
        setDistribution(distData.data);
      }

      // Load price data
      const priceResponse = await fetch('/api/tokenomics/price');
      const priceData = await priceResponse.json();
      if (priceData.success) {
        setPriceData(priceData.data);
      }

      // Load leaderboard
      const leaderboardResponse = await fetch('/api/tokenomics/leaderboard');
      const leaderboardData = await leaderboardResponse.json();
      if (leaderboardData.success) {
        setLeaderboard(leaderboardData.data);
      }

    } catch (error) {
      console.error('Error loading tokenomics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount) return;
    
    try {
      const response = await fetch('/api/tokenomics/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: '0x...', // This would come from wallet context
          amount: stakeAmount
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Staking transaction submitted successfully!');
        setStakeAmount('');
        loadTokenomicsData();
      }
    } catch (error) {
      console.error('Error staking tokens:', error);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount) return;
    
    try {
      const response = await fetch('/api/tokenomics/unstake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: '0x...', // This would come from wallet context
          amount: unstakeAmount
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Unstaking transaction submitted successfully!');
        setUnstakeAmount('');
        loadTokenomicsData();
      }
    } catch (error) {
      console.error('Error unstaking tokens:', error);
    }
  };

  const handleClaimRewards = async () => {
    try {
      const response = await fetch('/api/tokenomics/claim-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: '0x...' // This would come from wallet context
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Rewards claimed successfully!');
        loadTokenomicsData();
      }
    } catch (error) {
      console.error('Error claiming rewards:', error);
    }
  };

  const formatNumber = (num: string | number): string => {
    const value = typeof num === 'string' ? parseFloat(num) : num;
    if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
    if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
    return value.toFixed(2);
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading tokenomics data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">YIELD Tokenomics</h1>
        <p className="text-gray-600">Comprehensive token economics and governance system</p>
      </div>

      {/* Price Overview */}
      {priceData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Price</div>
              <div className="text-2xl font-bold">${priceData.price.toFixed(4)}</div>
              <div className={`text-sm ${priceData.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceData.priceChange24h >= 0 ? '+' : ''}{priceData.priceChange24h.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Market Cap</div>
              <div className="text-2xl font-bold">${formatNumber(priceData.marketCap)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">24h Volume</div>
              <div className="text-2xl font-bold">${formatNumber(priceData.volume24h)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Circulating Supply</div>
              <div className="text-2xl font-bold">{formatNumber(priceData.circulatingSupply)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'staking', label: 'Staking' },
          { id: 'governance', label: 'Governance' },
          { id: 'distribution', label: 'Distribution' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Tokenomics Stats */}
          {tokenomicsInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Supply Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Supply:</span>
                    <span className="font-semibold">{formatNumber(tokenomicsInfo.totalSupply)} YIELD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Supply:</span>
                    <span className="font-semibold">{formatNumber(tokenomicsInfo.maxSupply)} YIELD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Circulating:</span>
                    <span className="font-semibold">{formatNumber(tokenomicsInfo.circulatingSupply)} YIELD</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Staking Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Staked:</span>
                    <span className="font-semibold">{formatNumber(tokenomicsInfo.totalStaked)} YIELD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Staking Rate:</span>
                    <span className="font-semibold">
                      {((parseFloat(tokenomicsInfo.totalStaked) / parseFloat(tokenomicsInfo.totalSupply)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">APY:</span>
                    <span className="font-semibold text-green-600">10%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Governance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Voting Power:</span>
                    <span className="font-semibold">{formatNumber(tokenomicsInfo.totalVotingPower)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Proposals:</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Voting Period:</span>
                    <span className="font-semibold">7 days</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Token Utility */}
          <Card>
            <CardHeader>
              <CardTitle>Token Utility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Governance Rights</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Vote on protocol upgrades</li>
                    <li>• Propose new features</li>
                    <li>• Control treasury allocation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Staking Rewards</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 10% APY staking rewards</li>
                    <li>• Compound interest</li>
                    <li>• Flexible staking periods</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Fee Discounts</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Lower loan origination fees</li>
                    <li>• Reduced trading fees</li>
                    <li>• Priority customer support</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Premium Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Advanced analytics</li>
                    <li>• Early access to products</li>
                    <li>• VIP customer support</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'staking' && (
        <div className="space-y-6">
          {/* Staking Interface */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stake YIELD Tokens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Stake
                  </label>
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <p>• Earn 10% APY on staked tokens</p>
                  <p>• Minimum stake period: 7 days</p>
                  <p>• Rewards compound automatically</p>
                </div>
                <Button onClick={handleStake} className="w-full">
                  Stake Tokens
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unstake Tokens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Unstake
                  </label>
                  <input
                    type="number"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <p>• 7-day cooldown period required</p>
                  <p>• Unstaking reduces voting power</p>
                  <p>• Claim rewards before unstaking</p>
                </div>
                <Button onClick={handleUnstake} className="w-full">
                  Unstake Tokens
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Rewards Section */}
          <Card>
            <CardHeader>
              <CardTitle>Claim Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Rewards</p>
                  <p className="text-2xl font-bold">0.00 YIELD</p>
                </div>
                <Button onClick={handleClaimRewards}>
                  Claim Rewards
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Staking Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((entry) => (
                  <div key={entry.address} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">#{entry.rank}</Badge>
                      <span className="font-mono text-sm">{formatAddress(entry.address)}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatNumber(entry.stakedBalance)} YIELD</div>
                      <div className="text-sm text-gray-600">{formatNumber(entry.pendingRewards)} rewards</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'distribution' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Token Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {distribution.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{item.category}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{item.percentage}%</div>
                        <div className="text-sm text-gray-600">{formatNumber(item.amount)} YIELD</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'governance' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">Increase Staking APY to 12%</h4>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Proposal to increase the staking rewards from 10% to 12% APY to attract more stakers.
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>For: 1,250,000 votes</span>
                    <span>Against: 450,000 votes</span>
                    <span>Ends: 3 days</span>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">Add New Collateral Types</h4>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Proposal to add USDC and WBTC as collateral types for loans.
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>For: 890,000 votes</span>
                    <span>Against: 210,000 votes</span>
                    <span>Ends: 5 days</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

