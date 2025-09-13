import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

interface LineFriendPromptProps {
  liffId: string;
  officialAccountUserId?: string;
  className?: string;
  autoPrompt?: boolean;
  showStatus?: boolean;
  onFriendAdded?: () => void;
  onError?: (error: string) => void;
}

interface LiffStatus {
  isInClient: boolean;
  isLoggedIn: boolean;
  userId?: string;
  profile?: {
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
  };
}

export const LineFriendPrompt: React.FC<LineFriendPromptProps> = ({
  liffId,
  officialAccountUserId,
  className = '',
  autoPrompt = false,
  showStatus = true,
  onFriendAdded,
  onError
}) => {
  const [liffStatus, setLiffStatus] = useState<LiffStatus>({
    isInClient: false,
    isLoggedIn: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompted, setPrompted] = useState(false);

  // Initialize LIFF SDK
  useEffect(() => {
    const initializeLiff = async () => {
      try {
        // In a real implementation, you would use the actual LINE SDK
        // For demo purposes, we'll simulate the LIFF environment
        if (typeof window !== 'undefined') {
          // Simulate LIFF initialization
          const mockStatus: LiffStatus = {
            isInClient: window.navigator.userAgent.includes('Line') || 
                       window.location.href.includes('line.me') ||
                       window.location.href.includes('liff'),
            isLoggedIn: true, // Simulate logged in state
            userId: 'U1234567890abcdef',
            profile: {
              displayName: 'LINE User',
              pictureUrl: 'https://via.placeholder.com/100',
              statusMessage: 'Earning yield on LINE!'
            }
          };
          
          setLiffStatus(mockStatus);

          // Auto-prompt if enabled and user is in LINE client
          if (autoPrompt && mockStatus.isInClient && mockStatus.isLoggedIn) {
            await promptAddFriend();
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize LIFF';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    };

    initializeLiff();
  }, [liffId, autoPrompt, onError]);

  const promptAddFriend = async () => {
    if (!liffStatus.isInClient) {
      const errorMsg = 'Friend prompting is only available in LINE client';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, you would use liff.follow()
      // For demo purposes, we'll simulate the friend prompting
      
      if (officialAccountUserId) {
        // Simulate the follow API call
        console.log('Prompting user to add Official Account:', officialAccountUserId);
        
        // In real implementation:
        // await liff.follow(officialAccountUserId);
        
        // Simulate successful friend prompt
        setPrompted(true);
        onFriendAdded?.();
        
        console.log('Add friend prompt triggered successfully');
      } else {
        throw new Error('Official Account User ID is required for friend prompting');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to prompt add friend';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!liffStatus.isInClient) {
      const errorMsg = 'Messaging is only available in LINE client';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, you would use liff.sendMessages()
      // For demo purposes, we'll simulate sending a message
      
      const message = {
        type: 'text',
        text: 'Welcome to LINE Yield! Start earning yield on your crypto assets.'
      };

      console.log('Sending welcome message:', message);
      
      // In real implementation:
      // await liff.sendMessages([message]);
      
      console.log('Welcome message sent successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (liffStatus.isInClient && liffStatus.isLoggedIn) {
      return <Badge variant="default" className="bg-green-500">Ready</Badge>;
    } else if (liffStatus.isInClient) {
      return <Badge variant="secondary" className="bg-yellow-500">Login Required</Badge>;
    } else {
      return <Badge variant="outline">Web Only</Badge>;
    }
  };

  if (!showStatus && !liffStatus.isInClient) {
    return null; // Don't show component if not in LINE client and status is hidden
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Official Account Friend Prompt
          </div>
          {showStatus && getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Information */}
        {showStatus && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span>Environment:</span>
              {liffStatus.isInClient ? (
                <Badge variant="outline" className="text-green-600">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  LINE Client
                </Badge>
              ) : (
                <Badge variant="outline">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Web Browser
                </Badge>
              )}
            </div>
            
            {liffStatus.isLoggedIn && liffStatus.profile && (
              <div className="flex items-center gap-2 text-sm">
                <span>User:</span>
                <Badge variant="outline">{liffStatus.profile.displayName}</Badge>
              </div>
            )}
          </div>
        )}

        {/* Friend Prompt Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="text-sm font-medium">Add Official Account</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Add our Official Account to receive updates and notifications about your yield farming activities.
          </p>

          <div className="flex gap-2">
            <Button
              onClick={promptAddFriend}
              disabled={!liffStatus.isInClient || loading || prompted}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : prompted ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {prompted ? 'Prompted' : 'Add Friend'}
            </Button>

            {liffStatus.isInClient && (
              <Button
                onClick={sendMessage}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Send Welcome
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {prompted && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Friend prompt sent successfully! The user can now add your Official Account.
            </AlertDescription>
          </Alert>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Friend prompting only works in LINE client environment</p>
          <p>• Users must be logged in to their LINE account</p>
          <p>• Configure "Add friend option" to "On (aggressive)" in LINE Developers Console</p>
          <p>• This complements the manual console setting for automatic prompting</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineFriendPrompt;


