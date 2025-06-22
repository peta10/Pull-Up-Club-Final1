# Codebase Optimization Guide for 100,000+ Users

## 🔒 Cybersecurity Optimizations

### 1. Authentication & Authorization Hardening

```typescript
// lib/auth-security.ts
export const authSecurityConfig = {
  // Implement session management with secure settings
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  // Rate limiting for auth endpoints
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
  },
  
  // Password policies
  passwordPolicy: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  }
};

// Implement 2FA for admin accounts
export const setupTwoFactor = async (userId: string) => {
  // Generate TOTP secret and QR code
  // Store in secure manner
};
```

### 2. Input Validation & Sanitization

```typescript
// lib/validation.ts
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

export const videoSubmissionSchema = z.object({
  videoUrl: z.string().url().refine((url) => {
    const allowedDomains = ['youtube.com', 'youtu.be', 'vimeo.com'];
    return allowedDomains.some(domain => url.includes(domain));
  }, 'Invalid video platform'),
  pullUpCount: z.number().min(1).max(1000),
  notes: z.string().max(500).transform(sanitizeInput),
});

// Apply validation to all API routes
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      return res.status(400).json({ error: 'Invalid input' });
    }
  };
};
```

### 3. Security Headers & CSRF Protection

```typescript
// next.config.mjs - Enhanced security configuration
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.stripe.com; frame-src https://js.stripe.com;"
          }
        ]
      }
    ];
  },
  
  // Enable compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Bundle analyzer for production builds
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };
    
    return config;
  },
};
```

## ⚡ Performance Optimizations

### 1. Database Query Optimization

```sql
-- Essential indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_submissions_user_status 
ON submissions(user_id, status) WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_submissions_approved_at 
ON submissions(approved_at DESC) WHERE status = 'approved';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_organisation 
ON profiles(organisation) WHERE organisation IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_badges_user_id 
ON user_badges(user_id, assigned_at DESC);

-- Materialized view for leaderboard performance
CREATE MATERIALIZED VIEW leaderboard_view AS
SELECT 
  p.id,
  p.full_name,
  p.organisation,
  p.gender,
  s.actual_pull_up_count,
  s.approved_at,
  RANK() OVER (ORDER BY s.actual_pull_up_count DESC, s.approved_at ASC) as rank
FROM profiles p
JOIN submissions s ON p.id = s.user_id
WHERE s.status = 'approved'
AND s.approved_at = (
  SELECT MAX(approved_at) 
  FROM submissions s2 
  WHERE s2.user_id = p.id AND s2.status = 'approved'
);

-- Auto-refresh materialized view
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_view;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_leaderboard_trigger
AFTER INSERT OR UPDATE OR DELETE ON submissions
FOR EACH STATEMENT EXECUTE FUNCTION refresh_leaderboard();
```

### 2. Frontend Performance Optimizations

```typescript
// components/optimized/LazyLeaderboard.tsx
import { memo, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

const LeaderboardRow = memo(({ user, index }: { user: any; index: number }) => (
  <div className="flex items-center gap-4 p-4 border-b">
    <span className="font-bold text-lg">#{index + 1}</span>
    <span className="flex-1">{user.full_name}</span>
    <span className="text-green-500 font-semibold">{user.actual_pull_up_count}</span>
  </div>
));

export const OptimizedLeaderboard = memo(({ data }: { data: any[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualRow.size,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <LeaderboardRow
              user={data[virtualRow.index]}
              index={virtualRow.index}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
```

### 3. Advanced Caching Strategy

```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export class CacheManager {
  private static instance: CacheManager;
  
  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}

// Usage in API routes
export const getCachedLeaderboard = async (filters: any) => {
  const cache = CacheManager.getInstance();
  const cacheKey = `leaderboard:${JSON.stringify(filters)}`;
  
  let data = await cache.get(cacheKey);
  if (!data) {
    data = await fetchLeaderboardFromDB(filters);
    await cache.set(cacheKey, data, 300); // 5 minutes
  }
  
  return data;
};
```

### 4. Image and Asset Optimization

```typescript
// components/OptimizedImage.tsx
import Image from 'next/image';
import { useState } from 'react';

export const OptimizedImage = ({ src, alt, ...props }: any) => {
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div className="relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        onLoadingComplete={() => setIsLoading(false)}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVR..."
        quality={75}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        {...props}
      />
    </div>
  );
};
```

## 🚀 Scalability Optimizations

### 1. Connection Pooling

```typescript
// lib/supabase-optimized.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'pull-up-club@1.0.0',
    },
  },
  // Optimize for high-traffic scenarios
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Connection pooling for server-side operations
export const createServerClient = () => {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      // Optimize connection pooling
      db: {
        pooler: {
          mode: 'transaction',
          max: 20,
          min: 5,
          acquireTimeoutMillis: 30000,
          idleTimeoutMillis: 300000,
        },
      },
    }
  );
};
```

### 2. Edge Functions Optimization

```typescript
// supabase/functions/optimized-leaderboard/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Implement response caching
const responseCache = new Map();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const cacheKey = url.searchParams.toString();
    
    // Check cache first
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Optimized query with proper indexing
    const { data, error } = await supabase
      .from('leaderboard_view')
      .select('*')
      .order('rank')
      .limit(100);

    if (error) throw error;

    // Cache the response
    responseCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

### 3. Rate Limiting & DDoS Protection

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map();

export function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const now = Date.now();
  const windowSize = 60 * 1000; // 1 minute
  const maxRequests = 100; // 100 requests per minute

  // Clean old entries
  for (const [key, data] of rateLimit.entries()) {
    if (now - data.resetTime > windowSize) {
      rateLimit.delete(key);
    }
  }

  const current = rateLimit.get(ip) || { count: 0, resetTime: now };

  if (now - current.resetTime > windowSize) {
    current.count = 1;
    current.resetTime = now;
  } else {
    current.count++;
  }

  rateLimit.set(ip, current);

  if (current.count > maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## 📊 Monitoring & Analytics

### 1. Performance Monitoring

```typescript
// lib/monitoring.ts
import { track } from '@vercel/analytics';

