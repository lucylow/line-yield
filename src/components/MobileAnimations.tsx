import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface MobileFadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export const MobileFadeIn: React.FC<MobileFadeInProps> = ({
  children,
  delay = 0,
  duration = 600,
  direction = 'up',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const getTransform = () => {
    switch (direction) {
      case 'up': return 'translateY(20px)';
      case 'down': return 'translateY(-20px)';
      case 'left': return 'translateX(20px)';
      case 'right': return 'translateX(-20px)';
      default: return 'translateY(20px)';
    }
  };

  return (
    <div
      ref={elementRef}
      className={cn('transition-all ease-out', className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate(0, 0)' : getTransform(),
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

interface MobileSlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
}

export const MobileSlideIn: React.FC<MobileSlideInProps> = ({
  children,
  direction = 'left',
  delay = 0,
  duration = 500,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getInitialTransform = () => {
    switch (direction) {
      case 'left': return 'translateX(-100%)';
      case 'right': return 'translateX(100%)';
      case 'up': return 'translateY(-100%)';
      case 'down': return 'translateY(100%)';
      default: return 'translateX(-100%)';
    }
  };

  return (
    <div
      ref={elementRef}
      className={cn('overflow-hidden', className)}
    >
      <div
        className="transition-transform ease-out"
        style={{
          transform: isVisible ? 'translate(0, 0)' : getInitialTransform(),
          transitionDuration: `${duration}ms`
        }}
      >
        {children}
      </div>
    </div>
  );
};

interface MobileScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  scale?: number;
  className?: string;
}

export const MobileScaleIn: React.FC<MobileScaleInProps> = ({
  children,
  delay = 0,
  duration = 400,
  scale = 0.8,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={elementRef}
      className={cn('transition-all ease-out', className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : `scale(${scale})`,
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

interface MobileStaggerProps {
  children: React.ReactNode[];
  delay?: number;
  staggerDelay?: number;
  className?: string;
}

export const MobileStagger: React.FC<MobileStaggerProps> = ({
  children,
  delay = 0,
  staggerDelay = 100,
  className = ''
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <MobileFadeIn
          key={index}
          delay={delay + (index * staggerDelay)}
          direction="up"
        >
          {child}
        </MobileFadeIn>
      ))}
    </div>
  );
};

interface MobileBounceProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const MobileBounce: React.FC<MobileBounceProps> = ({
  children,
  delay = 0,
  duration = 600,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={elementRef}
      className={cn('transition-all ease-out', className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? 'translateY(0) scale(1)' 
          : 'translateY(20px) scale(0.9)',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      }}
    >
      {children}
    </div>
  );
};

interface MobileShakeProps {
  children: React.ReactNode;
  trigger?: boolean;
  className?: string;
}

export const MobileShake: React.FC<MobileShakeProps> = ({
  children,
  trigger = false,
  className = ''
}) => {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div
      className={cn(
        'transition-transform duration-500',
        isShaking && 'animate-shake',
        className
      )}
    >
      {children}
    </div>
  );
};

interface MobilePulseProps {
  children: React.ReactNode;
  active?: boolean;
  duration?: number;
  className?: string;
}

export const MobilePulse: React.FC<MobilePulseProps> = ({
  children,
  active = false,
  duration = 1000,
  className = ''
}) => {
  return (
    <div
      className={cn(
        'transition-all duration-300',
        active && 'animate-pulse',
        className
      )}
      style={{
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

interface MobileRippleProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export const MobileRipple: React.FC<MobileRippleProps> = ({
  children,
  onClick,
  className = ''
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    onClick?.(e);
  };

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      onClick={handleClick}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none animate-ripple"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.6)',
            transform: 'scale(0)',
            animation: 'ripple 0.6s linear'
          }}
        />
      ))}
    </div>
  );
};

export default MobileFadeIn;
