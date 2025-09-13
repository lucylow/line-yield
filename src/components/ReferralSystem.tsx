import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Copy, 
  Share2, 
  Gift, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  QrCode,
  Link as LinkIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { gamificationService } from '@/services/GamificationService';

interface ReferralSystemProps {
  className?: string;
}

export const ReferralSystem: React.FC<ReferralSystemProps> = ({ className }) => {
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    referralPoints: '0',
    totalEarned: '0'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { wallet } = useWallet();
  const { toast } = useToast();

  // Generate referral code from wallet address
  useEffect(() => {
    if (wallet.address) {
      // Create a shorter referral code from the address
      const code = wallet.address.slice(2, 8).toUpperCase();
      setReferralCode(code);
    }
  }, [wallet.address]);

  // Load referral stats
  useEffect(() => {
    if (wallet.connected && wallet.provider) {
      loadReferralStats();
    }
  }, [wallet.connected, wallet.provider]);

  const loadReferralStats = async () => {
    if (!wallet.provider || !wallet.address) return;

    setIsLoading(true);
    try {
      await gamificationService.initialize(wallet.provider, wallet.signer);
      const stats = await gamificationService.getUserStats(wallet.address);
      
      setReferralStats({
        totalReferrals: stats.referrals,
        referralPoints: stats.referralPoints,
        totalEarned: stats.totalEarned
      });
    } catch (error) {
      console.error('Failed to load referral stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = async () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Referral link copied to clipboard',
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy referral link',
        variant: 'destructive'
      });
    }
  };

  const shareReferralLink = async () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join LINE YIELD with my referral!',
          text: 'Earn yield on your stablecoins with LINE YIELD. Use my referral code for bonus points!',
          url: referralLink,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback to copy
      await copyReferralLink();
    }
  };

  const generateQRCode = () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    // In a real implementation, you would generate a QR code
    // For now, we'll just show the link
    return referralLink;
  };

  const getReferralLink = () => {
    return `${window.location.origin}?ref=${referralCode}`;
  };

  const getSocialShareLinks = () => {
    const referralLink = encodeURIComponent(getReferralLink());
    const text = encodeURIComponent('Join LINE YIELD with my referral! Earn yield on your stablecoins and get bonus points!');
    
    return {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${referralLink}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${referralLink}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${referralLink}`,
      telegram: `https://t.me/share/url?url=${referralLink}&text=${text}`,
      whatsapp: `https://wa.me/?text=${text}%20${referralLink}`
    };
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Users className="h-6 w-6 text-blue-500" />
            Referral System
          </h2>
          <p className="text-muted-foreground">
            Invite friends and earn 50 points for each successful referral
          </p>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  <p className="text-lg font-semibold">{referralStats.totalReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Referral Points</p>
                  <p className="text-lg font-semibold">{referralStats.referralPoints}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-lg font-semibold">{referralStats.totalEarned}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={referralCode}
                readOnly
                className="font-mono text-lg"
              />
              <Button
                onClick={copyReferralLink}
                variant="outline"
                size="sm"
                className={copied ? 'bg-green-50 border-green-200' : ''}
              >
                {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Share your referral link:</p>
              <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                {getReferralLink()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share & Earn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                onClick={shareReferralLink}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              
              <Button
                onClick={() => window.open(getSocialShareLinks().twitter, '_blank')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Twitter
              </Button>
              
              <Button
                onClick={() => window.open(getSocialShareLinks().telegram, '_blank')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Telegram
              </Button>
              
              <Button
                onClick={() => window.open(getSocialShareLinks().whatsapp, '_blank')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              How Referrals Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Share Your Referral Link</p>
                  <p className="text-sm text-muted-foreground">
                    Copy your unique referral link and share it with friends
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Friend Joins & Deposits</p>
                  <p className="text-sm text-muted-foreground">
                    When your friend joins using your link and makes their first deposit
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Both Earn Points</p>
                  <p className="text-sm text-muted-foreground">
                    You both receive 50 points automatically
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Rewards */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="pt-4">
            <div className="text-center space-y-2">
              <Gift className="h-8 w-8 mx-auto text-green-500" />
              <h3 className="font-semibold text-lg">Referral Rewards</h3>
              <div className="flex justify-center gap-4">
                <Badge variant="outline" className="text-green-600 border-green-300">
                  You: 50 Points
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  Friend: 50 Points
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                No limit on referrals! Earn more by inviting more friends.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Conditions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Terms:</strong> Referrals must be new users who haven't previously used LINE YIELD. 
            Points are awarded after the referred user makes their first deposit. 
            Referral points are non-transferable and cannot be exchanged for cash.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default ReferralSystem;