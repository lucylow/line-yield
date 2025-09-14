import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Vote, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Proposal {
  id: number;
  proposer: string;
  target: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  forVotes: number;
  againstVotes: number;
  executed: boolean;
  canceled: boolean;
  quorumRequired: number;
  state: string;
}

interface DAOGovernancePanelProps {
  governanceTokenBalance: number;
  userAddress?: string;
}

export const DAOGovernancePanel: React.FC<DAOGovernancePanelProps> = ({
  governanceTokenBalance,
  userAddress
}) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    target: '',
    callData: ''
  });
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    const mockProposals: Proposal[] = [
      {
        id: 1,
        proposer: '0x1234...5678',
        target: '0xVault...Contract',
        title: 'Increase USDT Yield APY',
        description: 'Proposal to increase the USDT yield APY from 8.5% to 10% by adjusting strategy allocations.',
        startTime: Date.now() - 86400000, // 1 day ago
        endTime: Date.now() + 86400000, // 1 day from now
        forVotes: 1500000,
        againstVotes: 500000,
        executed: false,
        canceled: false,
        quorumRequired: 2000000,
        state: 'Active'
      },
      {
        id: 2,
        proposer: '0x5678...9012',
        target: '0xSwap...Contract',
        title: 'Add USDC Support',
        description: 'Add USDC as a supported stablecoin for the swap feature.',
        startTime: Date.now() - 172800000, // 2 days ago
        endTime: Date.now() - 86400000, // 1 day ago
        forVotes: 1800000,
        againstVotes: 200000,
        executed: true,
        canceled: false,
        quorumRequired: 2000000,
        state: 'Executed'
      },
      {
        id: 3,
        proposer: '0x9012...3456',
        target: '0xGovernance...Contract',
        title: 'Reduce Proposal Threshold',
        description: 'Reduce the minimum tokens required to create a proposal from 10,000 to 5,000.',
        startTime: Date.now() - 259200000, // 3 days ago
        endTime: Date.now() - 172800000, // 2 days ago
        forVotes: 800000,
        againstVotes: 1200000,
        executed: false,
        canceled: false,
        quorumRequired: 2000000,
        state: 'Defeated'
      }
    ];
    setProposals(mockProposals);
  }, []);

  const getProposalStateColor = (state: string) => {
    switch (state) {
      case 'Active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Executed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Defeated':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProposalStateIcon = (state: string) => {
    switch (state) {
      case 'Active':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'Executed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Defeated':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'Pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (timestamp - now.getTime()) / (1000 * 60 * 60);

    if (Math.abs(diffInHours) < 1) {
      return 'Just now';
    } else if (diffInHours > 0 && diffInHours < 24) {
      return `${Math.floor(diffInHours)}h remaining`;
    } else if (diffInHours < 0 && Math.abs(diffInHours) < 24) {
      return `${Math.floor(Math.abs(diffInHours))}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    if (!userAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to vote on proposals.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Mock vote - in real implementation, call smart contract
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Vote Cast Successfully",
        description: `Your ${support ? 'for' : 'against'} vote has been recorded.`,
      });
    } catch (error) {
      toast({
        title: "Vote Failed",
        description: "There was an error casting your vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProposal = async () => {
    if (!userAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create proposals.",
        variant: "destructive"
      });
      return;
    }

    if (governanceTokenBalance < 10000) {
      toast({
        title: "Insufficient Voting Power",
        description: "You need at least 10,000 governance tokens to create a proposal.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Mock proposal creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Proposal Created",
        description: "Your proposal has been submitted and will be available for voting soon.",
      });
      
      setShowCreateProposal(false);
      setNewProposal({ title: '', description: '', target: '', callData: '' });
    } catch (error) {
      toast({
        title: "Proposal Creation Failed",
        description: "There was an error creating your proposal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getVotingProgress = (proposal: Proposal) => {
    const totalVotes = proposal.forVotes + proposal.againstVotes;
    const forPercentage = totalVotes > 0 ? (proposal.forVotes / totalVotes) * 100 : 0;
    const againstPercentage = totalVotes > 0 ? (proposal.againstVotes / totalVotes) * 100 : 0;
    const quorumProgress = (totalVotes / proposal.quorumRequired) * 100;

    return { forPercentage, againstPercentage, quorumProgress, totalVotes };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">DAO Governance</h2>
          <p className="text-gray-600">Participate in protocol governance and decision making</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Your Voting Power</p>
            <p className="text-lg font-semibold text-blue-600">
              {governanceTokenBalance.toLocaleString()} tokens
            </p>
          </div>
          <Button
            onClick={() => setShowCreateProposal(true)}
            disabled={governanceTokenBalance < 10000}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Proposal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Vote className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Proposals</p>
                <p className="text-xl font-bold">{proposals.filter(p => p.state === 'Active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Proposals</p>
                <p className="text-xl font-bold">{proposals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Execution Rate</p>
                <p className="text-xl font-bold">
                  {proposals.length > 0 ? Math.round((proposals.filter(p => p.state === 'Executed').length / proposals.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.map((proposal) => {
          const { forPercentage, againstPercentage, quorumProgress, totalVotes } = getVotingProgress(proposal);
          
          return (
            <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{proposal.title}</CardTitle>
                      <Badge className={getProposalStateColor(proposal.state)}>
                        <div className="flex items-center gap-1">
                          {getProposalStateIcon(proposal.state)}
                          {proposal.state}
                        </div>
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{proposal.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Ends: {formatTime(proposal.endTime)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Proposer: {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Voting Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">
                      For: {proposal.forVotes.toLocaleString()} ({forPercentage.toFixed(1)}%)
                    </span>
                    <span className="text-red-600 font-medium">
                      Against: {proposal.againstVotes.toLocaleString()} ({againstPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1 bg-green-100 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${forPercentage}%` }}
                        />
                      </div>
                      <div className="flex-1 bg-red-100 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${againstPercentage}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Quorum Progress: {quorumProgress.toFixed(1)}%</span>
                      <span>Required: {proposal.quorumRequired.toLocaleString()}</span>
                    </div>
                    <Progress value={quorumProgress} className="h-1" />
                  </div>
                </div>

                {/* Action Buttons */}
                {proposal.state === 'Active' && userAddress && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => handleVote(proposal.id, true)}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Vote For
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVote(proposal.id, false)}
                      disabled={isLoading}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Vote Against
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Proposal Modal */}
      {showCreateProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Proposal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Proposal Title</label>
                <input
                  type="text"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Increase USDT Yield APY"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newProposal.description}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
                  placeholder="Describe your proposal in detail..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Target Contract</label>
                <input
                  type="text"
                  value={newProposal.target}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, target: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0x..."
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateProposal}
                  disabled={isLoading || !newProposal.title || !newProposal.description}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? 'Creating...' : 'Create Proposal'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateProposal(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};



