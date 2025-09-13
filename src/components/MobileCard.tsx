import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  gradient?: boolean;
  interactive?: boolean;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  border = true,
  gradient = false,
  interactive = false
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-lg',
    lg: 'shadow-2xl'
  };

  const baseClasses = 'rounded-2xl transition-all duration-300';
  
  const gradientClasses = gradient 
    ? 'bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm' 
    : 'bg-white/80 backdrop-blur-sm';

  const borderClasses = border ? 'border border-white/20' : '';

  const interactiveClasses = interactive 
    ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer active:scale-95' 
    : '';

  return (
    <Card className={cn(
      baseClasses,
      gradientClasses,
      borderClasses,
      shadowClasses[shadow],
      interactiveClasses,
      paddingClasses[padding],
      className
    )}>
      {children}
    </Card>
  );
};

interface MobileCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileCardHeader: React.FC<MobileCardHeaderProps> = ({
  children,
  className = ''
}) => (
  <CardHeader className={cn('pb-3', className)}>
    {children}
  </CardHeader>
);

interface MobileCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileCardContent: React.FC<MobileCardContentProps> = ({
  children,
  className = ''
}) => (
  <CardContent className={cn('pt-0', className)}>
    {children}
  </CardContent>
);

interface MobileCardTitleProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MobileCardTitle: React.FC<MobileCardTitleProps> = ({
  children,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <CardTitle className={cn(
      'font-bold text-gray-900',
      sizeClasses[size],
      className
    )}>
      {children}
    </CardTitle>
  );
};

interface MobileCardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileCardDescription: React.FC<MobileCardDescriptionProps> = ({
  children,
  className = ''
}) => (
  <CardDescription className={cn('text-gray-600', className)}>
    {children}
  </CardDescription>
);

export default MobileCard;
