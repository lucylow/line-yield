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
  Download,
  Share2,
  FileText,
  Brain,
  Target,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyticsService, ProtocolMetrics, AnalyticsReport } from '@/services/AnalyticsService';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area } from 'recharts';

interface AnalyticsDashboardProps {
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<ProtocolMetrics | null>(null);
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { toast } = useToast();

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const protocolMetrics = await analyticsService.getProtocolMetrics();
      setMetrics(protocolMetrics);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast({
        title: 'Loading Failed',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (type: 'tvl' | 'users' | 'yield' | 'strategy' | 'revenue' | 'overview') => {
    try {
      const report = await analyticsService.generateAnalyticsReport(type);
      setReports(prev => [report, ...prev]);
      toast({
        title: 'Report Generated',
        description: `${report.title} has been generated successfully`,
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        title: 'Report Generation Failed',
        description: 'Failed to generate analytics report',
        variant: 'destructive'
      });
    }
  };

  const downloadReport = (report: AnalyticsReport) => {
    const reportData = {
      title: report.title,
      content: report.content,
      insights: report.insights,
      recommendations: report.recommendations,
      generatedAt: report.generatedAt,
      dataPeriod: report.dataPeriod
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading analytics data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-500" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights into Kaia Yield Optimizer performance
          </p>
        </div>

        {/* Key Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value Locked</p>
                    <p className="text-lg font-semibold">{formatCurrency(metrics.totalTVL)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-lg font-semibold">{formatNumber(metrics.totalUsers)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Average APY</p>
                    <p className="text-lg font-semibold">{metrics.avgApy.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Strategies</p>
                    <p className="text-lg font-semibold">{metrics.activeStrategies}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-lg font-semibold">{formatCurrency(metrics.totalRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Protocol Health</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold">{this.calculateHealthScore(metrics)}/100</p>
                      <Badge className={getHealthScoreBadge(this.calculateHealthScore(metrics))}>
                        {this.calculateHealthScore(metrics) >= 80 ? 'Excellent' : 
                         this.calculateHealthScore(metrics) >= 60 ? 'Good' : 'Needs Attention'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="visualizations" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Visualizations
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              AI Reports
            </TabsTrigger>
            <TabsTrigger value="sql" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              SQL Queries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* TVL Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      TVL Over Time
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => generateReport('tvl')}>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <TVLChart />
                </CardContent>
              </Card>

              {/* User Activity Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Activity
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => generateReport('users')}>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <UserActivityChart />
                </CardContent>
              </Card>

              {/* Yield Performance Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Yield Performance
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => generateReport('yield')}>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <YieldPerformanceChart />
                </CardContent>
              </Card>

              {/* Strategy Allocation Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Strategy Allocation
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => generateReport('strategy')}>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <StrategyAllocationChart />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="visualizations" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Protocol Health Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <HealthTrendsChart />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="space-y-4">
              {/* Report Generation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Generate AI Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <Button variant="outline" onClick={() => generateReport('overview')}>
                      <Target className="h-4 w-4 mr-2" />
                      Overview
                    </Button>
                    <Button variant="outline" onClick={() => generateReport('tvl')}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      TVL Analysis
                    </Button>
                    <Button variant="outline" onClick={() => generateReport('users')}>
                      <Users className="h-4 w-4 mr-2" />
                      User Activity
                    </Button>
                    <Button variant="outline" onClick={() => generateReport('yield')}>
                      <Activity className="h-4 w-4 mr-2" />
                      Yield Performance
                    </Button>
                    <Button variant="outline" onClick={() => generateReport('strategy')}>
                      <PieChart className="h-4 w-4 mr-2" />
                      Strategy Allocation
                    </Button>
                    <Button variant="outline" onClick={() => generateReport('revenue')}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Revenue Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Generated Reports */}
              {reports.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Generated Reports</h3>
                  {reports.map((report) => (
                    <Card key={report.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {report.title}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {report.type.toUpperCase()}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={() => downloadReport(report)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Generated on {new Date(report.generatedAt).toLocaleString()} • {report.dataPeriod}
                        </p>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium mb-2">Summary</h4>
                            <p className="text-sm">{report.content}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Key Insights</h4>
                            <ul className="text-sm space-y-1">
                              {report.insights.map((insight, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Recommendations</h4>
                            <ul className="text-sm space-y-1">
                              {report.recommendations.map((recommendation, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <AlertCircle className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                                  {recommendation}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sql" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Dune Analytics SQL Queries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SQLQueriesDisplay />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Chart Components
const TVLChart: React.FC = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const tvlData = await analyticsService.getTVLData(30);
      setData(tvlData.map(d => ({
        date: new Date(d.date).toLocaleDateString(),
        tvl: d.tvl,
        change: d.change
      })));
    };
    loadData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => [formatCurrency(value), 'TVL']} />
        <Line type="monotone" dataKey="tvl" stroke="#3b82f6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

const UserActivityChart: React.FC = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const userData = await analyticsService.getUserActivityData(30);
      setData(userData.map(d => ({
        date: new Date(d.date).toLocaleDateString(),
        dailyDepositors: d.dailyDepositors,
        totalDepositors: d.totalDepositors
      })));
    };
    loadData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="dailyDepositors" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const YieldPerformanceChart: React.FC = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const yieldData = await analyticsService.getYieldPerformanceData(30);
      setData(yieldData.map(d => ({
        date: new Date(d.date).toLocaleDateString(),
        avgApy: d.avgApy,
        maxApy: d.maxApy,
        minApy: d.minApy
      })));
    };
    loadData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value}%`, 'APY']} />
        <Area type="monotone" dataKey="avgApy" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const StrategyAllocationChart: React.FC = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const strategyData = await analyticsService.getStrategyAllocationData();
      setData(strategyData.map(d => ({
        name: d.strategyName,
        value: d.totalLocked,
        percentage: d.percentage
      })));
    };
    loadData();
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name}: ${percentage}%`}
          outerRadius={80}
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

const RevenueChart: React.FC = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const revenueData = await analyticsService.getRevenueData(30);
      setData(revenueData.map(d => ({
        date: new Date(d.date).toLocaleDateString(),
        dailyRevenue: d.dailyFeeRevenue,
        cumulativeRevenue: d.cumulativeRevenue
      })));
    };
    loadData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
        <Area type="monotone" dataKey="cumulativeRevenue" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const HealthTrendsChart: React.FC = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Mock health score data
    const mockData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      healthScore: 75 + Math.random() * 20
    }));
    setData(mockData);
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip formatter={(value) => [`${value}/100`, 'Health Score']} />
        <Line type="monotone" dataKey="healthScore" stroke="#ef4444" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

const SQLQueriesDisplay: React.FC = () => {
  const [queries, setQueries] = useState<Record<string, string>>({});

  useEffect(() => {
    const sqlQueries = analyticsService.getDuneSQLQueries();
    setQueries(sqlQueries);
  }, []);

  const copyQuery = (query: string) => {
    navigator.clipboard.writeText(query);
  };

  return (
    <div className="space-y-4">
      {Object.entries(queries).map(([name, query]) => (
        <Card key={name}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg capitalize">
                {name.replace(/([A-Z])/g, ' $1').trim()}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => copyQuery(query)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Query
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              <code>{query}</code>
            </pre>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalyticsDashboard;

