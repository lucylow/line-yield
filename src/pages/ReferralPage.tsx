import React, { useState, useEffect } from 'react';
import { ReferralPromotion } from '@shared/components/ReferralPromotion';
import { cn } from '../utils/cn';

interface ReferralLeaderboardEntry {
  rank: number;
  wallet_address: string;
  referral_code: string;
  total_referrals: number;
  active_referrals: number;
  total_earnings: number;
}

export const ReferralPage: React.FC = () => {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<ReferralLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock wallet connection - in real app this would come from wallet context
  useEffect(() => {
    // Simulate wallet connection
    const mockAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
    setUserAddress(mockAddress);
  }, []);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/referral/leaderboard?limit=10');
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.leaderboard || []);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatPoints = (points: number) => {
    return points.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🎁 Referral Program
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Invite friends and earn rewards together with LINE Yield
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg">
                <div className="text-sm font-medium">Total Referrals</div>
                <div className="text-2xl font-bold">
                  {leaderboard.reduce((sum, entry) => sum + entry.total_referrals, 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Referral Component */}
          <div className="lg:col-span-2">
            <ReferralPromotion userAddress={userAddress} />
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🏆 Top Referrers
              </h3>
              
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-4">
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <div key={entry.wallet_address} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                        index === 0 ? "bg-yellow-500" : 
                        index === 1 ? "bg-gray-400" : 
                        index === 2 ? "bg-orange-500" : "bg-blue-500"
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {formatAddress(entry.wallet_address)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {entry.total_referrals} referrals • {formatPoints(entry.total_earnings)} points
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          {entry.active_referrals}
                        </div>
                        <div className="text-xs text-gray-500">active</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No referrals yet</p>
                  <p className="text-sm text-gray-400">Be the first to refer friends!</p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  🔄 Refresh Leaderboard
                </button>
              </div>
            </div>

            {/* Referral Tips */}
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                💡 Referral Tips
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Share your referral link on social media</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Explain the benefits to your friends</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Help them get started with their first deposit</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Earn ongoing rewards from their yield</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            How the Referral Program Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Share Your Link</h3>
              <p className="text-gray-600">
                Get your unique referral code and share it with friends through social media, messaging, or word of mouth.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Friends Join</h3>
              <p className="text-gray-600">
                When your friends sign up using your referral code, both of you earn bonus Yield Points and benefits.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Earn Together</h3>
              <p className="text-gray-600">
                Earn rewards when they deposit USDT and continue earning a percentage of their yield earnings.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How much can I earn from referrals?
              </h3>
              <p className="text-gray-600">
                You earn 100 Yield Points when a friend signs up, 50 points when they make their first deposit, 
                and 10% of their ongoing yield earnings. There's no limit to how much you can earn!
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I refer myself or create multiple accounts?
              </h3>
              <p className="text-gray-600">
                No, self-referrals and duplicate accounts are not allowed. We have systems in place to detect 
                and prevent abuse of the referral program.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                When do I receive my referral rewards?
              </h3>
              <p className="text-gray-600">
                Referral rewards are credited immediately when the qualifying action occurs (signup, deposit, etc.). 
                You can track your earnings in the referral dashboard.
              </p>
            </div>
            
            <div className="pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a limit to how many people I can refer?
              </h3>
              <p className="text-gray-600">
                There's no limit to the number of people you can refer. The more friends you bring to LINE Yield, 
                the more you can earn through our referral program.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};