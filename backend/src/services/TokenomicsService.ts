import { ethers } from 'ethers';
import { SupabaseClient } from '@supabase/supabase-js';

interface TokenomicsInfo {
  totalSupply: string;
  maxSupply: string;
  totalStaked: string;
  totalVotingPower: string;
  circulatingSupply: string;
}

interface UserStakingInfo {
  stakedBalance: string;
  votingPower: string;
  pendingRewards: string;
  lastStakeTime: number;
}

interface TokenDistribution {
  category: string;
  percentage: number;
  amount: string;
  description: string;
}

interface GovernanceProposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  startTime: number;
  endTime: number;
  forVotes: string;
  againstVotes: string;
  status: 'active' | 'passed' | 'rejected' | 'executed';
}

export class TokenomicsService {
  private provider: ethers.providers.Provider | null = null;
  private contract: ethers.Contract | null = null;
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async initialize(provider: ethers.providers.Provider, contractAddress: string) {
    this.provider = provider;
    
    // YieldToken contract ABI (simplified)
    const contractABI = [
      'function getTokenomicsInfo() view returns (uint256, uint256, uint256, uint256, uint256)',
      'function getUserStakingInfo(address) view returns (uint256, uint256, uint256, uint256)',
      'function stake(uint256) external',
      'function unstake(uint256) external',
      'function claimRewards() external',
      'function calculateRewards(address) view returns (uint256)',
      'function balanceOf(address) view returns (uint256)',
      'function totalSupply() view returns (uint256)',
      'function transfer(address, uint256) external returns (bool)',
      'function approve(address, uint256) external returns (bool)',
      'function allowance(address, address) view returns (uint256)',
      'event Staked(address indexed user, uint256 amount)',
      'event Unstaked(address indexed user, uint256 amount)',
      'event RewardsClaimed(address indexed user, uint256 amount)',
      'event TokensMinted(address indexed to, uint256 amount)',
      'event TokensBurned(address indexed from, uint256 amount)'
    ];

    this.contract = new ethers.Contract(contractAddress, contractABI, provider);
  }

  /**
   * Get comprehensive tokenomics information
   */
  async getTokenomicsInfo(): Promise<TokenomicsInfo> {
    if (!this.contract) throw new Error('Contract not initialized');

    const [totalSupply, maxSupply, totalStaked, totalVotingPower, circulatingSupply] = 
      await this.contract.getTokenomicsInfo();

    return {
      totalSupply: ethers.utils.formatEther(totalSupply),
      maxSupply: ethers.utils.formatEther(maxSupply),
      totalStaked: ethers.utils.formatEther(totalStaked),
      totalVotingPower: ethers.utils.formatEther(totalVotingPower),
      circulatingSupply: ethers.utils.formatEther(circulatingSupply)
    };
  }

  /**
   * Get user staking information
   */
  async getUserStakingInfo(userAddress: string): Promise<UserStakingInfo> {
    if (!this.contract) throw new Error('Contract not initialized');

    const [stakedBalance, votingPower, pendingRewards, lastStakeTime] = 
      await this.contract.getUserStakingInfo(userAddress);

    return {
      stakedBalance: ethers.utils.formatEther(stakedBalance),
      votingPower: ethers.utils.formatEther(votingPower),
      pendingRewards: ethers.utils.formatEther(pendingRewards),
      lastStakeTime: lastStakeTime.toNumber()
    };
  }

  /**
   * Stake tokens
   */
  async stakeTokens(userAddress: string, amount: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    const signer = this.provider!.getSigner(userAddress);
    const contractWithSigner = this.contract.connect(signer);
    
    const amountWei = ethers.utils.parseEther(amount);
    const tx = await contractWithSigner.stake(amountWei);
    
    // Log staking event to database
    await this.logStakingEvent(userAddress, amount, 'stake', tx.hash);
    
    return tx.hash;
  }

  /**
   * Unstake tokens
   */
  async unstakeTokens(userAddress: string, amount: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    const signer = this.provider!.getSigner(userAddress);
    const contractWithSigner = this.contract.connect(signer);
    
    const amountWei = ethers.utils.parseEther(amount);
    const tx = await contractWithSigner.unstake(amountWei);
    
    // Log staking event to database
    await this.logStakingEvent(userAddress, amount, 'unstake', tx.hash);
    
    return tx.hash;
  }

  /**
   * Claim staking rewards
   */
  async claimRewards(userAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    const signer = this.provider!.getSigner(userAddress);
    const contractWithSigner = this.contract.connect(signer);
    
    const tx = await contractWithSigner.claimRewards();
    
    // Get reward amount from transaction
    const receipt = await tx.wait();
    const rewardAmount = await this.getClaimedRewardAmount(receipt);
    
    // Log reward claim to database
    await this.logStakingEvent(userAddress, rewardAmount, 'claim', tx.hash);
    
    return tx.hash;
  }

  /**
   * Calculate pending rewards for a user
   */
  async calculatePendingRewards(userAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    const rewards = await this.contract.calculateRewards(userAddress);
    return ethers.utils.formatEther(rewards);
  }

