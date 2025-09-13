import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  FileText, 
  Download, 
  Share2, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  PieChart,
  Clock,
  Sparkles,
  Copy,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyticsService, AnalyticsReport } from '@/services/AnalyticsService';

interface AIReportGeneratorProps {
  className?: string;
}

export const AIReportGenerator: React.FC<AIReportGeneratorProps> = ({ className }) => {
  const [selectedReportType, setSelectedReportType] = useState<string>('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30d');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [generatedReports, setGeneratedReports] = useState<AnalyticsReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<AnalyticsReport | null>(null);
  
  const { toast } = useToast();

  const reportTypes = [
    {
      id: 'overview',
      name: 'Protocol Overview',
      description: 'Comprehensive analysis of all key metrics',
      icon: Target,
      color: 'bg-blue-500'
    },
    {
      id: 'tvl',
      name: 'TVL Analysis',
      description: 'Total Value Locked trends and insights',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      id: 'users',
      name: 'User Activity',
      description: 'User adoption and engagement metrics',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      id: 'yield',
      name: 'Yield Performance',
      description: 'APY trends and yield optimization insights',
      icon: Activity,
      color: 'bg-orange-500'
    },
    {
      id: 'strategy',
      name: 'Strategy Allocation',
      description: 'Asset distribution and strategy performance',
      icon: PieChart,
      color: 'bg-red-500'
    },
    {
      id: 'revenue',
      name: 'Revenue Analysis',
      description: 'Protocol revenue and sustainability metrics',
      icon: DollarSign,
      color: 'bg-yellow-500'
    }
  ];

  const timeRanges = [
    { id: '7d', label: 'Last 7 days', description: 'Short-term trends' },
    { id: '30d', label: 'Last 30 days', description: 'Monthly analysis' },
    { id: '90d', label: 'Last 90 days', description: 'Quarterly insights' },
    { id: '1y', label: 'Last year', description: 'Annual overview' }
  ];

  const generateReport = async () => {
    if (!selectedReportType) {
      toast({
        title: 'Selection Required',
        description: 'Please select a report type',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const report = await analyticsService.generateAnalyticsReport(
        selectedReportType as any,
        timeRanges.find(tr => tr.id === selectedTimeRange)?.label || '30 days'
      );
      
      setGeneratedReports(prev => [report, ...prev]);
      setSelectedReport(report);
      
      toast({
        title: 'Report Generated',
        description: `${report.title} has been generated successfully`,
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate AI report',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCustomReport = async () => {
    if (!customPrompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a custom prompt',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      // In a real implementation, this would call an AI service with the custom prompt
      const customReport: AnalyticsReport = {
        id: `custom_${Date.now()}`,
        title: 'Custom Analysis Report',
        type: 'overview',
        content: `Based on your custom prompt: "${customPrompt}", here's an AI-generated analysis of the Kaia Yield Optimizer protocol. The analysis considers current market conditions, user behavior patterns, and protocol performance metrics to provide actionable insights.`,
        insights: [
          'Custom analysis based on your specific requirements',
          'Tailored insights for your use case',
          'Actionable recommendations based on current data'
        ],
        recommendations: [
          'Implement the suggested improvements based on your analysis',
          'Monitor the recommended metrics closely',
          'Consider the custom insights for strategic planning'
        ],
        generatedAt: new Date().toISOString(),
        dataPeriod: timeRanges.find(tr => tr.id === selectedTimeRange)?.label || '30 days'
      };

      setGeneratedReports(prev => [customReport, ...prev]);
      setSelectedReport(customReport);
      setCustomPrompt('');
      
      toast({
        title: 'Custom Report Generated',
        description: 'Your custom analysis has been generated successfully',
      });
    } catch (error) {
      console.error('Failed to generate custom report:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate custom report',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (report: AnalyticsReport) => {
    const reportData = {
      title: report.title,
      content: report.content,
      insights: report.insights,
      recommendations: report.recommendations,
      generatedAt: report.generatedAt,
      dataPeriod: report.dataPeriod,
      type: report.type
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

  const shareReport = (report: AnalyticsReport) => {
    const shareData = {
      title: report.title,
      text: report.content,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(`${report.title}\n\n${report.content}`);
      toast({
        title: 'Copied to Clipboard',
        description: 'Report content has been copied to clipboard',
      });
    }
  };

  const copyReportContent = (report: AnalyticsReport) => {
    const content = `${report.title}\n\n${report.content}\n\nKey Insights:\n${report.insights.map(i => `• ${i}`).join('\n')}\n\nRecommendations:\n${report.recommendations.map(r => `• ${r}`).join('\n')}`;
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied to Clipboard',
      description: 'Report content has been copied to clipboard',
    });
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            AI Report Generator
          </h2>
          <p className="text-muted-foreground">
            Generate intelligent analytics reports with AI-powered insights
          </p>
        </div>

        {/* Report Generation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Standard Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Standard Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Report Type</label>
                  <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${type.color}`} />
                            <span>{type.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Time Range</label>
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeRanges.map((range) => (
                        <SelectItem key={range.id} value={range.id}>
                          <div>
                            <div className="font-medium">{range.label}</div>
                            <div className="text-sm text-muted-foreground">{range.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={generateReport} 
                  disabled={isGenerating || !selectedReportType}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Custom Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Custom Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Custom Prompt</label>
                  <Textarea
                    placeholder="Describe what you want to analyze... (e.g., 'Analyze the correlation between TVL growth and user retention')"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Time Range</label>
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeRanges.map((range) => (
                        <SelectItem key={range.id} value={range.id}>
                          <div>
                            <div className="font-medium">{range.label}</div>
                            <div className="text-sm text-muted-foreground">{range.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={generateCustomReport} 
                  disabled={isGenerating || !customPrompt.trim()}
                  className="w-full"
                  variant="outline"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Generate Custom Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated Reports */}
        {generatedReports.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Reports</h3>
              <Badge variant="outline">
                {generatedReports.length} report{generatedReports.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="space-y-4">
              {generatedReports.map((report) => (
                <Card key={report.id} className={selectedReport?.id === report.id ? 'ring-2 ring-blue-500' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {report.title}
                        </CardTitle>
                        <Badge variant="outline">
                          {report.type.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyReportContent(report)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => downloadReport(report)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => shareReport(report)}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(report.generatedAt).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {report.dataPeriod}
                      </div>
                    </div>
                  </CardHeader>
                  
                  {selectedReport?.id === report.id && (
                    <CardContent className="space-y-4">
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
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* AI Capabilities Info */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
              <div className="text-sm text-purple-800">
                <p className="font-medium">AI-Powered Analytics</p>
                <p>
                  Our AI report generator analyzes real-time protocol data to provide intelligent insights, 
                  trend analysis, and actionable recommendations. Reports are generated using advanced 
                  machine learning models trained on DeFi protocols and market data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIReportGenerator;

