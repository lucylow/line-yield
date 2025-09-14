import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { InAppItem, getItemById } from '../data/mockItems';

interface InventoryItem {
  itemId: string;
  quantity: number;
  purchasedAt: string;
  expiresAt?: string;
  isActive: boolean;
}

interface UserInventoryProps {
  userId: string;
  inventory: InventoryItem[];
  onUseItem?: (itemId: string) => void;
  onActivateItem?: (itemId: string) => void;
}

export const UserInventory: React.FC<UserInventoryProps> = ({
  userId,
  inventory,
  onUseItem,
  onActivateItem
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'active' | 'expired' | 'consumable'>('all');
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    filterInventory();
  }, [selectedCategory, inventory]);

  const filterInventory = () => {
    let filtered = [...inventory];

    switch (selectedCategory) {
      case 'active':
        filtered = filtered.filter(item => item.isActive && !isExpired(item));
        break;
      case 'expired':
        filtered = filtered.filter(item => isExpired(item));
        break;
      case 'consumable':
        filtered = filtered.filter(item => {
          const itemData = getItemById(item.itemId);
          return itemData?.category === 'booster' || itemData?.category === 'utility';
        });
        break;
      default:
        // Show all items
        break;
    }

    setFilteredInventory(filtered);
  };

  const isExpired = (item: InventoryItem): boolean => {
    if (!item.expiresAt) return false;
    return new Date(item.expiresAt) < new Date();
  };

  const getTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getItemStatus = (item: InventoryItem): 'active' | 'expired' | 'inactive' => {
    if (isExpired(item)) return 'expired';
    if (item.isActive) return 'active';
    return 'inactive';
  };

  const getStatusColor = (status: 'active' | 'expired' | 'inactive'): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUseItem = (itemId: string) => {
    if (onUseItem) {
      onUseItem(itemId);
    }
  };

  const handleActivateItem = (itemId: string) => {
    if (onActivateItem) {
      onActivateItem(itemId);
    }
  };

  const categories = [
    { id: 'all', label: 'All Items', count: inventory.length },
    { id: 'active', label: 'Active', count: inventory.filter(item => item.isActive && !isExpired(item)).length },
    { id: 'expired', label: 'Expired', count: inventory.filter(item => isExpired(item)).length },
    { id: 'consumable', label: 'Consumables', count: inventory.filter(item => {
      const itemData = getItemById(item.itemId);
      return itemData?.category === 'booster' || itemData?.category === 'utility';
    }).length }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Inventory</h1>
        <p className="text-gray-600">Manage your purchased items and active effects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{inventory.length}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {inventory.filter(item => item.isActive && !isExpired(item)).length}
            </div>
            <div className="text-sm text-gray-600">Active Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {inventory.filter(item => {
                const itemData = getItemById(item.itemId);
                return itemData?.category === 'nft';
              }).length}
            </div>
            <div className="text-sm text-gray-600">NFTs Owned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {inventory.filter(item => {
                const itemData = getItemById(item.itemId);
                return itemData?.category === 'booster';
              }).length}
            </div>
            <div className="text-sm text-gray-600">Boosters</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id as any)}
                className="flex items-center gap-2"
              >
                {category.label}
                <Badge variant="secondary" className="ml-1">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inventory Grid */}
      {filteredInventory.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-gray-600">
                {selectedCategory === 'all' 
                  ? "You haven't purchased any items yet. Visit the store to get started!"
                  : `No ${selectedCategory} items in your inventory.`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.map((item) => {
            const itemData = getItemById(item.itemId);
            if (!itemData) return null;

            const status = getItemStatus(item);
            const canUse = itemData.category === 'booster' || itemData.category === 'utility';
            const canActivate = !item.isActive && !isExpired(item);

            return (
              <Card key={`${item.itemId}-${item.purchasedAt}`} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{itemData.name}</CardTitle>
                    <Badge className={getStatusColor(status)}>
                      {status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl mb-2">{itemData.icon}</div>
                  <p className="text-sm text-gray-600 mb-3">{itemData.description}</p>
                  
                  {/* Item Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="font-semibold">{item.quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Purchased:</span>
                      <span className="font-semibold">
                        {new Date(item.purchasedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {item.expiresAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Expires:</span>
                        <span className={`font-semibold ${isExpired(item) ? 'text-red-600' : 'text-green-600'}`}>
                          {getTimeRemaining(item.expiresAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Effects */}
                  {itemData.effects && itemData.effects.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-1">Effects:</p>
                      <div className="flex flex-wrap gap-1">
                        {itemData.effects.map((effect, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {effect.type}: +{effect.value}%
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {canUse && (
                      <Button 
                        size="sm" 
                        onClick={() => handleUseItem(item.itemId)}
                        disabled={status !== 'active'}
                        className="flex-1"
                      >
                        Use
                      </Button>
                    )}
                    {canActivate && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleActivateItem(item.itemId)}
                        className="flex-1"
                      >
                        Activate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Active Effects Summary */}
      {inventory.filter(item => item.isActive && !isExpired(item)).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Effects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventory
                .filter(item => item.isActive && !isExpired(item))
                .map((item) => {
                  const itemData = getItemById(item.itemId);
                  if (!itemData || !itemData.effects) return null;

                  return (
                    <div key={item.itemId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{itemData.icon}</div>
                        <div>
                          <div className="font-semibold">{itemData.name}</div>
                          <div className="text-sm text-gray-600">
                            {itemData.effects.map(effect => `${effect.type}: +${effect.value}%`).join(', ')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">Active</div>
                        {item.expiresAt && (
                          <div className="text-xs text-gray-500">
                            {getTimeRemaining(item.expiresAt)} left
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