  /**
   * Get token distribution breakdown
   */
  async getTokenDistribution(): Promise<TokenDistribution[]> {
    const tokenomicsInfo = await this.getTokenomicsInfo();
    const totalSupply = parseFloat(tokenomicsInfo.totalSupply);

    return [
      {
        category: 'Liquidity Mining',
        percentage: 30,
        amount: (totalSupply * 0.30).toFixed(2),
        description: 'Rewards for providing liquidity and staking'
      },
      {
        category: 'Team & Development',
        percentage: 20,
        amount: (totalSupply * 0.20).toFixed(2),
        description: 'Team allocation with 2-year vesting'
      },
      {
        category: 'Ecosystem Development',
        percentage: 25,
        amount: (totalSupply * 0.25).toFixed(2),
        description: 'Partnerships, integrations, and ecosystem growth'
      },
      {
        category: 'Community Rewards',
        percentage: 15,
        amount: (totalSupply * 0.15).toFixed(2),
        description: 'Referral bonuses, NFT rewards, and community incentives'
      },
      {
        category: 'Reserve Fund',
        percentage: 10,
        amount: (totalSupply * 0.10).toFixed(2),
        description: 'Emergency fund and future development'
      }
    ];
  }

  /**
   * Get governance proposals
   */
  async getGovernanceProposals(): Promise<GovernanceProposal[]> {
    const { data, error } = await this.supabase
      .from('governance_proposals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create a new governance proposal
   */
  async createProposal(
    proposer: string,
    title: string,
    description: string,
    duration: number = 7 * 24 * 60 * 60 // 7 days in seconds
  ): Promise<number> {
    const startTime = Math.floor(Date.now() / 1000);
    const endTime = startTime + duration;

    const { data, error } = await this.supabase
      .from('governance_proposals')
      .insert({
        proposer,
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        for_votes: '0',
        against_votes: '0',
        status: 'active'
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * Vote on a governance proposal
   */
  async voteOnProposal(
    proposalId: number,
    voter: string,
    support: boolean,
    votingPower: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('governance_votes')
      .insert({
        proposal_id: proposalId,
        voter,
        support,
        voting_power: votingPower,
        timestamp: Math.floor(Date.now() / 1000)
      });

    if (error) throw error;

    // Update proposal vote counts
    const voteField = support ? 'for_votes' : 'against_votes';
    const { error: updateError } = await this.supabase
      .from('governance_proposals')
      .update({
        [voteField]: ethers.utils.parseEther(votingPower).toString()
      })
      .eq('id', proposalId);

    if (updateError) throw updateError;
  }

  /**
   * Get staking leaderboard
   */
  async getStakingLeaderboard(limit: number = 50): Promise<Array<{
    address: string;
    stakedBalance: string;
    votingPower: string;
    pendingRewards: string;
    rank: number;
  }>> {
    const { data, error } = await this.supabase
      .from('staking_leaderboard')
      .select('*')
      .order('staked_balance', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((item, index) => ({
      address: item.address,
      stakedBalance: item.staked_balance,
      votingPower: item.voting_power,
      pendingRewards: item.pending_rewards,
      rank: index + 1
    }));
  }

  /**
   * Log staking events to database
   */
  private async logStakingEvent(
    userAddress: string,
    amount: string,
    action: 'stake' | 'unstake' | 'claim',
    transactionHash: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('staking_events')
      .insert({
        user_address: userAddress,
        amount,
        action,
        transaction_hash: transactionHash,
        timestamp: Math.floor(Date.now() / 1000)
      });

    if (error) throw error;
  }

  /**
   * Get claimed reward amount from transaction receipt
   */
  private async getClaimedRewardAmount(receipt: ethers.providers.TransactionReceipt): Promise<string> {
    // Parse Transfer event to get minted amount
    const transferEvent = receipt.logs.find(log => {
      // This would need to be implemented based on the actual event signature
      return log.topics[0] === ethers.utils.id('Transfer(address,address,uint256)');
    });

    if (transferEvent) {
      const amount = ethers.utils.formatEther(transferEvent.data);
      return amount;
    }

    return '0';
  }

  /**
   * Get token price and market data
   */
  async getTokenPriceData(): Promise<{
    price: number;
    marketCap: number;
    volume24h: number;
    priceChange24h: number;
    circulatingSupply: string;
  }> {
    // This would integrate with price oracles or DEX APIs
    // For now, returning mock data
    const tokenomicsInfo = await this.getTokenomicsInfo();
    const mockPrice = 0.05; // $0.05 per token

    return {
      price: mockPrice,
      marketCap: parseFloat(tokenomicsInfo.circulatingSupply) * mockPrice,
      volume24h: 1000000, // $1M daily volume
      priceChange24h: 5.2, // +5.2%
      circulatingSupply: tokenomicsInfo.circulatingSupply
    };
  }

  /**
   * Get token utility and use cases
   */
  getTokenUtility(): Array<{
    category: string;
    description: string;
    benefits: string[];
  }> {
    return [
      {
        category: 'Governance',
        description: 'Vote on protocol upgrades and parameter changes',
        benefits: [
          'Direct influence on protocol development',
          'Propose new features and improvements',
          'Vote on treasury allocation'
        ]
      },
      {
        category: 'Staking Rewards',
        description: 'Earn passive income by staking YIELD tokens',
        benefits: [
          '10% APY staking rewards',
          'Compound interest on rewards',
          'Flexible staking periods'
        ]
      },
      {
        category: 'Fee Discounts',
        description: 'Reduced fees for platform services',
        benefits: [
          'Lower loan origination fees',
          'Reduced trading fees',
          'Priority customer support'
        ]
      },
      {
        category: 'Premium Features',
        description: 'Access to exclusive platform features',
        benefits: [
          'Advanced analytics dashboard',
          'Early access to new products',
          'VIP customer support'
        ]
      }
    ];
  }
}

