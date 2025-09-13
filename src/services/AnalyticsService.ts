import { formatCurrency, formatNumber } from '@/utils/formatters';

// Analytics Service for Kaia Yield Optimizer
export interface TVLData {
  date: string;
  tvl: number;
  change: number;
  changePercent: number;
}

export interface UserActivityData {
  date: string;
  dailyDepositors: number;
  totalDepositors: number;
  newUsers: number;
}

export interface YieldPerformanceData {
  date: string;
  avgApy: number;
  maxApy: number;
  minApy: number;
  totalYield: number;
}

export interface StrategyAllocationData {
  strategyName: string;
  totalLocked: number;
  percentage: number;
  apy: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface RevenueData {
  date: string;
  dailyFeeRevenue: number;
  cumulativeRevenue: number;
  feeRate: number;
}

export interface ProtocolMetrics {
  totalTVL: number;
  totalUsers: number;
  avgApy: number;
  totalRevenue: number;
  activeStrategies: number;
  gasSaved: number;
}

export interface AnalyticsReport {
  id: string;
  title: string;
  type: 'tvl' | 'users' | 'yield' | 'strategy' | 'revenue' | 'overview';
  content: string;
  insights: string[];
  recommendations: string[];
  generatedAt: string;
  dataPeriod: string;
}

class AnalyticsService {
  private duneApiKey: string;
  private duneBaseUrl: string;
  private aiApiKey: string;

  constructor() {
    this.duneApiKey = process.env.REACT_APP_DUNE_API_KEY || '';
    this.duneBaseUrl = 'https://api.dune.com/api/v1';
    this.aiApiKey = process.env.REACT_APP_AI_API_KEY || '';
  }

  /**
   * Get Total Value Locked (TVL) data
   */
  async getTVLData(days: number = 30): Promise<TVLData[]> {
    try {
      // In a real implementation, this would call Dune API
      // For now, return mock data based on the SQL query structure
      const mockData: TVLData[] = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Simulate TVL growth with some volatility
        const baseTVL = 1000000 + (i * 50000) + (Math.random() - 0.5) * 100000;
        const prevTVL = i > 0 ? mockData[i - 1].tvl : baseTVL;
        const change = baseTVL - prevTVL;
        const changePercent = (change / prevTVL) * 100;

        mockData.push({
          date: date.toISOString().split('T')[0],
          tvl: baseTVL,
          change,
          changePercent
        });
      }

      return mockData;
    } catch (error) {
      console.error('Failed to fetch TVL data:', error);
      return [];
    }
  }

