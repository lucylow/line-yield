import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Crown, 
  Star, 
  Zap, 
  Shield,
  Download,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { NFT, RewardRarity } from '../types/gamification';
import { useT } from '../hooks/useLocalization';
import { cn } from '../utils/cn';

interface NFTCardProps {
  nft: NFT;
  onClaim?: (nftId: string) => void;
  onView?: (nftId: string) => void;
  className?: string;
  showClaimButton?: boolean;
}

export const NFTCard: React.FC<NFTCardProps> = ({
  nft,
  onClaim,
  onView,
  className = '',
  showClaimButton = false
}) => {
  const t = useT();

  const getRarityIcon = (rarity: RewardRarity) => {
    switch (rarity) {
      case RewardRarity.LEGENDARY:
        return <Crown className="w-4 h-4" />;
      case RewardRarity.EPIC:
        return <Star className="w-4 h-4" />;
      case RewardRarity.RARE:
        return <Zap className="w-4 h-4" />;
      case RewardRarity.COMMON:
        return <Shield className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getRarityColor = (rarity: RewardRarity) => {
    switch (rarity) {
      case RewardRarity.LEGENDARY:
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case RewardRarity.EPIC:
        return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white';
      case RewardRarity.RARE:
        return 'bg-gradient-to-r from-green-500 to-blue-500 text-white';
      case RewardRarity.COMMON:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityBorderColor = (rarity: RewardRarity) => {
    switch (rarity) {
      case RewardRarity.LEGENDARY:
        return 'border-purple-300';
      case RewardRarity.EPIC:
        return 'border-blue-300';
      case RewardRarity.RARE:
        return 'border-green-300';
      case RewardRarity.COMMON:
        return 'border-gray-300';
      default:
        return 'border-gray-300';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Card className={cn(
      'group transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
      getRarityBorderColor(nft.rarity),
      className
    )}>
      <CardHeader className="p-0">
        <div className="relative">
          <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-gray-100">
            {nft.image ? (
              <img
                src={nft.image}
                alt={nft.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/nfts/placeholder.png';
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <Image className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Rarity Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={cn(
              'flex items-center gap-1 px-2 py-1',
              getRarityColor(nft.rarity)
            )}>
              {getRarityIcon(nft.rarity)}
              <span className="text-xs font-medium">{nft.rarity}</span>
            </Badge>
          </div>

          {/* Collection Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="text-xs">
              {nft.collection}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <div>
          <CardTitle className="text-lg font-bold line-clamp-1">
            {nft.name}
          </CardTitle>
          <CardDescription className="text-sm line-clamp-2">
            {nft.description}
          </CardDescription>
        </div>

        {/* Attributes */}
        {nft.attributes && nft.attributes.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-600">Attributes</div>
            <div className="flex flex-wrap gap-1">
              {nft.attributes.slice(0, 3).map((attr, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {attr.trait_type}: {attr.value}
                </Badge>
              ))}
              {nft.attributes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{nft.attributes.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Mint Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Minted {formatDate(nft.mintedAt)}
          </div>
          <div className="flex items-center gap-1">
            <span>#{nft.tokenId}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {showClaimButton && onClaim && (
            <Button
              onClick={() => onClaim(nft.id)}
              className="flex-1"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Claim NFT
            </Button>
          )}
          
          {onView && (
            <Button
              variant="outline"
              onClick={() => onView(nft.id)}
              size="sm"
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NFTCard;
