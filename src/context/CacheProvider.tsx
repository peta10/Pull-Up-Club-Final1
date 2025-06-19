import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import CacheManager from '../utils/cacheManager';

interface CacheContextType {
  clearAllCaches: () => Promise<void>;
  getCacheSize: () => Promise<number>;
  getCacheInfo: () => Promise<{ size: number; keys: string[] }>;
  cacheInfo: { size: number; keys: string[] } | null;
  refreshCacheInfo: () => Promise<void>;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

export const CacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cacheInfo, setCacheInfo] = useState<{ size: number; keys: string[] } | null>(null);

  const getCacheInfo = async () => {
    const info = await CacheManager.getCacheInfo();
    return info;
  };

  const getCacheSize = async () => {
    const info = await getCacheInfo();
    return info.size;
  };

  const refreshCacheInfo = async () => {
    const info = await getCacheInfo();
    setCacheInfo(info);
  };

  const clearAllCaches = async () => {
    await CacheManager.clearAllCaches();
    await refreshCacheInfo();
  };

  useEffect(() => {
    refreshCacheInfo();
  }, []);

  const value: CacheContextType = {
    clearAllCaches,
    getCacheSize,
    getCacheInfo,
    cacheInfo,
    refreshCacheInfo,
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
      {process.env.NODE_ENV === 'development' && cacheInfo && (
        <div style={{ position: 'fixed', bottom: 10, right: 10, background: '#222', color: '#fff', padding: 8, borderRadius: 4, zIndex: 9999 }}>
          <div>Cache: {(cacheInfo.size / 1024).toFixed(2)} KB / {cacheInfo.keys.length} keys</div>
          <button onClick={clearAllCaches} style={{ marginTop: 4, background: '#444', color: '#fff', border: 'none', borderRadius: 2, padding: '2px 8px', cursor: 'pointer' }}>Clear Cache</button>
        </div>
      )}
    </CacheContext.Provider>
  );
};

export function useCache() {
  const ctx = useContext(CacheContext);
  if (!ctx) throw new Error('useCache must be used within a CacheProvider');
  return ctx;
} 