import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3,
  Plus,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface YieldStrategy {
  id: string;
  name: string;
  apy: number;
  riskLevel: number;
  minDeposit: number;
  maxDeposit: number;
  currentBalance: number;
  totalYield: number;
  isActive: boolean;
  allocation: number;
  lastHarvest: number;
  description: string;
  protocol: string;
  token: string;
}

interface YieldStrategiesPanelProps {
  userAddress?: string;
  totalDeposited: number;
}

export const YieldStrategiesPanel: React.FC<YieldStrategiesPanelProps> = ({
  userAddress,
  totalDeposited
}) => {
  const [strategies, setStrategies] = useState<YieldStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddStrategy, setShowAddStrategy] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<YieldStrategy | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    const mockStrategies: YieldStrategy[] = [
      {
        id: 'aave-strategy',
        name: 'Aave Lending Strategy',
        apy: 8.5,
        riskLevel: 2,
        minDeposit: 100,
        maxDeposit: 1000000,
        currentBalance: 50000,
        totalYield: 2500,
        isActive: true,
        allocation: 40,
        lastHarvest: Date.now() - 3600000, // 1 hour ago
        description: 'Earn yield by lending USDT on Aave protocol with low risk and stable returns.',
        protocol: 'Aave',
        token: 'USDT'
      },
      {
        id: 'klayswap-strategy',
        name: 'KlaySwap Liquidity Strategy',
        apy: 12.0,
        riskLevel: 3,
        minDeposit: 50,
        maxDeposit: 500000,
        currentBalance: 30000,
        totalYield: 1800,
        isActive: true,
        allocation: 30,
        lastHarvest: Date.now() - 7200000, // 2 hours ago
        description: 'Provide liquidity to KlaySwap pools and earn trading fees with medium risk.',
        protocol: 'KlaySwap',
        token: 'USDT'
      },
      {
        id: 'compound-strategy',
        name: 'Compound Lending Strategy',
        apy: 7.2,
        riskLevel: 2,
        minDeposit: 200,
        maxDeposit: 800000,
        currentBalance: 20000,
        totalYield: 1200,
        isActive: true,
        allocation: 20,
        lastHarvest: Date.now() - 1800000, // 30 minutes ago
        description: 'Lend USDC on Compound protocol for stable yield with low risk profile.',
        protocol: 'Compound',
        token: 'USDC'
      },
      {
        id: 'curve-strategy',
        name: 'Curve Stablecoin Strategy',
        apy: 15.5,
        riskLevel: 4,
        minDeposit: 1000,
        maxDeposit: 2000000,
        currentBalance: 0,
        totalYield: 0,
        isActive: false,
        allocation: 10,
        lastHarvest: 0,
        description: 'High-yield strategy using Curve stablecoin pools with higher risk.',
        protocol: 'Curve',
        token: 'USDT'
      }
    ];
    setStrategies(mockStrategies);
  }, []);

  const getRiskColor = (riskLevel: number) => {
    switch (riskLevel) {
      case 1: return 'bg-green-100 text-green-800 border-green-200';
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 4: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 5: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLabel = (riskLevel: number) => {
    switch (riskLevel) {
      case 1: return 'Very Low';
      case 2: return 'Low';
      case 3: return 'Medium';
      case 4: return 'High';
      case 5: return 'Very High';
      default: return 'Unknown';
    }
  };

  const getRiskIcon = (riskLevel: number) => {
    switch (riskLevel) {
      case 1: return <Shield className="w-4 h-4 text-green-600" />;
      case 2: return <Shield className="w-4 h-4 text-blue-600" />;
      case 3: return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 4: return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 5: return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTime = (timestamp: number) => {
    if (timestamp === 0) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - timestamp) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleDeposit = async (strategy: YieldStrategy) => {
    if (!userAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to deposit funds.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(depositAmount);
    if (amount < strategy.minDeposit) {
      toast({
        title: "Amount Too Low",
        description: `Minimum deposit is ${strategy.minDeposit} ${strategy.token}.`,
        variant: "destructive"
      });
      return;
    }

    if (amount > strategy.maxDeposit) {
      toast({
        title: "Amount Too High",
        description: `Maximum deposit is ${strategy.maxDeposit} ${strategy.token}.`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Mock deposit
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Deposit Successful",
        description: `Successfully deposited ${amount} ${strategy.token} into ${strategy.name}.`,
      });
      
      setDepositAmount('');
      setSelectedStrategy(null);
    } catch (error) {
      toast({
        title: "Deposit Failed",
        description: "There was an error processing your deposit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (strategy: YieldStrategy) => {
    if (!userAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to withdraw funds.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount > strategy.currentBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${strategy.currentBalance} ${strategy.token} in this strategy.`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Mock withdraw
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Withdrawal Successful",
        description: `Successfully withdrew ${amount} ${strategy.token} from ${strategy.name}.`,
      });
      
      setWithdrawAmount('');
      setSelectedStrategy(null);
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: "There was an error processing your withdrawal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHarvest = async (strategy: YieldStrategy) => {
    setIsLoading(true);
    try {
      // Mock harvest
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Harvest Successful",
        description: `Successfully harvested yield from ${strategy.name}.`,
      });
    } catch (error) {
      toast({
        title: "Harvest Failed",
        description: "There was an error harvesting yield. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalYield = strategies.reduce((sum, strategy) => sum + strategy.totalYield, 0);
  const totalBalance = strategies.reduce((sum, strategy) => sum + strategy.currentBalance, 0);
  const averageApy = strategies.length > 0 ? strategies.reduce((sum, strategy) => sum + strategy.apy, 0) / strategies.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Yield Strategies</h2>
          <p className="text-gray-600">Optimize your yield across multiple DeFi protocols</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Yield Earned</p>
            <p className="text-lg font-semibold text-green-600">
              ${totalYield.toLocaleString()}
            </p>
          </div>
          <Button
            onClick={() => setShowAddStrategy(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Strategy
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="text-xl font-bold">${totalBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average APY</p>
                <p className="text-xl font-bold">{averageApy.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Strategies</p>
                <p className="text-xl font-bold">{strategies.filter(s => s.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Yield</p>
                <p className="text-xl font-bold">${totalYield.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {strategies.map((strategy) => (
          <Card key={strategy.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{strategy.name}</CardTitle>
                    <Badge className={getRiskColor(strategy.riskLevel)}>
                      <div className="flex items-center gap-1">
                        {getRiskIcon(strategy.riskLevel)}
                        {getRiskLabel(strategy.riskLevel)}
                      </div>
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{strategy.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {strategy.apy}% APY
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Last harvest: {formatTime(strategy.lastHarvest)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Strategy Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Balance</span>
                  <span className="font-medium">${strategy.currentBalance.toLocaleString()} {strategy.token}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Yield</span>
                  <span className="font-medium text-green-600">${strategy.totalYield.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Allocation</span>
                  <span className="font-medium">{strategy.allocation}%</span>
                </div>
                
                <Progress value={strategy.allocation} className="h-2" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setSelectedStrategy(strategy)}
                  disabled={!strategy.isActive}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Deposit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedStrategy(strategy)}
                  disabled={strategy.currentBalance === 0}
                  className="flex-1"
                >
                  Withdraw
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleHarvest(strategy)}
                  disabled={isLoading}
                  className="px-3"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deposit/Withdraw Modal */}
      {selectedStrategy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {selectedStrategy.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p><strong>APY:</strong> {selectedStrategy.apy}%</p>
                <p><strong>Risk Level:</strong> {getRiskLabel(selectedStrategy.riskLevel)}</p>
                <p><strong>Current Balance:</strong> ${selectedStrategy.currentBalance.toLocaleString()}</p>
                <p><strong>Min Deposit:</strong> {selectedStrategy.minDeposit} {selectedStrategy.token}</p>
                <p><strong>Max Deposit:</strong> {selectedStrategy.maxDeposit.toLocaleString()} {selectedStrategy.token}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Amount ({selectedStrategy.token})</label>
                <input
                  type="number"
                  value={selectedStrategy.currentBalance > 0 ? withdrawAmount : depositAmount}
                  onChange={(e) => {
                    if (selectedStrategy.currentBalance > 0) {
                      setWithdrawAmount(e.target.value);
                    } else {
                      setDepositAmount(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (selectedStrategy.currentBalance > 0) {
                      handleWithdraw(selectedStrategy);
                    } else {
                      handleDeposit(selectedStrategy);
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Processing...' : (selectedStrategy.currentBalance > 0 ? 'Withdraw' : 'Deposit')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedStrategy(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Strategy Modal */}
      {showAddStrategy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Zap className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Strategy Integration</h3>
                <p className="text-gray-600 mb-4">
                  Add new yield strategies by integrating with DeFi protocols on Kaia blockchain.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>• Aave lending protocols</p>
                  <p>• KlaySwap liquidity pools</p>
                  <p>• Compound lending markets</p>
                  <p>• Curve stablecoin pools</p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setShowAddStrategy(false)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Coming Soon
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddStrategy(false)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};



