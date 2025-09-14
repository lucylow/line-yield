import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Heart,
  Share2
} from 'lucide-react';

interface AnalyticsData {
  volume: {
    daily: number;
    weekly: number;
    monthly: number;
    total: number;
    change24h: number;
    change7d: number;
    change30d: number;
  };
  sales: {
    daily: number;
    weekly: number;
    monthly: number;
    total: number;
    avgPrice: number;
    change24h: number;
    change7d: number;
  };
  users: {
    active: number;
    new: number;
    total: number;
    change24h: number;
    change7d: number;
  };
  collections: {
    total: number;
    active: number;
    new: number;
    topPerforming: {
      name: string;
      volume: number;
      sales: number;
      avgPrice: number;
    }[];
  };
  rarity: {
    Common: { count: number; volume: number; avgPrice: number };
    Rare: { count: number; volume: number; avgPrice: number };
    Epic: { count: number; volume: number; avgPrice: number };
    Legendary: { count: number; volume: number; avgPrice: number };
    Mythic: { count: number; volume: number; avgPrice: number };
    Transcendent: { count: number; volume: number; avgPrice: number };
  };
  trends: {
    hourly: { hour: number; volume: number; sales: number }[];
    daily: { date: string; volume: number; sales: number }[];
    weekly: { week: string; volume: number; sales: number }[];
  };
}

export const NFTAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock analytics data
      const mockAnalytics: AnalyticsData = {
        volume: {
          daily: 12500,
          weekly: 87500,
          monthly: 350000,
          total: 1250000,
          change24h: 12.5,
          change7d: -5.2,
          change30d: 25.8
        },
        sales: {
          daily: 45,
          weekly: 320,
          monthly: 1250,
          total: 4500,
          avgPrice: 278.5,
          change24h: 8.3,
          change7d: -2.1
        },
        users: {
          active: 1250,
          new: 85,
          total: 5500,
          change24h: 15.2,
          change7d: 8.7
        },
        collections: {
          total: 6,
          active: 6,
          new: 1,
          topPerforming: [
            { name: 'Yield Titans', volume: 450000, sales: 25, avgPrice: 18000 },
            { name: 'Yield Legends', volume: 320000, sales: 150, avgPrice: 2133 },
            { name: 'Yield Masters', volume: 280000, sales: 300, avgPrice: 933 },
            { name: 'Yield Pioneers', volume: 150000, sales: 800, avgPrice: 187 },
            { name: 'Yield Explorers', volume: 45000, sales: 1200, avgPrice: 37 },
            { name: 'Yield Novices', volume: 5000, sales: 2500, avgPrice: 2 }
          ]
        },
        rarity: {
          Common: { count: 2500, volume: 5000, avgPrice: 2 },
          Rare: { count: 1200, volume: 45000, avgPrice: 37 },
          Epic: { count: 800, volume: 150000, avgPrice: 187 },
          Legendary: { count: 300, volume: 280000, avgPrice: 933 },
          Mythic: { count: 150, volume: 320000, avgPrice: 2133 },
          Transcendent: { count: 25, volume: 450000, avgPrice: 18000 }
        },
        trends: {
          hourly: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            volume: Math.random() * 1000 + 200,
            sales: Math.floor(Math.random() * 10) + 1
          })),
          daily: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            volume: Math.random() * 5000 + 2000,
            sales: Math.floor(Math.random() * 50) + 10
          })),
          weekly: Array.from({ length: 12 }, (_, i) => ({
            week: `Week ${i + 1}`,
            volume: Math.random() * 20000 + 10000,
            sales: Math.floor(Math.random() * 200) + 50
          }))
        }
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    }
    return `$${volume}`;
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
        {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">NFT Analytics</h2>
          <p className="text-gray-600 mt-1">Comprehensive marketplace insights and trading volume data</p>
        </div>
        
        <div className="flex space-x-2">
          {(['24h', '7d', '30d', 'all'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">{formatVolume(analytics.volume.total)}</p>
                <div className="flex items-center mt-1">
                  {formatChange(analytics.volume.change24h)}
                  <span className="text-xs text-gray-500 ml-2">vs 24h ago</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.sales.total.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {formatChange(analytics.sales.change24h)}
                  <span className="text-xs text-gray-500 ml-2">vs 24h ago</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.users.active.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {formatChange(analytics.users.change24h)}
                  <span className="text-xs text-gray-500 ml-2">vs 24h ago</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900">${analytics.sales.avgPrice.toFixed(2)}</p>
                <div className="flex items-center mt-1">
                  {formatChange(analytics.sales.change7d)}
                  <span className="text-xs text-gray-500 ml-2">vs 7d ago</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volume Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Volume Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.trends.daily.slice(-7).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium">{formatVolume(day.volume)}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(day.volume / Math.max(...analytics.trends.daily.map(d => d.volume))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Rarity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.rarity).map(([rarity, data]) => (
                <div key={rarity} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      rarity === 'Common' ? 'bg-gray-500' :
                      rarity === 'Rare' ? 'bg-blue-500' :
                      rarity === 'Epic' ? 'bg-purple-500' :
                      rarity === 'Legendary' ? 'bg-yellow-500' :
                      rarity === 'Mythic' ? 'bg-red-500' :
                      'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}></div>
                    <span className="text-sm font-medium">{rarity}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{data.count}</div>
                    <div className="text-xs text-gray-500">{formatVolume(data.volume)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Collections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Top Performing Collections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.collections.topPerforming.map((collection, index) => (
              <div key={collection.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{collection.name}</h4>
                    <p className="text-sm text-gray-600">{collection.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatVolume(collection.volume)}</div>
                  <div className="text-sm text-gray-500">Avg: ${collection.avgPrice.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: 'sale', nft: 'Yield Titan #007', price: 2800, user: '0x742d...8b6', time: '2m ago' },
              { type: 'bid', nft: 'DeFi Master #042', price: 520, user: '0x1234...5678', time: '5m ago' },
              { type: 'sale', nft: 'Yield Pioneer #001', price: 150, user: '0xabcd...efgh', time: '12m ago' },
              { type: 'listing', nft: 'Yield Farmer #128', price: 75, user: '0x9876...5432', time: '1h ago' },
              { type: 'bid', nft: 'Yield Legend #015', price: 1200, user: '0x5678...9abc', time: '2h ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'sale' ? 'bg-green-100' :
                    activity.type === 'bid' ? 'bg-orange-100' :
                    'bg-blue-100'
                  }`}>
                    {activity.type === 'sale' ? <DollarSign className="w-4 h-4 text-green-600" /> :
                     activity.type === 'bid' ? <TrendingUp className="w-4 h-4 text-orange-600" /> :
                     <Eye className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div>
                    <p className="font-medium">{activity.nft}</p>
                    <p className="text-sm text-gray-600">{activity.user}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${activity.price}</div>
                  <div className="text-sm text-gray-500">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NFTAnalytics;