  /**
   * Get user activity data
   */
  async getUserActivityData(days: number = 30): Promise<UserActivityData[]> {
    try {
      const mockData: UserActivityData[] = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let totalDepositors = 0;

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Simulate user growth
        const dailyDepositors = Math.floor(10 + Math.random() * 20);
        const newUsers = Math.floor(dailyDepositors * 0.3);
        totalDepositors += newUsers;

        mockData.push({
          date: date.toISOString().split('T')[0],
          dailyDepositors,
          totalDepositors,
          newUsers
        });
      }

      return mockData;
    } catch (error) {
      console.error('Failed to fetch user activity data:', error);
      return [];
    }
  }

  /**
   * Get yield performance data
   */
  async getYieldPerformanceData(days: number = 30): Promise<YieldPerformanceData[]> {
    try {
      const mockData: YieldPerformanceData[] = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Simulate yield performance
        const baseApy = 8.5 + (Math.random() - 0.5) * 2;
        const maxApy = baseApy + Math.random() * 1;
        const minApy = baseApy - Math.random() * 1;
        const totalYield = baseApy * (1000000 + i * 50000) / 100 / 365;

        mockData.push({
          date: date.toISOString().split('T')[0],
          avgApy: baseApy,
          maxApy,
          minApy,
          totalYield
        });
      }

      return mockData;
    } catch (error) {
      console.error('Failed to fetch yield performance data:', error);
      return [];
    }
  }

  /**
   * Get strategy allocation data
   */
  async getStrategyAllocationData(): Promise<StrategyAllocationData[]> {
    try {
      // Mock strategy data
      const strategies = [
        {
          strategyName: 'Kaia Lending Protocol',
          totalLocked: 450000,
          percentage: 45,
          apy: 9.2,
          riskLevel: 'Medium' as const
        },
        {
          strategyName: 'USDT Liquidity Pools',
          totalLocked: 300000,
          percentage: 30,
          apy: 7.8,
          riskLevel: 'Low' as const
        },
        {
          strategyName: 'Kaia Staking',
          totalLocked: 150000,
          percentage: 15,
          apy: 6.5,
          riskLevel: 'Low' as const
        },
        {
          strategyName: 'DeFi Yield Farming',
          totalLocked: 100000,
          percentage: 10,
          apy: 12.5,
          riskLevel: 'High' as const
        }
      ];

      return strategies;
    } catch (error) {
      console.error('Failed to fetch strategy allocation data:', error);
      return [];
    }
  }

  /**
   * Get revenue data
   */
  async getRevenueData(days: number = 30): Promise<RevenueData[]> {
    try {
      const mockData: RevenueData[] = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let cumulativeRevenue = 0;

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Simulate revenue growth
        const dailyFeeRevenue = 500 + Math.random() * 1000;
        cumulativeRevenue += dailyFeeRevenue;
        const feeRate = 0.1 + Math.random() * 0.05;

        mockData.push({
          date: date.toISOString().split('T')[0],
          dailyFeeRevenue,
          cumulativeRevenue,
          feeRate
        });
      }

      return mockData;
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
      return [];
    }
  }

  /**
   * Get comprehensive protocol metrics
   */
  async getProtocolMetrics(): Promise<ProtocolMetrics> {
    try {
      const tvlData = await this.getTVLData(1);
      const userData = await this.getUserActivityData(1);
      const yieldData = await this.getYieldPerformanceData(1);
      const revenueData = await this.getRevenueData(1);

      return {
        totalTVL: tvlData[tvlData.length - 1]?.tvl || 0,
        totalUsers: userData[userData.length - 1]?.totalDepositors || 0,
        avgApy: yieldData[yieldData.length - 1]?.avgApy || 0,
        totalRevenue: revenueData[revenueData.length - 1]?.cumulativeRevenue || 0,
        activeStrategies: 4,
        gasSaved: 125000 // Mock gas saved amount
      };
    } catch (error) {
      console.error('Failed to fetch protocol metrics:', error);
      return {
        totalTVL: 0,
        totalUsers: 0,
        avgApy: 0,
        totalRevenue: 0,
        activeStrategies: 0,
        gasSaved: 0
      };
    }
  }

  /**
   * Generate AI-powered analytics report
   */
  async generateAnalyticsReport(
    type: 'tvl' | 'users' | 'yield' | 'strategy' | 'revenue' | 'overview',
    dataPeriod: string = '30 days'
  ): Promise<AnalyticsReport> {
    try {
      const reportId = `report_${type}_${Date.now()}`;
      const generatedAt = new Date().toISOString();

      let report: AnalyticsReport;

      switch (type) {
        case 'tvl':
          report = await this.generateTVLReport(reportId, dataPeriod, generatedAt);
          break;
        case 'users':
          report = await this.generateUserActivityReport(reportId, dataPeriod, generatedAt);
          break;
        case 'yield':
          report = await this.generateYieldPerformanceReport(reportId, dataPeriod, generatedAt);
          break;
        case 'strategy':
          report = await this.generateStrategyAllocationReport(reportId, dataPeriod, generatedAt);
          break;
        case 'revenue':
          report = await this.generateRevenueReport(reportId, dataPeriod, generatedAt);
          break;
        case 'overview':
          report = await this.generateOverviewReport(reportId, dataPeriod, generatedAt);
          break;
        default:
          throw new Error('Invalid report type');
      }

      return report;
    } catch (error) {
      console.error('Failed to generate analytics report:', error);
      throw error;
    }
  }

  /**
   * Generate TVL report
   */
  private async generateTVLReport(
    reportId: string,
    dataPeriod: string,
    generatedAt: string
  ): Promise<AnalyticsReport> {
    const tvlData = await this.getTVLData(30);
    const latestTVL = tvlData[tvlData.length - 1];
    const firstTVL = tvlData[0];
    const growth = latestTVL.tvl - firstTVL.tvl;
    const growthPercent = (growth / firstTVL.tvl) * 100;

    const content = `The Total Value Locked (TVL) in the Kaia Yield Optimizer vault demonstrates a ${growthPercent > 0 ? 'steadily increasing' : 'declining'} trend over the past ${dataPeriod}, reaching a peak of ${formatCurrency(latestTVL.tvl)} on ${new Date(latestTVL.date).toLocaleDateString()}. This ${growthPercent > 0 ? 'growth' : 'decline'} indicates ${growthPercent > 0 ? 'strong user confidence and capital inflow' : 'potential challenges in user retention'}, signaling ${growthPercent > 0 ? 'successful protocol adoption' : 'areas for improvement'} within the Kaia ecosystem.`;

    const insights = [
      `TVL ${growthPercent > 0 ? 'increased' : 'decreased'} by ${formatCurrency(Math.abs(growth))} (${Math.abs(growthPercent).toFixed(1)}%) over the period`,
      `Average daily TVL change: ${formatCurrency(latestTVL.change)}`,
      `Peak TVL reached: ${formatCurrency(Math.max(...tvlData.map(d => d.tvl)))}`,
      `Current TVL trend: ${latestTVL.changePercent > 0 ? 'Positive' : 'Negative'}`
    ];

    const recommendations = [
      'Monitor TVL trends closely for early signs of user behavior changes',
      'Implement TVL-based incentives to encourage long-term deposits',
      'Analyze correlation between TVL growth and yield performance',
      'Consider TVL milestones for protocol feature unlocks'
    ];

    return {
      id: reportId,
      title: 'Total Value Locked Analysis',
      type: 'tvl',
      content,
      insights,
      recommendations,
      generatedAt,
      dataPeriod
    };
  }

  /**
   * Generate user activity report
   */
  private async generateUserActivityReport(
    reportId: string,
    dataPeriod: string,
    generatedAt: string
  ): Promise<AnalyticsReport> {
    const userData = await this.getUserActivityData(30);
    const latestData = userData[userData.length - 1];
    const avgDailyDepositors = userData.reduce((sum, d) => sum + d.dailyDepositors, 0) / userData.length;

    const content = `There has been a ${latestData.totalDepositors > userData[0].totalDepositors ? 'consistent rise' : 'decline'} in the number of unique depositors engaging with the protocol daily. The average daily depositor count is ${avgDailyDepositors.toFixed(1)} users, with total depositors growing from ${userData[0].totalDepositors} to ${latestData.totalDepositors} users, highlighting ${latestData.totalDepositors > userData[0].totalDepositors ? 'effective onboarding and growing trust' : 'potential challenges in user acquisition'} among the LINE messaging user base.`;

    const insights = [
      `Total unique depositors: ${latestData.totalDepositors}`,
      `Average daily depositors: ${avgDailyDepositors.toFixed(1)}`,
      `Peak daily depositors: ${Math.max(...userData.map(d => d.dailyDepositors))}`,
      `User growth rate: ${((latestData.totalDepositors - userData[0].totalDepositors) / userData[0].totalDepositors * 100).toFixed(1)}%`
    ];

    const recommendations = [
      'Implement referral programs to accelerate user acquisition',
      'Analyze user onboarding funnel for optimization opportunities',
      'Monitor user retention rates and implement retention strategies',
      'Consider gamification elements to increase user engagement'
    ];

    return {
      id: reportId,
      title: 'User Activity Analysis',
      type: 'users',
      content,
      insights,
      recommendations,
      generatedAt,
      dataPeriod
    };
  }

  /**
   * Generate yield performance report
   */
  private async generateYieldPerformanceReport(
    reportId: string,
    dataPeriod: string,
    generatedAt: string
  ): Promise<AnalyticsReport> {
    const yieldData = await this.getYieldPerformanceData(30);
    const avgApy = yieldData.reduce((sum, d) => sum + d.avgApy, 0) / yieldData.length;
    const maxApy = Math.max(...yieldData.map(d => d.maxApy));
    const minApy = Math.min(...yieldData.map(d => d.minApy));

    const content = `The average APY experienced ${maxApy - minApy > 2 ? 'significant' : 'minor'} fluctuations, averaging around ${avgApy.toFixed(1)}% over the last ${dataPeriod}. ${maxApy - minApy > 2 ? 'Peaks correlate with strategic rebalancing events shifting funds towards higher-yielding strategies' : 'Yield stability indicates consistent strategy performance'}. While yield optimization remains a key driver for user retention, monitoring risk-adjusted returns will be crucial as the protocol scales.`;

    const insights = [
      `Average APY: ${avgApy.toFixed(1)}%`,
      `APY range: ${minApy.toFixed(1)}% - ${maxApy.toFixed(1)}%`,
      `APY volatility: ${((maxApy - minApy) / avgApy * 100).toFixed(1)}%`,
      `Current APY trend: ${yieldData[yieldData.length - 1].avgApy > avgApy ? 'Above average' : 'Below average'}`
    ];

    const recommendations = [
      'Implement dynamic strategy rebalancing based on yield opportunities',
      'Monitor risk-adjusted returns across all strategies',
      'Consider yield smoothing mechanisms for user experience',
      'Analyze correlation between yield performance and user retention'
    ];

    return {
      id: reportId,
      title: 'Yield Performance Analysis',
      type: 'yield',
      content,
      insights,
      recommendations,
      generatedAt,
      dataPeriod
    };
  }

  /**
   * Generate strategy allocation report
   */
  private async generateStrategyAllocationReport(
    reportId: string,
    dataPeriod: string,
    generatedAt: string
  ): Promise<AnalyticsReport> {
    const strategyData = await this.getStrategyAllocationData();
    const totalLocked = strategyData.reduce((sum, s) => sum + s.totalLocked, 0);
    const avgApy = strategyData.reduce((sum, s) => sum + s.apy, 0) / strategyData.length;

    const content = `The current allocation of assets shows a diversified portfolio with ${strategyData.map(s => `${s.percentage}% in ${s.strategyName}`).join(', ')}. This balanced approach helps mitigate risk while optimizing returns. The average APY across all strategies is ${avgApy.toFixed(1)}%, with risk levels ranging from Low to High. Future shifts in asset allocation will be essential to respond to evolving market conditions and yield opportunities.`;

    const insights = [
      `Total assets under management: ${formatCurrency(totalLocked)}`,
      `Average strategy APY: ${avgApy.toFixed(1)}%`,
      `Strategy diversification: ${strategyData.length} active strategies`,
      `Risk distribution: ${strategyData.filter(s => s.riskLevel === 'Low').length} Low, ${strategyData.filter(s => s.riskLevel === 'Medium').length} Medium, ${strategyData.filter(s => s.riskLevel === 'High').length} High risk`
    ];

    const recommendations = [
      'Regularly rebalance strategies based on market conditions',
      'Monitor individual strategy performance and risk metrics',
      'Consider adding new strategies to further diversify risk',
      'Implement automated rebalancing triggers based on yield differentials'
    ];

    return {
      id: reportId,
      title: 'Strategy Allocation Analysis',
      type: 'strategy',
      content,
      insights,
      recommendations,
      generatedAt,
      dataPeriod
    };
  }

  /**
   * Generate revenue report
   */
  private async generateRevenueReport(
    reportId: string,
    dataPeriod: string,
    generatedAt: string
  ): Promise<AnalyticsReport> {
    const revenueData = await this.getRevenueData(30);
    const totalRevenue = revenueData[revenueData.length - 1].cumulativeRevenue;
    const avgDailyRevenue = totalRevenue / revenueData.length;

    const content = `Performance fees generated over the last ${dataPeriod} total ${formatCurrency(totalRevenue)}, providing a sustainable revenue base for ongoing protocol development and gas fee sponsorship. The average daily revenue is ${formatCurrency(avgDailyRevenue)}, with a steady fee income stream reinforcing the alignment of interests between users and protocol operators, as revenues scale with TVL and yield performance.`;

    const insights = [
      `Total revenue: ${formatCurrency(totalRevenue)}`,
      `Average daily revenue: ${formatCurrency(avgDailyRevenue)}`,
      `Revenue growth trend: ${revenueData[revenueData.length - 1].dailyFeeRevenue > revenueData[0].dailyFeeRevenue ? 'Positive' : 'Negative'}`,
      `Revenue per user: ${formatCurrency(totalRevenue / 1000)}` // Assuming 1000 users
    ];

    const recommendations = [
      'Monitor revenue sustainability as protocol scales',
      'Consider revenue sharing mechanisms with users',
      'Analyze revenue correlation with TVL and user growth',
      'Implement revenue-based protocol development milestones'
    ];

    return {
      id: reportId,
      title: 'Revenue and Sustainability Analysis',
      type: 'revenue',
      content,
      insights,
      recommendations,
      generatedAt,
      dataPeriod
    };
  }

  /**
   * Generate overview report
   */
  private async generateOverviewReport(
    reportId: string,
    dataPeriod: string,
    generatedAt: string
  ): Promise<AnalyticsReport> {
    const metrics = await this.getProtocolMetrics();
    const tvlData = await this.getTVLData(30);
    const userData = await this.getUserActivityData(30);

    const content = `The Kaia Yield Optimizer protocol demonstrates strong performance across all key metrics. With a Total Value Locked of ${formatCurrency(metrics.totalTVL)} and ${formatNumber(metrics.totalUsers)} active users, the protocol has achieved significant adoption within the Kaia ecosystem. The average APY of ${metrics.avgApy.toFixed(1)}% provides competitive returns while maintaining risk diversification across ${metrics.activeStrategies} active strategies. Revenue generation of ${formatCurrency(metrics.totalRevenue)} ensures sustainable protocol development and user benefits.`;

    const insights = [
      `Protocol health score: ${this.calculateHealthScore(metrics)}/100`,
      `TVL growth: ${((tvlData[tvlData.length - 1].tvl - tvlData[0].tvl) / tvlData[0].tvl * 100).toFixed(1)}%`,
      `User growth: ${((userData[userData.length - 1].totalDepositors - userData[0].totalDepositors) / userData[0].totalDepositors * 100).toFixed(1)}%`,
      `Gas saved for users: ${formatCurrency(metrics.gasSaved)}`
    ];

    const recommendations = [
      'Continue monitoring all key performance indicators',
      'Implement automated alerts for significant metric changes',
      'Consider protocol upgrades based on user feedback and performance',
      'Maintain focus on user experience and yield optimization'
    ];

    return {
      id: reportId,
      title: 'Protocol Overview Analysis',
      type: 'overview',
      content,
      insights,
      recommendations,
      generatedAt,
      dataPeriod
    };
  }

  /**
   * Calculate protocol health score
   */
  private calculateHealthScore(metrics: ProtocolMetrics): number {
    // Simple health score calculation based on key metrics
    const tvlScore = Math.min(metrics.totalTVL / 1000000 * 25, 25); // Max 25 points
    const userScore = Math.min(metrics.totalUsers / 100 * 25, 25); // Max 25 points
    const apyScore = Math.min(metrics.avgApy * 2, 25); // Max 25 points
    const revenueScore = Math.min(metrics.totalRevenue / 10000 * 25, 25); // Max 25 points

    return Math.round(tvlScore + userScore + apyScore + revenueScore);
  }

  /**
   * Get Dune SQL queries for reference
   */
  getDuneSQLQueries(): Record<string, string> {
    return {
      tvl: `
        SELECT
          DATE_TRUNC('day', block_time) AS day,
          SUM(CASE WHEN event_name = 'Deposit' THEN amount ELSE -amount END) OVER (ORDER BY DATE_TRUNC('day', block_time)) AS tvl
        FROM vault_events
        WHERE block_time >= CURRENT_DATE - INTERVAL '30 days'
        ORDER BY day;
      `,
      dailyDepositors: `
        SELECT
          DATE_TRUNC('day', block_time) AS day,
          COUNT(DISTINCT depositor) AS daily_depositors
        FROM vault_events
        WHERE event_name = 'Deposit' AND block_time >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY day
        ORDER BY day;
      `,
      yieldPerformance: `
        SELECT
          DATE_TRUNC('day', block_time) AS day,
          AVG(apy) AS avg_apy
        FROM yield_reports
        WHERE block_time >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY day
        ORDER BY day;
      `,
      strategyAllocation: `
        SELECT
          strategy_name,
          SUM(amount) AS total_locked
        FROM strategy_allocations
        WHERE block_time = (
          SELECT MAX(block_time) FROM strategy_allocations
        )
        GROUP BY strategy_name;
      `,
      protocolRevenue: `
        SELECT
          DATE_TRUNC('day', block_time) AS day,
          SUM(fee_amount) AS daily_fee_revenue
        FROM fee_events
        WHERE block_time >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY day
        ORDER BY day;
      `
    };
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;

