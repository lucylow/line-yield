import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Trophy, 
  Users, 
  TrendingUp, 
  Gift,
  Clock,
  CheckCircle,
  Lock
} from 'lucide-react';
import { Mission, MissionStatus, MissionDifficulty, RewardType } from '../types/gamification';
import { useT } from '../hooks/useLocalization';
import { cn } from '../utils/cn';

interface MissionCardProps {
  mission: Mission;
  onComplete?: (missionId: string) => void;
  className?: string;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  onComplete,
  className = ''
}) => {
  const t = useT();

  const getMissionIcon = (type: string) => {
    switch (type) {
      case 'first_purchase':
        return <Target className="w-5 h-5" />;
      case 'complete_missions':
        return <Trophy className="w-5 h-5" />;
      case 'invite_friends':
        return <Users className="w-5 h-5" />;
      case 'deposit_amount':
        return <TrendingUp className="w-5 h-5" />;
      case 'streak_days':
        return <Clock className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: MissionDifficulty) => {
    switch (difficulty) {
      case MissionDifficulty.EASY:
        return 'bg-green-100 text-green-800';
      case MissionDifficulty.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case MissionDifficulty.HARD:
        return 'bg-orange-100 text-orange-800';
      case MissionDifficulty.EXPERT:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRewardIcon = (type: RewardType) => {
    switch (type) {
      case RewardType.POINTS:
        return <Gift className="w-4 h-4" />;
      case RewardType.KAIA_TOKENS:
        return <TrendingUp className="w-4 h-4" />;
      case RewardType.NFT:
        return <Trophy className="w-4 h-4" />;
      case RewardType.BONUS_APY:
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: MissionStatus) => {
    switch (status) {
      case MissionStatus.COMPLETED:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case MissionStatus.LOCKED:
        return <Lock className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const progressPercentage = mission.target > 0 ? (mission.current / mission.target) * 100 : 0;
  const isCompleted = mission.status === MissionStatus.COMPLETED;
  const isAvailable = mission.status === MissionStatus.AVAILABLE || mission.status === MissionStatus.IN_PROGRESS;
  const canComplete = isAvailable && mission.current >= mission.target;

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      isCompleted && 'border-green-200 bg-green-50',
      !isAvailable && 'opacity-60',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
            )}>
              {getMissionIcon(mission.type)}
            </div>
            <div>
              <CardTitle className="text-lg">{mission.title}</CardTitle>
              <CardDescription className="text-sm">{mission.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(mission.status)}
            <Badge className={getDifficultyColor(mission.difficulty)}>
              {mission.difficulty}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">
              {mission.current} / {mission.target}
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2"
          />
          <div className="text-xs text-gray-500 text-center">
            {Math.round(progressPercentage)}% complete
          </div>
        </div>

        {/* Reward */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {getRewardIcon(mission.reward.type)}
            <span className="text-sm font-medium">Reward:</span>
            <span className="text-sm">{mission.reward.description}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {mission.reward.rarity}
          </Badge>
        </div>

        {/* Action Button */}
        {canComplete && !isCompleted && (
          <Button 
            onClick={() => onComplete?.(mission.id)}
            className="w-full"
            size="sm"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Claim Reward
          </Button>
        )}

        {isCompleted && (
          <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Mission Completed
          </div>
        )}

        {!isAvailable && !isCompleted && (
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <Lock className="w-4 h-4" />
            Mission Locked
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MissionCard;
