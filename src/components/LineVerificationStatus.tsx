import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

interface LineChannelInfo {
  bot: {
    id: string;
    name: string;
    pictureUrl: string;
    description: string;
  };
  channelId: string;
  providerId: string;
}

interface LiffApp {
  liffId: string;
  view: {
    type: string;
    url: string;
  };
  description: string;
  features: {
    ble: boolean;
    qrCode: boolean;
  };
  permanentLinkPattern: string;
  scope: string[];
  botPrompt: string;
}

interface RichMenuInfo {
  richMenuId: string;
  name: string;
  chatBarText: string;
  size: {
    width: number;
    height: number;
  };
  areas: Array<{
    bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    action: {
      type: string;
      label: string;
      uri: string;
    };
  }>;
  selected: boolean;
  imageUrl?: string;
}

interface OfficialAccountInfo {
  botId: string;
  isActive: boolean;
  canSendMessages: boolean;
  webhookUrl?: string;
  webhookActive: boolean;
  richMenu?: {
    exists: boolean;
    configured: boolean;
    info?: RichMenuInfo;
    error?: string;
  };
}

interface VerificationResult {
  success: boolean;
  messagingApiChannel: {
    exists: boolean;
    active: boolean;
    info?: LineChannelInfo;
    error?: string;
  };
  liffApps: {
    exists: boolean;
    count: number;
    apps: LiffApp[];
    error?: string;
  };
  officialAccount: {
    exists: boolean;
    active: boolean;
    info?: OfficialAccountInfo;
    error?: string;
    friendPromptConfigured: boolean;
  };
  overallStatus: 'healthy' | 'warning' | 'error';
  timestamp: string;
}

interface LineVerificationStatusProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const LineVerificationStatus: React.FC<LineVerificationStatusProps> = ({
  className = '',
  autoRefresh = false,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkLineStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/line/verify/status');
      const data = await response.json();

      if (data.success) {
        setResult(data.result);
        setLastChecked(new Date());
      } else {
        setError(data.error || 'Failed to verify LINE setup');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLineStatus();

    if (autoRefresh) {
      const interval = setInterval(checkLineStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500">Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading && !result) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            LINE Setup Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Checking LINE setup...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            LINE Setup Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={checkLineStatus} 
            variant="outline" 
            className="mt-4"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(result.overallStatus)}
            LINE Setup Verification
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(result.overallStatus)}
            <Button
              onClick={checkLineStatus}
              variant="ghost"
              size="sm"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messaging API Channel Status */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            🤖 Messaging API Channel
            {result.messagingApiChannel.active ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </h4>
          
          {result.messagingApiChannel.active && result.messagingApiChannel.info ? (
            <div className="pl-6 space-y-1 text-sm text-muted-foreground">
              <p><strong>Bot ID:</strong> {result.messagingApiChannel.info.bot.id}</p>
              <p><strong>Bot Name:</strong> {result.messagingApiChannel.info.bot.name}</p>
              <p><strong>Channel ID:</strong> {result.messagingApiChannel.info.channelId}</p>
              {result.messagingApiChannel.info.providerId && (
                <p><strong>Provider ID:</strong> {result.messagingApiChannel.info.providerId}</p>
              )}
            </div>
          ) : (
            <div className="pl-6">
              <p className="text-sm text-red-600">
                {result.messagingApiChannel.error || 'Channel not active or accessible'}
              </p>
            </div>
          )}
        </div>

        {/* LIFF Apps Status */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            📱 LIFF Apps
            {result.liffApps.exists ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </h4>
          
          {result.liffApps.exists && result.liffApps.apps.length > 0 ? (
            <div className="pl-6 space-y-2">
              <p className="text-sm text-green-600">
                {result.liffApps.count} published app(s) found
              </p>
              {result.liffApps.apps.map((app, index) => (
                <div key={app.liffId} className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">App {index + 1}</p>
                    <Badge variant="outline" className="text-xs">
                      {app.view.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong>LIFF ID:</strong> {app.liffId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>URL:</strong> 
                    <a 
                      href={app.view.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-1 text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      {app.view.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                  {app.description && (
                    <p className="text-xs text-muted-foreground">
                      <strong>Description:</strong> {app.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="pl-6">
              <p className="text-sm text-red-600">
                {result.liffApps.error || 'No published LIFF apps found'}
              </p>
            </div>
          )}
        </div>

        {/* Official Account Status */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            🤖 Official Account
            {result.officialAccount.active ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </h4>
          
          {result.officialAccount.active && result.officialAccount.info ? (
            <div className="pl-6 space-y-1 text-sm text-muted-foreground">
              <p><strong>Bot ID:</strong> {result.officialAccount.info.botId}</p>
              <p><strong>Can Send Messages:</strong> {result.officialAccount.info.canSendMessages ? 'Yes' : 'No'}</p>
              <p><strong>Webhook Active:</strong> {result.officialAccount.info.webhookActive ? 'Yes' : 'No'}</p>
              <p><strong>Friend Prompt Configured:</strong> {result.officialAccount.friendPromptConfigured ? 'Yes' : 'No'}</p>
              
              {/* Rich Menu Status */}
              {result.officialAccount.info.richMenu && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                  <p className="text-blue-800 font-medium">📋 Rich Menu Status:</p>
                  <p className="text-blue-700">
                    <strong>Exists:</strong> {result.officialAccount.info.richMenu.exists ? 'Yes' : 'No'}
                    {result.officialAccount.info.richMenu.configured && ' ✅ Configured correctly'}
                  </p>
                  {result.officialAccount.info.richMenu.info && (
                    <div className="mt-1 text-blue-600">
                      <p><strong>Name:</strong> {result.officialAccount.info.richMenu.info.name}</p>
                      <p><strong>Size:</strong> {result.officialAccount.info.richMenu.info.size.width}x{result.officialAccount.info.richMenu.info.size.height}</p>
                      <p><strong>Areas:</strong> {result.officialAccount.info.richMenu.info.areas.length}</p>
                    </div>
                  )}
                  {result.officialAccount.info.richMenu.error && (
                    <p className="text-red-600"><strong>Error:</strong> {result.officialAccount.info.richMenu.error}</p>
                  )}
                </div>
              )}
              
              {!result.officialAccount.friendPromptConfigured && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <p className="text-yellow-800 font-medium">⚠️ Manual Configuration Required:</p>
                  <p className="text-yellow-700">Go to LINE Login Channel → LIFF → Add friend option → Set to "On (aggressive)"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="pl-6">
              <p className="text-sm text-red-600">
                {result.officialAccount.error || 'Official Account not linked or inactive'}
              </p>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {result.overallStatus === 'healthy' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your LINE setup is properly configured and ready for development!
            </AlertDescription>
          </Alert>
        )}

        {result.overallStatus === 'warning' && (
          <Alert variant="default" className="border-yellow-500">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your LINE setup has some issues that need attention. Check the LINE Developers Console.
            </AlertDescription>
          </Alert>
        )}

        {result.overallStatus === 'error' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Your LINE setup has critical issues that must be fixed before development can proceed.
            </AlertDescription>
          </Alert>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>
            Last checked: {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}
          </span>
          {autoRefresh && (
            <span>Auto-refresh: {refreshInterval / 1000}s</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LineVerificationStatus;