export const performanceMonitor = {
  trackPageLoad: (pageName: string, loadTime: number) => {
    track('page_load', {
      page: pageName,
      load_time: loadTime,
      timestamp: Date.now(),
    });
  },

  trackAPICall: (endpoint: string, duration: number, status: number) => {
    track('api_call', {
      endpoint,
      duration,
      status,
      timestamp: Date.now(),
    });
  },

  trackError: (error: Error, context: string) => {
    track('error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
    });
  },
};

// Usage in components
export const usePerformanceTracking = () => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      performanceMonitor.trackPageLoad(
        window.location.pathname,
        endTime - startTime
      );
    };
  }, []);
};
```

### 2. Real-time Monitoring Dashboard

```typescript
// pages/admin/monitoring.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    totalSubmissions: 0,
    systemLoad: 0,
    errorRate: 0,
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      // Fetch real-time metrics
      const { data: submissionsToday } = await supabase
        .from('submissions')
        .select('count', { count: 'exact' })
        .gte('submitted_at', new Date().toISOString().split('T')[0]);

      const { data: activeUsers } = await supabase
        .from('profiles')
        .select('count', { count: 'exact' })
        .gte('last_summon_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      setMetrics({
        activeUsers: activeUsers?.length || 0,
        totalSubmissions: submissionsToday?.length || 0,
        systemLoad: Math.random() * 100, // Replace with actual system metrics
        errorRate: Math.random() * 5,
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
      <MetricCard
        title="Active Users (24h)"
        value={metrics.activeUsers}
        trend="+12%"
        color="green"
      />
      <MetricCard
        title="Submissions Today"
        value={metrics.totalSubmissions}
        trend="+8%"
        color="blue"
      />
      <MetricCard
        title="System Load"
        value={`${metrics.systemLoad.toFixed(1)}%`}
        trend="-3%"
        color="yellow"
      />
      <MetricCard
        title="Error Rate"
        value={`${metrics.errorRate.toFixed(2)}%`}
        trend="-15%"
        color="red"
      />
    </div>
  );
}
```

## 🧪 Load Testing Strategy

### 1. Automated Load Testing

```yaml
# .github/workflows/load-test.yml
name: Load Testing

on:
  schedule:
    - cron: '0 2 * * 0' # Weekly on Sunday at 2 AM
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install k6
        run: |
          sudo apt-get update
          sudo apt-get install -y gpg
          curl -s https://dl.k6.io/key.gpg | sudo apt-key add -
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Run Authentication Load Test
        run: k6 run --out json=auth-results.json ./tests/load/auth-test.js

      - name: Run Leaderboard Load Test
        run: k6 run --out json=leaderboard-results.json ./tests/load/leaderboard-test.js

      - name: Run Video Submission Load Test
        run: k6 run --out json=submission-results.json ./tests/load/submission-test.js

      - name: Analyze Results
        run: |
          node ./scripts/analyze-load-test-results.js
          
      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: load-test-results
          path: ./*-results.json
```

### 2. Performance Budget

```json
{
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "500kb",
      "maximumError": "1mb"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "2kb",
      "maximumError": "4kb"
    },
    {
      "type": "anyScript",
      "maximumWarning": "120kb",
      "maximumError": "300kb"
    }
  ],
  "performance": {
    "first-contentful-paint": "< 2s",
    "largest-contentful-paint": "< 2.5s",
    "cumulative-layout-shift": "< 0.1",
    "total-blocking-time": "< 300ms"
  }
}
```

## 🔧 Deployment Optimizations

### 1. Docker Configuration

```dockerfile
# Dockerfile.production
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

### 2. CDN Configuration

```typescript
// next.config.mjs - CDN optimization
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.pullupclub.com' 
    : '',
    
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
  },
  
  // Static optimization
  trailingSlash: false,
  generateEtags: false,
  
  // Compression
  compress: true,
  
  // Bundle optimization
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
};
```

## 📋 Implementation Checklist

### Security (Priority 1)
- [ ] Implement rate limiting middleware
- [ ] Add CSRF protection
- [ ] Set up comprehensive security headers
- [ ] Enable 2FA for admin accounts
- [ ] Implement input validation on all endpoints
- [ ] Set up automated security scanning

### Performance (Priority 1)
- [ ] Add database indexes
- [ ] Implement response caching
- [ ] Optimize images and assets
- [ ] Set up CDN
- [ ] Implement virtual scrolling for large lists
- [ ] Add performance monitoring

### Scalability (Priority 2)
- [ ] Implement connection pooling
- [ ] Add horizontal scaling capabilities
- [ ] Set up auto-scaling rules
- [ ] Implement graceful degradation
- [ ] Add circuit breakers for external services

### Monitoring (Priority 2)
- [ ] Set up real-time monitoring dashboard
- [ ] Implement error tracking
- [ ] Add performance budgets
- [ ] Set up automated alerting
- [ ] Create load testing pipeline

### Testing (Priority 3)
- [ ] Create comprehensive test suite
- [ ] Set up continuous load testing
- [ ] Implement chaos engineering
- [ ] Add end-to-end testing
- [ ] Create disaster recovery procedures

This optimization plan will ensure your application can handle 100,000+ users while maintaining security, performance, and reliability. Start with Priority 1 items and gradually implement the rest based on your timeline and resources.
