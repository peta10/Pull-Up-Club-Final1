# Lighthouse Performance Optimization Plan

## 🚨 Critical Issues (Fix Immediately)

### 1. **Massive LCP Issues on Mobile Home Page (8.8s)**

**Problem**: Largest Contentful Paint takes 8.8 seconds on mobile
**Root Cause**: Hero image (`/NewWebp-Pics/pullup_header.webp`) is 401.6 KiB and not preloaded

**Immediate Fixes**:

```html
<!-- Add to <head> section -->
<link rel="preload" as="image" href="/NewWebp-Pics/pullup_header.webp" fetchpriority="high">
<link rel="preconnect" href="https://images.pexels.com">
<link rel="preconnect" href="https://js.stripe.com">
<link rel="preconnect" href="https://r.stripe.com">
```

```jsx
// Optimize hero image component
const HeroImage = () => (
  <picture>
    {/* Mobile-optimized version */}
    <source 
      media="(max-width: 768px)" 
      srcSet="/NewWebp-Pics/pullup_header_mobile.webp"
      width="375"
      height="200"
    />
    {/* Desktop version */}
    <img 
      src="/NewWebp-Pics/pullup_header.webp" 
      alt="Athlete doing pull-ups"
      className="w-full h-full object-cover"
      loading="eager"
      fetchPriority="high"
      width="1200"
      height="600"
    />
  </picture>
);
```

### 2. **Image Optimization (Save 485 KiB)**

**Problems**:
- Hero image: 401.6 KiB → should be ~50-80 KiB for mobile
- Badge images: 95-126 KiB each → should be ~20-30 KiB
- Logo images: Multiple versions loaded

**Immediate Actions**:

```bash
# Create optimized versions
# Hero image mobile version
npx @squoosh/cli --webp '{"quality":75,"target_size":50000}' /NewWebp-Pics/pullup_header.webp

# Badge images
npx @squoosh/cli --webp '{"quality":80,"target_size":25000}' /Male-Badges/*.webp

# Create multiple sizes
npx @squoosh/cli --resize '{"width":375}' --webp '{"quality":75}' /NewWebp-Pics/pullup_header.webp
```

**Component Updates**:

```jsx
// Optimized image component
const OptimizedImage = ({ src, alt, mobile, className, ...props }) => (
  <picture>
    {mobile && (
      <source 
        media="(max-width: 768px)" 
        srcSet={`${src.replace('.webp', '_mobile.webp')}`}
      />
    )}
    <img 
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      {...props}
    />
  </picture>
);

// Badge component
const BadgeImage = ({ badge, className }) => (
  <OptimizedImage
    src={`/Male-Badges/${badge}.webp`}
    alt={badge}
    mobile={true}
    width={96}
    height={96}
    className={className}
  />
);
```

### 3. **JavaScript Bundle Size (Save 431 KiB)**

**Problem**: Main bundle is 135.3 KiB with 63.4 KiB unused code

**Code Splitting Implementation**:

```tsx
// Implement lazy loading for components
const LazyLeaderboard = lazy(() => import('./components/Leaderboard'));
const LazyVideoSubmission = lazy(() => import('./components/VideoSubmission'));

// Split vendor chunks in next.config.js
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 200000, // 200KB chunks
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            maxSize: 150000,
          },
        },
      };
    }
    return config;
  },
};
```

**Tree Shaking Optimization**:

```tsx
// Instead of importing entire libraries
import { debounce } from 'lodash';
// Use specific imports
import debounce from 'lodash/debounce';

// For Supabase, only import what you need
import { createClient } from '@supabase/supabase-js';
// Instead of importing the entire auth module
```

### 4. **Fix Layout Shift Issues**

**Problem**: Images without explicit dimensions causing CLS

**Solution**:

```tsx
// Add explicit dimensions to all images
const LogoComponent = () => (
  <img 
    src="/NewWebp-Pics/png_bb_logo.webp" 
    alt="Pull-Up Club Logo" 
    className="h-8 w-auto"
    width={120}  // Add explicit width
    height={32}  // Add explicit height
  />
);

// For the larger logo
const LargeLogoComponent = () => (
  <img 
    src="/PUClogo (1).webp" 
    alt="Pull-Up Club Logo" 
    className="h-10 w-auto mr-3"
    width={150}
    height={40}
  />
);
```

## 🔐 Security Improvements (Critical)

### 1. **Add Security Headers**

```tsx
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://r.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: https://images.pexels.com; connect-src 'self' https://*.supabase.co https://api.stripe.com https://r.stripe.com; frame-src https://js.stripe.com; font-src 'self' data:;"
          },
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
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          }
        ]
      }
    ];
  },
};
```

### 2. **Fix Third-Party Cookie Issues**

```tsx
// Replace Pexels images with local optimized versions
// Instead of:
<img src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg" />

// Use:
<img src="/optimized-avatars/mike-johnson.webp" width={40} height={40} />
```

## 🎯 Accessibility Fixes

### 1. **Fix Color Contrast Issues**

```css
/* Update color scheme for better contrast */
.text-gray-500 {
  /* Change from gray-500 (#6b7280) to gray-400 (#9ca3af) for better contrast */
  color: #9ca3af;
}

/* For dark backgrounds, use lighter text */
.bg-gray-900 .text-gray-500 {
  color: #d1d5db; /* gray-300 for better contrast */
}

/* CTA section improvements */
.bg-[#9b9b6f] .text-white {
  /* Ensure sufficient contrast - current is good */
  color: #ffffff;
}
```

### 2. **Add Missing Form Labels**

