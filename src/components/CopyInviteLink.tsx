import React, { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';

interface CopyInviteLinkProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const CopyInviteLink: React.FC<CopyInviteLinkProps> = ({
  className = '',
  variant = 'default',
  size = 'md'
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const { toast } = useToast();
  const { wallet } = useWallet();

  // Generate invite link with user's wallet address as referral parameter
  const generateInviteLink = () => {
    const baseUrl = window.location.origin;
    const referralCode = wallet.address ? 
      `?ref=${wallet.address.slice(0, 8)}` : 
      '?ref=line-yield';
    
    return `${baseUrl}/dashboard${referralCode}`;
  };

  const handleCopyInviteLink = async () => {
    try {
      const inviteLink = generateInviteLink();
      await navigator.clipboard.writeText(inviteLink);
      
      setCopySuccess(true);
      toast({
        title: "Invite Link Copied!",
        description: "Share this link with friends to earn rewards together",
      });
      
      // Reset success state after 2 seconds
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

  const handleShareInviteLink = async () => {
    try {
      const inviteLink = generateInviteLink();
      const shareText = `Join me on LINE Yield and start earning 8.64% APY on your USDT! ${inviteLink}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'LINE Yield - Earn Automated Yield',
          text: shareText,
          url: inviteLink,
        });
      } else {
        // Fallback to copying if Web Share API is not available
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Invite Text Copied!",
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

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={handleCopyInviteLink}
        variant={variant}
        size={size}
        className="flex items-center gap-2"
        disabled={copySuccess}
      >
        {copySuccess ? (
          <>
            <Check className="w-4 h-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy Invite Link
          </>
        )}
      </Button>
      
      <Button
        onClick={handleShareInviteLink}
        variant="outline"
        size={size}
        className="flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>
    </div>
  );
};

export default CopyInviteLink;
