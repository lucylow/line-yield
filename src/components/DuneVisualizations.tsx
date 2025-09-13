import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  PieChart,
  Activity,
  RefreshCw,
  ExternalLink,
  Copy,
  Download,
  Share2,
  Eye,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyticsService } from '@/services/AnalyticsService';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area, ComposedChart } from 'recharts';

interface DuneVisualizationProps {
  className?: string;
}

export const DuneVisualizations: React.FC<DuneVisualizationProps> = ({ className }) => {
  const [activeVisualization, setActiveVisualization] = useState('tvl');
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  
  const { toast } = useToast();

  const visualizations = [
    {
      id: 'tvl',
      name: 'Total Value Locked',
      description: 'Shows growth or contraction of locked funds over time',
      chartType: 'line',
      icon: TrendingUp,
      color: '#3b82f6'
    },
    {
      id: 'users',
      name: 'Daily Unique Depositors',
      description: 'User adoption and participation rates',
      chartType: 'bar',
      icon: Users,
      color: '#10b981'
    },
    {
      id: 'yield',
      name: 'Average APY',
      description: 'Daily yield trends for investors',
      chartType: 'area',
      icon: Activity,
      color: '#8b5cf6'
    },
    {
      id: 'strategy',
      name: 'Strategy Allocation',
      description: 'Distribution of assets among strategies',
      chartType: 'pie',
      icon: PieChart,
      color: '#f59e0b'
    },
    {
      id: 'revenue',
      name: 'Protocol Revenue',
      description: 'Earnings over time for sustainability',
      chartType: 'area',
      icon: DollarSign,
      color: '#ef4444'
    }
  ];

  const getDuneQuery = (visualizationId: string) => {
    const queries = analyticsService.getDuneSQLQueries();
    return queries[visualizationId] || '';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Query copied to clipboard',
    });
  };

  const openDuneQuery = (query: string) => {
    // In a real implementation, this would open Dune Analytics with the query
    toast({
      title: 'Dune Analytics',
      description: 'Opening Dune Analytics with the query...',
    });
  };

  const exportVisualization = (visualizationId: string) => {
    toast({
      title: 'Export Started',
      description: `Exporting ${visualizationId} visualization...`,
    });
  };

  const shareVisualization = (visualizationId: string) => {
    toast({
      title: 'Share Link',
      description: `Sharing ${visualizationId} visualization...`,
    });
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case '1y': return 'Last year';
      default: return 'Last 30 days';
    }
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            Dune Analytics Visualizations
          </h2>
          <p className="text-muted-foreground">
            Interactive charts and graphs powered by Dune Analytics
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm font-medium">Time Range</label>
                  <select 
                    value={timeRange} 
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="ml-2 px-3 py-1 border rounded-md"
                  >
                    <option value="7d">7 days</option>
                    <option value="30d">30 days</option>
                    <option value="90d">90 days</option>
                    <option value="1y">1 year</option>
                  </select>
                </div>
                <Badge variant="outline">
                  {getTimeRangeLabel(timeRange)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsLoading(true)}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visualization Tabs */}
        <Tabs value={activeVisualization} onValueChange={setActiveVisualization}>
          <TabsList className="grid w-full grid-cols-5">
            {visualizations.map((viz) => (
              <TabsTrigger key={viz.id} value={viz.id} className="flex items-center gap-2">
                <viz.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{viz.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {visualizations.map((viz) => (
            <TabsContent key={viz.id} value={viz.id} className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <viz.icon className="h-5 w-5" style={{ color: viz.color }} />
                        {viz.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {viz.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDuneQuery(getDuneQuery(viz.id))}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Dune
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => exportVisualization(viz.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => shareVisualization(viz.id)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    {viz.chartType === 'line' && <TVLChart timeRange={timeRange} />}
                    {viz.chartType === 'bar' && <UserActivityChart timeRange={timeRange} />}
                    {viz.chartType === 'area' && viz.id === 'yield' && <YieldChart timeRange={timeRange} />}
                    {viz.chartType === 'area' && viz.id === 'revenue' && <RevenueChart timeRange={timeRange} />}
                    {viz.chartType === 'pie' && <StrategyChart timeRange={timeRange} />}
                  </div>
                </CardContent>
              </Card>

              {/* SQL Query Display */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">SQL Query</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(getDuneQuery(viz.id))}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Query
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{getDuneQuery(viz.id)}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Dune Integration Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Dune Analytics Integration</p>
                <p>
                  These visualizations are powered by Dune Analytics queries. 
                  Click "Open in Dune" to view the live data and create custom dashboards.
                  All queries are optimized for Kaia network data and updated in real-time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Chart Components
const TVLChart: React.FC<{ timeRange: string }> = ({ timeRange }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const tvlData = await analyticsService.getTVLData(days);
      setData(tvlData.map(d => ({
        date: new Date(d.date).toLocaleDateString(),
        tvl: d.tvl,
        change: d.change
      })));
    };
    loadData();
  }, [timeRange]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => [formatCurrency(value), 'TVL']} />
        <Line type="monotone" dataKey="tvl" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

const UserActivityChart: React.FC<{ timeRange: string }> = ({ timeRange }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const userData = await analyticsService.getUserActivityData(days);
      setData(userData.map(d => ({
        date: new Date(d.date).toLocaleDateString(),
        dailyDepositors: d.dailyDepositors,
        newUsers: d.newUsers
      })));
    };
    loadData();
  }, [timeRange]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="dailyDepositors" fill="#10b981" name="Daily Depositors" />
        <Line type="monotone" dataKey="newUsers" stroke="#3b82f6" strokeWidth={2} name="New Users" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

const YieldChart: React.FC<{ timeRange: string }> = ({ timeRange }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const yieldData = await analyticsService.getYieldPerformanceData(days);
      setData(yieldData.map(d => ({
        date: new Date(d.date).toLocaleDateString(),
        avgApy: d.avgApy,
        maxApy: d.maxApy,
        minApy: d.minApy
      })));
    };
    loadData();
  }, [timeRange]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value}%`, 'APY']} />
        <Area 
          type="monotone" 
          dataKey="avgApy" 
          stackId="1" 
          stroke="#8b5cf6" 
          fill="#8b5cf6" 
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const RevenueChart: React.FC<{ timeRange: string }> = ({ timeRange }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const revenueData = await analyticsService.getRevenueData(days);
      setData(revenueData.map(d => ({
        date: new Date(d.date).toLocaleDateString(),
        dailyRevenue: d.dailyFeeRevenue,
        cumulativeRevenue: d.cumulativeRevenue
      })));
    };
    loadData();
  }, [timeRange]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
        <Area 
          type="monotone" 
          dataKey="cumulativeRevenue" 
          stackId="1" 
          stroke="#ef4444" 
          fill="#ef4444" 
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const StrategyChart: React.FC<{ timeRange: string }> = ({ timeRange }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const strategyData = await analyticsService.getStrategyAllocationData();
      setData(strategyData.map(d => ({
        name: d.strategyName,
        value: d.totalLocked,
        percentage: d.percentage,
        apy: d.apy
      })));
    };
    loadData();
  }, [timeRange]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name}: ${percentage}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

export default DuneVisualizations;

