import React, { useState, useEffect } from 'react';
import { Copy, Share2, Users, Gift, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';

interface ReferralStats {
  totalReferrals: number;
  totalEarnings: string;
  pendingRewards: string;
}

interface ReferralSystemProps {
  className?: string;
}

export const ReferralSystem: React.FC<ReferralSystemProps> = ({
  className = ''
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalReferrals: 0,
    totalEarnings: '0.00',
    pendingRewards: '0.00'
  });
  
  const { toast } = useToast();
  const { wallet } = useWallet();

  // Generate personalized invite link
  const generateInviteLink = () => {
    const baseUrl = window.location.origin;
    const referralCode = wallet.address ? 
      `?ref=${wallet.address.slice(0, 8)}` : 
      '?ref=line-yield';
    
    return `${baseUrl}/dashboard${referralCode}`;
  };

  // Copy invite link to clipboard
  const handleCopyInviteLink = async () => {
    try {
      const inviteLink = generateInviteLink();
      await navigator.clipboard.writeText(inviteLink);
      
      setCopySuccess(true);
      toast({
        title: "Invite Link Copied!",
        description: "Share this link with friends to earn rewards together",
      });
      
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy invite link:', err);
      toast({
        title: "Copy Failed",
        description: "Unable to copy invite link. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Share invite link using Web Share API or fallback to copy
  const handleShareInviteLink = async () => {
    try {
      const inviteLink = generateInviteLink();
      const shareText = `🚀 Join me on LINE Yield and start earning 8.64% APY on your USDT! 

💰 Earn automated yield on stablecoins
🔒 Secure DeFi strategies on Kaia blockchain
📱 Access directly from LINE Messenger

Get started: ${inviteLink}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'LINE Yield - Earn Automated Yield',
          text: shareText,
          url: inviteLink,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Invite Message Copied!",
          description: "Share this message with your friends",
        });
      }
    } catch (err) {
      console.error('Failed to share invite link:', err);
      toast({
        title: "Share Failed",
        description: "Unable to share invite link. Please try copying instead.",
        variant: "destructive",
      });
    }
  };

  // Simulate loading referral stats (in real app, this would come from API)
  useEffect(() => {
    // Simulate API call to get referral stats
    const loadReferralStats = async () => {
      // Mock data - replace with actual API call
      setReferralStats({
        totalReferrals: 12,
        totalEarnings: '45.67',
        pendingRewards: '12.34'
      });
    };

    if (wallet.isConnected) {
      loadReferralStats();
    }
  }, [wallet.isConnected]);

  if (!wallet.isConnected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Connect your wallet to access the referral program and start earning rewards.
          </p>
          <Button disabled className="w-full">
            Connect Wallet to Access Referrals
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Referral Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Referral Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {referralStats.totalReferrals}
              </div>
              <div className="text-sm text-muted-foreground">Total Referrals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${referralStats.totalEarnings}
              </div>
              <div className="text-sm text-muted-foreground">Total Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                ${referralStats.pendingRewards}
              </div>
              <div className="text-sm text-muted-foreground">Pending Rewards</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Link Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Invite Friends & Earn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Share your invite link and earn 0.5% of your friends' yield earnings!
            </p>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code className="flex-1 text-sm font-mono">
                {generateInviteLink()}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(generateInviteLink(), '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCopyInviteLink}
              className="flex-1 flex items-center gap-2"
              disabled={copySuccess}
            >
              {copySuccess ? (
                <>
                  <Copy className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </Button>
            
            <Button
              onClick={handleShareInviteLink}
              variant="outline"
              className="flex-1 flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">0.5% Commission</Badge>
            <Badge variant="secondary">Lifetime Rewards</Badge>
            <Badge variant="secondary">No Limits</Badge>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Referrals Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Share Your Link</p>
                <p className="text-sm text-muted-foreground">
                  Copy and share your personalized invite link with friends
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Friends Join & Deposit</p>
                <p className="text-sm text-muted-foreground">
                  When friends use your link and deposit USDT, you become their referrer
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Earn Commission</p>
                <p className="text-sm text-muted-foreground">
                  Earn 0.5% of their yield earnings automatically, forever
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralSystem;
