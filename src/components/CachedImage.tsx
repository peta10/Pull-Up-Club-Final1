import React, { useState, useEffect } from 'react';
import CacheManager, { CACHE_EXPIRY } from '../utils/cacheManager';

interface CachedImageProps {
  uri: string;
  style?: string;
  alt?: string;
  cacheKey: string;
  placeholder?: React.ReactNode;
}

// Example usage:
// <CachedImage uri="/badge1.png" cacheKey="badge_1" style="h-16 w-16" alt="Badge" />

const CachedImage: React.FC<CachedImageProps> = ({ uri, style, alt, cacheKey, placeholder }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cachedUri, setCachedUri] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);
    (async () => {
      try {
        const cached = await CacheManager.getCache(cacheKey);
        if (cached && typeof cached === 'string') {
          if (isMounted) {
            setCachedUri(cached);
            setLoading(false);
          }
          return;
        }
        // Verify image loads
        const img = new window.Image();
        img.src = uri;
        img.onload = () => {
          if (isMounted) {
            setCachedUri(uri);
            setLoading(false);
          }
          CacheManager.setCache(cacheKey, uri, CACHE_EXPIRY.badges);
        };
        img.onerror = () => {
          if (isMounted) {
            setError(true);
            setLoading(false);
          }
        };
      } catch (err) {
        console.log('CachedImage error', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [uri, cacheKey]);

  if (loading) {
    return (
      <>{placeholder || <div>Loading...</div>}</>
    );
  }
  if (error) {
    return (
      <>{placeholder || <div>Image unavailable</div>}</>
    );
  }
  return (
    <img
      src={cachedUri || uri}
      className={style}
      alt={alt || 'Cached image'}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};

export default CachedImage; 