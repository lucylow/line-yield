import React, { useState } from 'react';
import { MobileNavigation } from '../components/MobileNavigation';
import { MobileCard, MobileCardHeader, MobileCardContent, MobileCardTitle } from '../components/MobileCard';
import { MobileButton } from '../components/MobileButton';
import { MobileModal, MobileModalActions } from '../components/MobileModal';
import { GamificationDashboard } from '@shared/components';
import { 
  Trophy, 
  Target, 
  Crown, 
  Coins, 
  Users, 
  TrendingUp,
  Gift,
  Award,
  Star,
  Zap,
  RefreshCw,
  Calendar,
  BarChart3,
  ArrowRightLeft,
  Download,
  ExternalLink
} from 'lucide-react';

export const MobileGamification: React.FC = () => {
  const [activeTab, setActiveTab] = useState('missions');
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [isNFTModalOpen, setIsNFTModalOpen] = useState(false);

  const userId = 'user123'; // This would come from auth context

  const tabs = [
    { id: 'missions', name: 'Missions', icon: Target },
    { id: 'leaderboard', name: 'Leaderboard', icon: Trophy },
    { id: 'nfts', name: 'NFTs', icon: Gift },
    { id: 'exchange', name: 'Exchange', icon: ArrowRightLeft },
  ];

  const handleNFTView = (nft: any) => {
    setSelectedNFT(nft);
    setIsNFTModalOpen(true);
  };

  const handleNFTClaim = (nftId: string) => {
    console.log('Claiming NFT:', nftId);
    // NFT claiming logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Main Content */}
      <div className="pt-20 px-4 pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gamification</h1>
          <p className="text-gray-600 text-sm">Complete missions, earn rewards, and compete with others</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <MobileCard padding="sm" className="text-center">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600">Points</span>
            </div>
            <div className="text-xl font-bold text-gray-900">1,250</div>
          </MobileCard>
          
          <MobileCard padding="sm" className="text-center">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Level</span>
            </div>
            <div className="text-xl font-bold text-gray-900">5</div>
          </MobileCard>
          
          <MobileCard padding="sm" className="text-center">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Missions</span>
            </div>
            <div className="text-xl font-bold text-gray-900">3/5</div>
          </MobileCard>
          
          <MobileCard padding="sm" className="text-center">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">NFTs</span>
            </div>
            <div className="text-xl font-bold text-gray-900">2</div>
          </MobileCard>
        </div>

        {/* Level Progress */}
        <MobileCard className="mb-6">
          <MobileCardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <MobileCardTitle size="sm">Level Progress</MobileCardTitle>
            </div>
          </MobileCardHeader>
          <MobileCardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Experience to Next Level</span>
                <span className="font-medium">750 / 1000 XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300" style={{ width: '75%' }} />
              </div>
              <div className="text-xs text-gray-500 text-center">
                75% to Level 6
              </div>
            </div>
          </MobileCardContent>
        </MobileCard>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <MobileButton
                key={tab.id}
                variant={activeTab === tab.id ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="flex-shrink-0"
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </MobileButton>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'missions' && (
          <div className="space-y-4">
            <MobileCard>
              <MobileCardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-green-600" />
                  </div>
                  <MobileCardTitle size="sm">First Purchase</MobileCardTitle>
                </div>
              </MobileCardHeader>
              <MobileCardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">Make your first USDT deposit</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">0 / 1</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium">Reward: 100 Points</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Available</span>
                  </div>
                  <MobileButton
                    variant="outline"
                    fullWidth
                    disabled
                    className="border-green-300 text-green-600"
                  >
                    Complete Mission First
                  </MobileButton>
                </div>
              </MobileCardContent>
            </MobileCard>

            <MobileCard>
              <MobileCardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-blue-600" />
                  </div>
                  <MobileCardTitle size="sm">Mission Master</MobileCardTitle>
                </div>
              </MobileCardHeader>
              <MobileCardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">Complete 5 different missions</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">3 / 5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Reward: Mission Master NFT</span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">In Progress</span>
                  </div>
                  <MobileButton
                    variant="outline"
                    fullWidth
                    disabled
                    className="border-blue-300 text-blue-600"
                  >
                    Complete 2 More Missions
                  </MobileButton>
                </div>
              </MobileCardContent>
            </MobileCard>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <MobileCard>
              <MobileCardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                  </div>
                  <MobileCardTitle size="sm">Points Leaderboard</MobileCardTitle>
                </div>
              </MobileCardHeader>
              <MobileCardContent>
                <div className="space-y-3">
                  {/* Top 3 Podium */}
                  <div className="flex items-end justify-center gap-3 mb-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                        <span className="text-lg font-bold text-gray-600">2</span>
                      </div>
                      <div className="text-xs font-medium">User456</div>
                      <div className="text-xs text-gray-500">2,150 pts</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center mb-1">
                        <Crown className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="text-xs font-medium">User789</div>
                      <div className="text-xs text-gray-500">2,850 pts</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center mb-1">
                        <span className="text-lg font-bold text-amber-600">3</span>
                      </div>
                      <div className="text-xs font-medium">User123</div>
                      <div className="text-xs text-gray-500">1,950 pts</div>
                    </div>
                  </div>

                  {/* Your Rank */}
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">7</span>
                        </div>
                        <div>
                          <p className="font-medium text-blue-800">You</p>
                          <p className="text-xs text-blue-600">Level 5 • 1,250 pts</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-800">1,250</p>
                        <p className="text-xs text-blue-600">points</p>
                      </div>
                    </div>
                  </div>
                </div>
              </MobileCardContent>
            </MobileCard>
          </div>
        )}

        {activeTab === 'nfts' && (
          <div className="space-y-4">
            <MobileCard>
              <MobileCardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                    <Gift className="w-4 h-4 text-purple-600" />
                  </div>
                  <MobileCardTitle size="sm">Your NFT Collection</MobileCardTitle>
                </div>
              </MobileCardHeader>
              <MobileCardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => handleNFTView({ id: '1', name: 'Mission Master', rarity: 'Rare' })}
                  >
                    <div className="aspect-square bg-white rounded-lg mb-3 flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm text-gray-900">Mission Master</p>
                      <p className="text-xs text-purple-600">Rare NFT</p>
                    </div>
                  </div>
                  
                  <div 
                    className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-4 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => handleNFTView({ id: '2', name: 'Yield Legend', rarity: 'Legendary' })}
                  >
                    <div className="aspect-square bg-white rounded-lg mb-3 flex items-center justify-center">
                      <Crown className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm text-gray-900">Yield Legend</p>
                      <p className="text-xs text-yellow-600">Legendary NFT</p>
                    </div>
                  </div>
                </div>
              </MobileCardContent>
            </MobileCard>
          </div>
        )}

        {activeTab === 'exchange' && (
          <div className="space-y-4">
            <MobileCard>
              <MobileCardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                    <ArrowRightLeft className="w-4 h-4 text-green-600" />
                  </div>
                  <MobileCardTitle size="sm">Point Exchange</MobileCardTitle>
                </div>
              </MobileCardHeader>
              <MobileCardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium">Your Points Balance</span>
                      </div>
                      <div className="text-xl font-bold text-blue-600">1,250</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">LINE_YIELD_POINTS → KAIA</div>
                          <div className="text-sm text-gray-600">Rate: 1000 points = 1 KAIA</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">Fee: 5%</div>
                          <div className="text-xs text-gray-500">Min: 1000 | Max: 100000</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-medium">Points to Exchange</div>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="1000"
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <span className="absolute right-3 top-3 text-sm text-gray-500">Points</span>
                    </div>
                    <div className="flex gap-2">
                      <MobileButton variant="outline" size="sm" className="flex-1">Min</MobileButton>
                      <MobileButton variant="outline" size="sm" className="flex-1">25%</MobileButton>
                      <MobileButton variant="outline" size="sm" className="flex-1">50%</MobileButton>
                      <MobileButton variant="outline" size="sm" className="flex-1">Max</MobileButton>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Exchange Calculation</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Exchange Amount:</span>
                        <span className="font-medium">1.000 KAIA</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Fee (5%):</span>
                        <span className="font-medium">-0.050 KAIA</span>
                      </div>
                      <div className="border-t pt-1 flex justify-between font-bold text-blue-800">
                        <span>You Receive:</span>
                        <span>0.950 KAIA</span>
                      </div>
                    </div>
                  </div>

                  <MobileButton
                    fullWidth
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white"
                  >
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Exchange Points
                  </MobileButton>
                </div>
              </MobileCardContent>
            </MobileCard>
          </div>
        )}
      </div>

      {/* NFT Modal */}
      <MobileModal
        isOpen={isNFTModalOpen}
        onClose={() => setIsNFTModalOpen(false)}
        title={selectedNFT?.name || 'NFT Details'}
      >
        {selectedNFT && (
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              <Trophy className="w-16 h-16 text-purple-600" />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedNFT.name}</h3>
              <p className="text-sm text-gray-600 mb-3">Awarded for completing missions</p>
              <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                {selectedNFT.rarity}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Collection</span>
                <span className="font-medium">LINE Yield Achievements</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Token ID</span>
                <span className="font-medium">#1</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Minted</span>
                <span className="font-medium">2 days ago</span>
              </div>
            </div>

            <MobileModalActions>
              <MobileButton
                variant="outline"
                fullWidth
                onClick={() => setIsNFTModalOpen(false)}
              >
                Close
              </MobileButton>
              <MobileButton
                fullWidth
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </MobileButton>
            </MobileModalActions>
          </div>
        )}
      </MobileModal>
    </div>
  );
};

export default MobileGamification;
