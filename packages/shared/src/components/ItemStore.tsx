import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { 
  mockInAppItems, 
  InAppItem, 
  getItemsByCategory, 
  getLimitedTimeItems, 
  getPopularItems,
  searchItems,
  convertCryptoToFiat,
  convertFiatToCrypto
} from '../data/mockItems';

interface ItemStoreProps {
  userAddress?: string;
  userEmail?: string;
  onPurchase?: (item: InAppItem, paymentMethod: 'crypto' | 'stripe') => void;
}

export const ItemStore: React.FC<ItemStoreProps> = ({ 
  userAddress, 
  userEmail, 
  onPurchase 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<InAppItem['category'] | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<InAppItem['rarity'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'price' | 'newest'>('popularity');
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'stripe'>('crypto');
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'KRW' | 'JPY' | 'TWD' | 'THB'>('USD');
  const [filteredItems, setFilteredItems] = useState<InAppItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InAppItem | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    filterItems();
  }, [selectedCategory, selectedRarity, searchQuery, sortBy]);

  const filterItems = () => {
    let items = [...mockInAppItems];

    // Filter by category
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }

    // Filter by rarity
    if (selectedRarity !== 'all') {
      items = items.filter(item => item.rarity === selectedRarity);
    }

    // Filter by search query
    if (searchQuery) {
      items = searchItems(searchQuery);
    }

    // Sort items
    items.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'price':
          return a.price.crypto.amount - b.price.crypto.amount;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredItems(items);
  };

  const getRarityColor = (rarity: InAppItem['rarity']): string => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      case 'mythic': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (item: InAppItem): string => {
    if (paymentMethod === 'crypto') {
      return `${item.price.crypto.amount} ${item.price.crypto.currency}`;
    } else {
      const fiatPrice = convertCryptoToFiat(
        item.price.crypto.amount,
        item.price.crypto.currency,
        selectedCurrency
      );
      return `${fiatPrice.toFixed(2)} ${selectedCurrency}`;
    }
  };

  const handlePurchase = (item: InAppItem) => {
    setSelectedItem(item);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = () => {
    if (selectedItem && onPurchase) {
      onPurchase(selectedItem, paymentMethod);
    }
    setShowPurchaseModal(false);
    setSelectedItem(null);
  };

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'nft', label: 'NFTs' },
    { id: 'premium', label: 'Premium' },
    { id: 'booster', label: 'Boosters' },
    { id: 'cosmetic', label: 'Cosmetics' },
    { id: 'utility', label: 'Utilities' },
    { id: 'subscription', label: 'Subscriptions' }
  ];

  const rarities = [
    { id: 'all', label: 'All Rarities' },
    { id: 'common', label: 'Common' },
    { id: 'rare', label: 'Rare' },
    { id: 'epic', label: 'Epic' },
    { id: 'legendary', label: 'Legendary' },
    { id: 'mythic', label: 'Mythic' }
  ];

  const limitedTimeItems = getLimitedTimeItems();
  const popularItems = getPopularItems(6);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LINE Yield Store</h1>
        <p className="text-gray-600">Purchase exclusive items, NFTs, and premium features</p>
      </div>

      {/* Limited Time Items */}
      {limitedTimeItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-red-600">🔥 Limited Time Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {limitedTimeItems.slice(0, 3).map((item) => (
              <Card key={item.id} className="border-red-200 bg-red-50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge className="bg-red-500 text-white">Limited</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-red-600">{formatPrice(item)}</span>
                    <Button 
                      size="sm" 
                      onClick={() => handlePurchase(item)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Popular Items */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">⭐ Popular Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {popularItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <Badge className={getRarityColor(item.rarity)}>{item.rarity}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl mb-2">{item.icon}</div>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{formatPrice(item)}</span>
                  <Button size="sm" onClick={() => handlePurchase(item)}>
                    Buy Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Browse All Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rarity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rarity</label>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {rarities.map((rarity) => (
                  <option key={rarity.id} value={rarity.id}>
                    {rarity.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="popularity">Popularity</option>
                <option value="price">Price</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="crypto">Crypto (YIELD)</option>
                <option value="stripe">Credit Card</option>
              </select>
            </div>
          </div>

          {/* Currency Selection for Stripe */}
          {paymentMethod === 'stripe' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD ($)</option>
                <option value="KRW">KRW (₩)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="TWD">TWD (NT$)</option>
                <option value="THB">THB (฿)</option>
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <Badge className={getRarityColor(item.rarity)}>{item.rarity}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl mb-2">{item.icon}</div>
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              
              {/* Effects */}
              {item.effects && item.effects.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Effects:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.effects.map((effect, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {effect.type}: +{effect.value}%
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock */}
              {item.stock && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500">
                    {item.stock.remaining} of {item.stock.total} remaining
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(item.stock.remaining / item.stock.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{formatPrice(item)}</span>
                <Button 
                  size="sm" 
                  onClick={() => handlePurchase(item)}
                  disabled={item.stock && item.stock.remaining <= 0}
                >
                  {item.stock && item.stock.remaining <= 0 ? 'Sold Out' : 'Buy Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Confirm Purchase</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">{selectedItem.icon}</div>
                <h3 className="text-lg font-semibold">{selectedItem.name}</h3>
                <p className="text-sm text-gray-600">{selectedItem.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-semibold">{formatPrice(selectedItem)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-semibold">
                    {paymentMethod === 'crypto' ? 'Crypto (YIELD)' : 'Credit Card'}
                  </span>
                </div>
                {paymentMethod === 'stripe' && (
                  <div className="flex justify-between">
                    <span>Currency:</span>
                    <span className="font-semibold">{selectedCurrency}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={() => setShowPurchaseModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmPurchase}
                  className="flex-1"
                >
                  Confirm Purchase
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

