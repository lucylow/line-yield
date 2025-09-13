import React, { useState, useRef, useCallback } from 'react';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobilePullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

export const MobilePullToRefresh: React.FC<MobilePullToRefreshProps> = ({
  onRefresh,
  children,
  className = '',
  threshold = 80,
  disabled = false
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  
  const startY = useRef(0);
  const currentY = useRef(0);
  const isPullingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    startY.current = e.touches[0].clientY;
    isPullingRef.current = false;
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    currentY.current = e.touches[0].clientY;
    const scrollTop = containerRef.current?.scrollTop || 0;
    
    // Only trigger pull-to-refresh if at the top of the scroll
    if (scrollTop === 0 && currentY.current > startY.current) {
      e.preventDefault();
      
      const distance = Math.min(currentY.current - startY.current, threshold * 1.5);
      setPullDistance(distance);
      
      if (distance > 20) {
        setIsPulling(true);
        isPullingRef.current = true;
      }
    }
  }, [disabled, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing || !isPullingRef.current) {
      setIsPulling(false);
      setPullDistance(0);
      return;
    }

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setRefreshSuccess(false);
      
      try {
        await onRefresh();
        setRefreshSuccess(true);
        
        // Show success state briefly
        setTimeout(() => {
          setRefreshSuccess(false);
        }, 1500);
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        setIsPulling(false);
        setPullDistance(0);
      }
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
  }, [disabled, isRefreshing, pullDistance, threshold, onRefresh]);

  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div 
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div 
        className={cn(
          'absolute top-0 left-0 right-0 z-10 flex items-center justify-center transition-all duration-200',
          isPulling || isRefreshing ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
          transform: `translateY(${isRefreshing ? 0 : -60 + pullDistance}px)`
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
            refreshSuccess 
              ? 'bg-green-100 text-green-600' 
              : shouldTrigger 
                ? 'bg-emerald-100 text-emerald-600' 
                : 'bg-gray-100 text-gray-400'
          )}>
            {refreshSuccess ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <RefreshCw 
                className={cn(
                  'w-5 h-5 transition-transform duration-200',
                  isRefreshing && 'animate-spin'
                )}
                style={{
                  transform: `rotate(${progress * 3.6}deg)`
                }}
              />
            )}
          </div>
          
          <div className="text-xs font-medium text-gray-600">
            {refreshSuccess 
              ? 'Refreshed!' 
              : isRefreshing 
                ? 'Refreshing...' 
                : shouldTrigger 
                  ? 'Release to refresh' 
                  : 'Pull to refresh'
            }
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        className={cn(
          'transition-transform duration-200',
          isPulling && 'transform-gpu'
        )}
        style={{
          transform: `translateY(${isPulling ? pullDistance * 0.3 : 0}px)`
        }}
      >
        {children}
      </div>

      {/* Progress bar */}
      {isPulling && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default MobilePullToRefresh;
