import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@line-yield/shared/src/components/ui/card';
import { Button } from '@line-yield/shared/src/components/ui/button';
import { Badge } from '@line-yield/shared/src/components/ui/badge';
import { Progress } from '@line-yield/shared/src/components/ui/progress';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { cn } from '@line-yield/shared/src/utils/cn';

interface CreditScoreWidgetProps {
  userAddress: string;
  compact?: boolean;
  className?: string;
}

interface CreditProfile {
  score: number;
  totalBorrowed: string;
  totalRepaid: string;
  activeLoans: number;
  completedLoans: number;
  latePayments: number;
  onTimePayments: number;
  lastActivity: number;
  isActive: boolean;
  tier: string;
  color: string;
}

export const CreditScoreWidget: React.FC<CreditScoreWidgetProps> = ({ 
  userAddress, 
  compact = false,
  className = '' 
}) => {
  const [creditProfile, setCreditProfile] = useState<CreditProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditProfile = async () => {
    if (!userAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // This would be replaced with actual API call
      // const response = await creditApiClient.getCreditProfile(userAddress);
      // setCreditProfile(response);
      
      // Mock data for now
      setCreditProfile({
        score: 750,
        totalBorrowed: "5000.00",
        totalRepaid: "4500.00",
        activeLoans: 1,
        completedLoans: 3,
        latePayments: 0,
        onTimePayments: 12,
        lastActivity: Date.now() / 1000,
        isActive: true,
        tier: "Good",
        color: "text-blue-600 bg-blue-100"
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditProfile();
  }, [userAddress]);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  const getScoreProgress = (score: number) => {
    return (score / 1000) * 100;
  };

  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-600';
    if (score >= 700) return 'text-blue-600';
    if (score >= 600) return 'text-yellow-600';
    if (score >= 500) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleOpenCreditDashboard = () => {
    // In a real implementation, this would navigate to the full credit dashboard
    console.log('Opening credit dashboard...');
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading credit score...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="text-center text-red-600">
            <p className="text-sm">Failed to load credit score</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchCreditProfile}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!creditProfile) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            Credit Score
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-4">
            <CreditCard className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              No credit profile found
            </p>
            <Button size="sm" onClick={handleOpenCreditDashboard}>
              Create Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Credit Score</p>
                <div className="flex items-center gap-2">
                  <span className={cn("text-lg font-bold", getScoreColor(creditProfile.score))}>
                    {creditProfile.score}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {creditProfile.tier}
                  </Badge>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleOpenCreditDashboard}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credit Score
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchCreditProfile}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Credit Score Display */}
          <div className="text-center">
            <div className={cn("text-3xl font-bold mb-2", getScoreColor(creditProfile.score))}>
              {creditProfile.score}
            </div>
            <Badge className={cn("mb-3", creditProfile.color)}>
              {creditProfile.tier}
            </Badge>
            <Progress 
              value={getScoreProgress(creditProfile.score)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Score Range: 0-1000
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>On-time: {creditProfile.onTimePayments}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span>Late: {creditProfile.latePayments}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Active: {creditProfile.activeLoans}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              <span>Completed: {creditProfile.completedLoans}</span>
            </div>
          </div>

          {/* Loan Amounts */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>Total Borrowed</span>
              </div>
              <span className="font-medium">{formatCurrency(creditProfile.totalBorrowed)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-blue-600" />
                <span>Total Repaid</span>
              </div>
              <span className="font-medium">{formatCurrency(creditProfile.totalRepaid)}</span>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            className="w-full" 
            onClick={handleOpenCreditDashboard}
          >
            View Full Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditScoreWidget;
