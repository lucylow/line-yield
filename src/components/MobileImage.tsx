import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MobileImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  lazy?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const MobileImage: React.FC<MobileImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder,
  lazy = true,
  priority = false,
  sizes = '100vw',
  quality = 75,
  blurDataURL,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate responsive srcset for different screen sizes
  const generateSrcSet = (baseSrc: string) => {
    const breakpoints = [320, 375, 414, 768, 1024];
    return breakpoints
      .map(bp => `${baseSrc}?w=${bp}&q=${quality} ${bp}w`)
      .join(', ');
  };

  const defaultPlaceholder = blurDataURL || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+';

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-gray-100',
        className
      )}
      style={{ width, height }}
    >
      {/* Placeholder/Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          {placeholder ? (
            <img
              src={placeholder}
              alt=""
              className="w-full h-full object-cover opacity-50"
            />
          ) : (
            <div className="w-8 h-8 border-2 border-gray-300 border-t-emerald-600 rounded-full animate-spin"></div>
          )}
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500">Failed to load</p>
          </div>
        </div>
      )}

      {/* Main image */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          srcSet={generateSrcSet(src)}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy && !priority ? 'lazy' : 'eager'}
          decoding="async"
        />
      )}
    </div>
  );
};

interface MobileImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'portrait';
}

export const MobileImageGallery: React.FC<MobileImageGalleryProps> = ({
  images,
  className = '',
  aspectRatio = 'square'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'video': return 'aspect-video';
      case 'wide': return 'aspect-[16/9]';
      case 'portrait': return 'aspect-[3/4]';
      default: return 'aspect-square';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main image */}
      <div className={cn('relative overflow-hidden rounded-xl', getAspectRatioClass())}>
        <MobileImage
          src={images[currentIndex]?.src}
          alt={images[currentIndex]?.alt}
          className="w-full h-full"
          priority
        />
        
        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200',
                index === currentIndex 
                  ? 'border-emerald-500' 
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <MobileImage
                src={image.src}
                alt={image.alt}
                className="w-full h-full"
                lazy
              />
            </button>
          ))}
        </div>
      )}

      {/* Caption */}
      {images[currentIndex]?.caption && (
        <p className="text-sm text-gray-600 text-center">
          {images[currentIndex].caption}
        </p>
      )}
    </div>
  );
};

interface MobileAvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export const MobileAvatar: React.FC<MobileAvatarProps> = ({
  src,
  alt,
  size = 'md',
  fallback,
  className = ''
}) => {
  const [hasError, setHasError] = useState(false);

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8';
      case 'md': return 'w-12 h-12';
      case 'lg': return 'w-16 h-16';
      case 'xl': return 'w-20 h-20';
      default: return 'w-12 h-12';
    }
  };

  const getTextSizeClass = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'md': return 'text-sm';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return 'text-sm';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn(
      'relative rounded-full overflow-hidden bg-gray-100 flex items-center justify-center',
      getSizeClass(),
      className
    )}>
      {src && !hasError ? (
        <MobileImage
          src={src}
          alt={alt}
          className="w-full h-full"
          onError={() => setHasError(true)}
          priority
        />
      ) : (
        <div className={cn(
          'w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-semibold',
          getTextSizeClass()
        )}>
          {fallback || getInitials(alt)}
        </div>
      )}
    </div>
  );
};

export default MobileImage;
