import React, { useState, useEffect } from 'react';
import { useLiff } from '../providers/LiffProvider';

interface RewardsWidgetProps {
  className?: string;
  compact?: boolean;
}

export const RewardsWidget: React.FC<RewardsWidgetProps> = ({ 
  className = '', 
  compact = false 
}) => {
  const { user, isInitialized } = useLiff();
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [tier, setTier] = useState('bronze');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    if (isInitialized && user) {
      // Simulate loading user points
      setIsLoading(true);
      setTimeout(() => {
        setPoints(1250);
        setLevel(2);
        setTier('silver');
        setIsLoading(false);
      }, 1000);
    }
  }, [isInitialized, user]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 bg-amber-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'platinum': return 'text-blue-600 bg-blue-100';
      case 'diamond': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '💎';
      case 'diamond': return '💠';
      default: return '⭐';
    }
  };

  const handleClaimBonus = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPoints(prev => prev + 1000);
      setIsLoading(false);
    }, 1500);
  };

  if (!isInitialized) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-xl">🎁</span>
            Rewards
          </h3>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTierColor(tier)}`}>
            {getTierIcon(tier)} {tier.toUpperCase()}
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Processing...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {points.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Available Points</div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Level {level}</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(points / 2500) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {points} / 2,500 to next level
              </div>
            </div>

            <button
              onClick={handleClaimBonus}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {isLoading ? 'Claiming...' : 'Claim Welcome Bonus'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎁</span>
        <h3 className="text-lg font-semibold text-gray-900">Rewards Center</h3>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rewards...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Points Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {points.toLocaleString()}
              </div>
              <div className="text-sm text-blue-600">Available</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {points.toLocaleString()}
              </div>
              <div className="text-sm text-green-600">Total</div>
            </div>
          </div>

          {/* Tier and Level */}
          <div className="text-center">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium ${getTierColor(tier)}`}>
              {getTierIcon(tier)} {tier.toUpperCase()} - Level {level}
            </span>
          </div>

          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {level + 1}</span>
              <span>{Math.round((points / 2500) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(points / 2500) * 100}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-gray-600">
              {points.toLocaleString()} / 2,500 points
            </div>
          </div>

          {/* Quick Rewards */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Quick Rewards</h4>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium text-green-800">Welcome Bonus</div>
                <div className="text-sm text-green-600">1,000 points for new users</div>
              </div>
              <button
                onClick={handleClaimBonus}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                {isLoading ? 'Claiming...' : 'Claim'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium text-blue-800">Daily Login</div>
                <div className="text-sm text-blue-600">50 points every day</div>
              </div>
              <button
                disabled={true}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
              >
                Claimed
              </button>
            </div>
          </div>

          {/* Rewards Info */}
          <div className="text-center">
            <button className="text-sm text-blue-600 hover:text-blue-800 underline">
              View All Rewards →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsWidget;


