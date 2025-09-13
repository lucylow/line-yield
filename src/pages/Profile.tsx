import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  User, 
  ArrowLeft, 
  Edit, 
  Trophy, 
  TrendingUp, 
  Wallet, 
  Calendar,
  Award,
  Target,
  Star,
  Share2,
  Copy
} from 'lucide-react';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile] = useState({
    username: 'yield_master_2024',
    displayName: 'Yield Master',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'DeFi enthusiast and yield farming expert. Building the future of decentralized finance.',
    joinDate: '2024-01-15',
    level: 5,
    totalPoints: 12500,
    nextLevelPoints: 15000,
    achievements: [
      { id: 1, name: 'First Deposit', icon: '💰', earned: true },
      { id: 2, name: 'Yield Farmer', icon: '🌾', earned: true },
      { id: 3, name: 'Referral Master', icon: '🎯', earned: true },
      { id: 4, name: 'NFT Collector', icon: '🎨', earned: true },
      { id: 5, name: 'Long-term Holder', icon: '💎', earned: false },
      { id: 6, name: 'Community Leader', icon: '👑', earned: false }
    ],
    stats: {
      totalDeposits: 25000,
      totalWithdrawals: 5000,
      totalYield: 3500,
      referralCount: 12,
      nftCount: 4,
      daysActive: 45
    },
    recentActivity: [
      { type: 'deposit', amount: 1000, date: '2024-01-20', status: 'completed' },
      { type: 'yield_earned', amount: 150, date: '2024-01-19', status: 'completed' },
      { type: 'nft_minted', name: 'Yield Pioneer', date: '2024-01-18', status: 'completed' },
      { type: 'referral', amount: 100, date: '2024-01-17', status: 'completed' }
    ]
  });

  const copyProfileLink = () => {
    const profileLink = `${window.location.origin}/profile/${userProfile.username}`;
    navigator.clipboard.writeText(profileLink);
    // Show toast notification
    console.log('Profile link copied to clipboard');
  };

  const shareProfile = () => {
    const profileLink = `${window.location.origin}/profile/${userProfile.username}`;
    if (navigator.share) {
      navigator.share({
        title: `${userProfile.displayName}'s LINE Yield Profile`,
        text: `Check out ${userProfile.displayName}'s yield farming achievements!`,
        url: profileLink
      });
    } else {
      copyProfileLink();
    }
  };

  const getLevelProgress = () => {
    const currentLevelPoints = userProfile.level * 2500; // 2500 points per level
    const nextLevelPoints = (userProfile.level + 1) * 2500;
    const progress = ((userProfile.totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                  <User className="w-8 h-8" />
                  <span>Profile</span>
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  Your yield farming journey and achievements
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={shareProfile}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={copyProfileLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative inline-block">
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.displayName}
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {userProfile.level}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{userProfile.displayName}</h2>
                <p className="text-gray-600 mb-4">@{userProfile.username}</p>
                <p className="text-sm text-gray-500 mb-4">{userProfile.bio}</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(userProfile.joinDate).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Level Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Level {userProfile.level}</span>
                    <span>{userProfile.totalPoints.toLocaleString()} points</span>
                  </div>
                  <Progress value={getLevelProgress()} className="h-2" />
                  <div className="text-xs text-gray-500 text-center">
                    {userProfile.nextLevelPoints - userProfile.totalPoints} points to Level {userProfile.level + 1}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Quick Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Deposits</span>
                  <span className="font-semibold">${userProfile.stats.totalDeposits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Yield</span>
                  <span className="font-semibold text-green-600">${userProfile.stats.totalYield.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Referrals</span>
                  <span className="font-semibold">{userProfile.stats.referralCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">NFTs</span>
                  <span className="font-semibold">{userProfile.stats.nftCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Days Active</span>
                  <span className="font-semibold">{userProfile.stats.daysActive}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {userProfile.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        achievement.earned
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <div className="text-sm font-medium">{achievement.name}</div>
                      {achievement.earned && (
                        <Badge variant="secondary" className="mt-2">
                          <Star className="w-3 h-3 mr-1" />
                          Earned
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userProfile.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          {activity.type === 'deposit' && <Wallet className="w-4 h-4 text-blue-600" />}
                          {activity.type === 'yield_earned' && <TrendingUp className="w-4 h-4 text-green-600" />}
                          {activity.type === 'nft_minted' && <Award className="w-4 h-4 text-purple-600" />}
                          {activity.type === 'referral' && <User className="w-4 h-4 text-orange-600" />}
                        </div>
                        <div>
                          <div className="font-medium capitalize">
                            {activity.type === 'nft_minted' ? activity.name : activity.type.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(activity.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.amount && (
                          <div className="font-semibold">
                            {activity.type === 'deposit' ? '+' : ''}${activity.amount.toLocaleString()}
                          </div>
                        )}
                        <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                    <p>Performance chart would be displayed here</p>
                    <p className="text-sm">Track your yield farming progress over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
