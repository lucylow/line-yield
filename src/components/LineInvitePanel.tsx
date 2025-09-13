import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLineInvite } from '@/hooks/useLineInvite';
import { 
  Users, 
  Share2, 
  MessageCircle, 
  Gift,
  Copy,
  Check,
  ExternalLink,
  Heart,
  Star,
  Zap
} from 'lucide-react';

interface LineInvitePanelProps {
  className?: string;
  userAddress?: string;
}

export const LineInvitePanel: React.FC<LineInvitePanelProps> = ({
  className = '',
  userAddress
}) => {
  const {
    isInviteAvailable,
    isLoading,
    error,
    inviteFriends,
    shareToLine,
    shareToFriends
  } = useLineInvite();

  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate referral link
  const generateReferralLink = () => {
    const baseUrl = window.location.origin;
    const referralCode = userAddress ? userAddress.slice(0, 8) : 'line-yield';
    return `${baseUrl}/dashboard?ref=${referralCode}`;
  };

  const referralLink = generateReferralLink();

  // Copy referral link to clipboard
  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy referral link:', err);
    }
  };

  // Handle invite friends
  const handleInviteFriends = async () => {
    await inviteFriends({
      message: customMessage || undefined,
      url: referralLink
    });
  };

  // Handle share to LINE
  const handleShareToLine = async () => {
    await shareToLine(customMessage || 'Check out LINE Yield!', referralLink);
  };

  // Handle share to friends
  const handleShareToFriends = async () => {
    await shareToFriends(customMessage || 'Join me on LINE Yield!', referralLink);
  };

  const defaultInviteMessage = `🚀 Join me on LINE Yield and start earning 8.64% APY on your USDT! 

💰 Earn automated yield on stablecoins
🔒 Secure DeFi strategies on Kaia blockchain
📱 Access directly from LINE Messenger
⚡ Gas fee delegation - pay no transaction fees

Get started: ${referralLink}`;

  if (!isInviteAvailable) {
    return (
      <Card className={`shadow-lg ${className}`}>
        <CardContent className="p-6 text-center">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            LINE Invite Not Available
          </h3>
          <p className="text-gray-600 mb-4">
            LINE invite functionality is only available within the LINE app
          </p>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">Share this link manually:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono bg-white p-2 rounded border">
                {referralLink}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={copyReferralLink}
                className="flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`shadow-lg ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Invite Friends</CardTitle>
            <p className="text-sm text-gray-500">
              Share LINE Yield with your friends and earn rewards
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Referral Link */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Your Referral Link
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={referralLink}
              readOnly
              className="flex-1 font-mono text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={copyReferralLink}
              className="flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Custom Message */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Custom Message (Optional)
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder={defaultInviteMessage}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 text-sm"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            Leave empty to use the default message
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Invite Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleInviteFriends}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <Share2 className="w-5 h-5 animate-spin" />
                Inviting...
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                Invite Friends
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleShareToLine}
              disabled={isLoading}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Share to LINE
            </Button>
            
            <Button
              onClick={handleShareToFriends}
              disabled={isLoading}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Share to Friends
            </Button>
          </div>
        </div>

        {/* Rewards Info */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-800">Referral Rewards</span>
          </div>
          <div className="space-y-1 text-sm text-green-700">
            <div className="flex items-center gap-2">
              <Star className="w-3 h-3" />
              <span>Earn 0.5% of your friends' yield earnings</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3" />
              <span>Lifetime rewards - no limits</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3" />
              <span>Unlimited referrals</span>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center">
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>1,234+ Users</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>4.8★ Rating</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>8.64% APY</span>
            </div>
          </div>
        </div>

        {/* External Share Options */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3 text-center">
            Or share via other platforms
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(customMessage || 'Check out LINE Yield!')}&url=${encodeURIComponent(referralLink)}`, '_blank')}
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Twitter
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(customMessage || 'Check out LINE Yield!')}`, '_blank')}
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Telegram
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(customMessage || 'Check out LINE Yield!')} ${encodeURIComponent(referralLink)}`, '_blank')}
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              WhatsApp
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineInvitePanel;
