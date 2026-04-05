import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const isExternalLink = (href) => typeof href === 'string' && /^https?:\/\//i.test(href);

const PromoBanner = ({
  items = [],
  autoplayMs = 5000,
  className,
  aspectClassName = 'aspect-[16/10]',
  imageFit = 'cover',
}) => {
  const banners = useMemo(() => (Array.isArray(items) ? items.filter(Boolean) : []), [items]);
  const [index, setIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const safeIndex = banners.length ? Math.min(index, banners.length - 1) : 0;

  useEffect(() => {
    setImageError(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (isPaused) return;
    if (!banners.length || banners.length === 1) return;

    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, autoplayMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoplayMs, banners.length, isPaused]);

  if (!banners.length) return null;

  const current = banners[safeIndex];
  const href = current?.link || '';
  const ctaText = current?.ctaText || 'Quero saber mais';
  const title = current?.title || '';
  const subtitle = current?.subtitle || '';
  const price = current?.price || '';
  const image = current?.image || '';

  const imageClassName =
    imageFit === 'contain'
      ? 'absolute inset-0 h-full w-full object-contain'
      : 'absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]';

  const imageFilterClassName = 'brightness-110 contrast-105 saturate-105';

  const CardWrapper = ({ children }) => {
    if (!href) return <div className="block">{children}</div>;

    if (isExternalLink(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block">
          {children}
        </a>
      );
    }

    return (
      <Link to={href} className="block">
        {children}
      </Link>
    );
  };

  return (
    <div className={cn('w-full', className)}>
      <CardWrapper>
        <div
          className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-shadow"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className={cn('relative w-full bg-gray-100 overflow-hidden', aspectClassName)}>
            {image && !imageError ? (
              <img
                src={image}
                alt={title || 'Oferta'}
                className={cn(imageClassName, imageFilterClassName)}
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-4">
              {title && (
                <div className="inline-flex items-center rounded-full bg-white/15 backdrop-blur px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-white/25">
                  {title}
                </div>
              )}

              {subtitle && (
                <div className="mt-2 text-white font-semibold text-sm leading-snug drop-shadow-sm">
                  {subtitle}
                </div>
              )}

              {price && (
                <div className="mt-2 text-white font-bold text-lg leading-snug drop-shadow-sm">
                  {price}
                </div>
              )}

              <div className="mt-3">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {ctaText}
                </Button>
              </div>
            </div>
          </div>

          {banners.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 py-3">
              {banners.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition-colors',
                    i === safeIndex ? 'bg-[#0d5a7a]' : 'bg-gray-300'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </CardWrapper>
    </div>
  );
};

export default PromoBanner;