```tsx
// Fix leaderboard filters
const LeaderboardFilters = () => (
  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
    <div>
      <label htmlFor="club-filter" className="sr-only">Filter by club</label>
      <select 
        id="club-filter"
        name="club" 
        className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-white"
        aria-label="Filter leaderboard by club"
      >
        <option value="">All Clubs</option>
        {/* ... other options */}
      </select>
    </div>
    
    <div>
      <label htmlFor="region-filter" className="sr-only">Filter by region</label>
      <select 
        id="region-filter"
        name="region" 
        className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-white"
        aria-label="Filter leaderboard by region"
      >
        <option value="">All Regions</option>
        {/* ... other options */}
      </select>
    </div>
    {/* Continue for other filters */}
  </div>
);
```

### 3. **Fix Button Touch Targets**

```css
/* Ensure buttons meet 44px minimum touch target */
.btn-small {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px; /* Increase padding */
}

/* For small buttons, add more spacing */
.view-video-btn {
  padding: 10px 16px;
  min-height: 44px;
}
```

### 4. **Fix Heading Structure**

```tsx
// Current structure issue: h3 appears before h2
// Fix the heading hierarchy
const LeaderboardPage = () => (
  <div>
    <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
    <p className="mt-2 text-gray-400 max-w-2xl mx-auto">
      See how you stack up against the competition...
    </p>
    
    {/* Change from h3 to h2 */}
    <h2 className="text-white text-lg font-medium">Badge Legend</h2>
    
    {/* If you need subsections, use h3 after h2 */}
    <h3 className="text-white text-md font-medium">Filter Options</h3>
  </div>
);
```

## 📱 Performance Optimizations

### 1. **Implement Lazy Loading**

```tsx
// Defer offscreen images
const LazyImage = ({ src, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  );
};
```

### 2. **Optimize Third-Party Scripts**

```tsx
// Defer Stripe loading until needed
const useStripe = () => {
  const [stripeLoaded, setStripeLoaded] = useState(false);

  const loadStripe = useCallback(async () => {
    if (!stripeLoaded) {
      const stripe = await import('@stripe/stripe-js');
      setStripeLoaded(true);
      return stripe;
    }
  }, [stripeLoaded]);

  return { loadStripe, stripeLoaded };
};

// Use dynamic imports for Stripe
const SubscriptionPage = () => {
  const [showPayment, setShowPayment] = useState(false);
  const { loadStripe } = useStripe();

  const handleSubscribe = async () => {
    await loadStripe(); // Only load when needed
    setShowPayment(true);
  };

  return (
    <div>
      <button onClick={handleSubscribe}>Subscribe Now</button>
      {showPayment && <StripeCheckout />}
    </div>
  );
};
```

### 3. **Add Caching Headers**

```tsx
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/NewWebp-Pics/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/Male-Badges/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

## 🔍 SEO Improvements

### 1. **Add Missing Meta Descriptions**

```tsx
// pages/leaderboard.tsx
export default function LeaderboardPage() {
  return (
    <>
      <Head>
        <title>Pull-Up Challenge Leaderboard | Pull-Up Club</title>
        <meta 
          name="description" 
          content="See how you rank in the Pull-Up Club challenge. View top performers, filter by region, club, and achievement level. Join the competition today!" 
        />
        <meta name="keywords" content="pull-up leaderboard, fitness challenge, strength competition, workout rankings" />
        <meta property="og:title" content="Pull-Up Challenge Leaderboard" />
        <meta property="og:description" content="See how you rank in the Pull-Up Club challenge. View top performers and join the competition!" />
        <meta property="og:type" content="website" />
      </Head>
      {/* ... page content */}
    </>
  );
}
```

### 2. **Structured Data**

```tsx
// Add JSON-LD structured data
const LeaderboardStructuredData = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Pull-Up Challenge Leaderboard",
        "description": "View rankings and compete in pull-up challenges",
        "url": "https://pullupclub.com/leaderboard",
        "mainEntity": {
          "@type": "ItemList",
          "name": "Pull-Up Challenge Rankings",
          "description": "Current leaderboard of pull-up challenge participants"
        }
      })
    }}
  />
);
```

## 📊 Implementation Priority

### **Week 1 (Critical - Mobile Performance)**
1. ✅ Create optimized mobile images (50-80KB each)
2. ✅ Add preload links for critical resources
3. ✅ Fix image dimensions to prevent CLS
4. ✅ Replace external Pexels images with local optimized versions

### **Week 2 (Security & Accessibility)**
1. ✅ Implement security headers
2. ✅ Fix color contrast issues
3. ✅ Add form labels and ARIA attributes
4. ✅ Fix heading structure

### **Week 3 (JavaScript Optimization)**
1. ✅ Implement code splitting
2. ✅ Add lazy loading for components
3. ✅ Optimize third-party script loading
4. ✅ Tree shake unused dependencies

### **Week 4 (SEO & Monitoring)**
1. ✅ Add meta descriptions
2. ✅ Implement structured data
3. ✅ Set up performance monitoring
4. ✅ Add caching headers

## 🎯 Expected Results

**After Optimization**:
- **Mobile Home Page**: 58 → 85+ Performance Score
- **Mobile LCP**: 8.8s → under 2.5s
- **Bundle Size**: -431 KiB reduction
- **Image Savings**: -485 KiB
- **Security Score**: 78 → 95+
- **Accessibility**: 91 → 98+

**Key Metrics Targets**:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Total Blocking Time: < 150ms
- Cumulative Layout Shift: < 0.1

This optimization plan will significantly improve your site's performance and user experience, especially on mobile devices where you're seeing the biggest issues.
