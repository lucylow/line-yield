import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown,
  TrendingUp,
  Users,
  Target,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { Leaderboard, LeaderboardType, LeaderboardPeriod, LeaderboardEntry } from '../types/gamification';
import { useT } from '../hooks/useLocalization';
import { cn } from '../utils/cn';

interface LeaderboardProps {
  leaderboard: Leaderboard;
  loading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export const LeaderboardComponent: React.FC<LeaderboardProps> = ({
  leaderboard,
  loading = false,
  onRefresh,
  className = ''
}) => {
  const t = useT();
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>(leaderboard.period);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaderboardIcon = (type: LeaderboardType) => {
    switch (type) {
      case LeaderboardType.POINTS:
        return <Trophy className="w-5 h-5" />;
      case LeaderboardType.LEVEL:
        return <TrendingUp className="w-5 h-5" />;
      case LeaderboardType.TRADING_VOLUME:
        return <TrendingUp className="w-5 h-5" />;
      case LeaderboardType.REFERRALS:
        return <Users className="w-5 h-5" />;
      case LeaderboardType.STREAK:
        return <Target className="w-5 h-5" />;
      case LeaderboardType.ACHIEVEMENTS:
        return <Award className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  const formatValue = (entry: LeaderboardEntry, type: LeaderboardType) => {
    switch (type) {
      case LeaderboardType.POINTS:
        return `${entry.points.toLocaleString()} pts`;
      case LeaderboardType.LEVEL:
        return `Level ${entry.level}`;
      case LeaderboardType.TRADING_VOLUME:
        return `$${entry.points.toLocaleString()}`;
      case LeaderboardType.REFERRALS:
        return `${entry.achievements} friends`;
      case LeaderboardType.STREAK:
        return `${entry.points} days`;
      case LeaderboardType.ACHIEVEMENTS:
        return `${entry.achievements} achievements`;
      default:
        return entry.points.toString();
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getLeaderboardIcon(leaderboard.type)}
            <div>
              <CardTitle className="text-xl">{leaderboard.title}</CardTitle>
              <CardDescription>
                {leaderboard.totalParticipants} participants
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Top 3 Podium */}
        {leaderboard.entries.length >= 3 && (
          <div className="mb-6">
            <div className="flex items-end justify-center gap-4 mb-4">
              {/* 2nd Place */}
              {leaderboard.entries[1] && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-gray-600">2</span>
                  </div>
                  <div className="text-sm font-medium">{leaderboard.entries[1].username}</div>
                  <div className="text-xs text-gray-500">
                    {formatValue(leaderboard.entries[1], leaderboard.type)}
                  </div>
                </div>
              )}

              {/* 1st Place */}
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow-200 rounded-full flex items-center justify-center mb-2">
                  <Crown className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="text-sm font-medium">{leaderboard.entries[0].username}</div>
                <div className="text-xs text-gray-500">
                  {formatValue(leaderboard.entries[0], leaderboard.type)}
                </div>
              </div>

              {/* 3rd Place */}
              {leaderboard.entries[2] && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-amber-600">3</span>
                  </div>
                  <div className="text-sm font-medium">{leaderboard.entries[2].username}</div>
                  <div className="text-xs text-gray-500">
                    {formatValue(leaderboard.entries[2], leaderboard.type)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600 mb-3">Full Rankings</div>
          {leaderboard.entries.map((entry, index) => (
            <div
              key={entry.userId}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg transition-colors',
                entry.isCurrentUser 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-gray-50 hover:bg-gray-100',
                index < 3 && 'border-2 border-yellow-200'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  getRankColor(entry.rank)
                )}>
                  {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.username}</span>
                    {entry.isCurrentUser && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Level {entry.level} • {entry.achievements} achievements
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {formatValue(entry, leaderboard.type)}
                </div>
                <div className="text-xs text-gray-500">
                  {entry.badges} badges
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Last Updated */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Last updated: {leaderboard.lastUpdated.toLocaleTimeString()}
            </div>
            <div>
              {leaderboard.period} rankings
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardComponent;
