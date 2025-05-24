# Load Testing for Pull-Up Club

This document outlines the approach for load testing the Pull-Up Club application to ensure it can handle the target scale of 100,000 users.

## Objectives

- Verify the application can handle expected peak loads
- Identify performance bottlenecks before they impact users
- Establish performance baselines for monitoring
- Ensure database queries remain performant at scale
- Validate Supabase Edge Functions can handle concurrent requests

## Load Testing Tools

We'll use the following tools for our load testing strategy:

1. **k6** - For HTTP endpoint testing
2. **Artillery** - For scenario-based testing
3. **pgbench** - For database-specific load testing
4. **Supabase Observer** - For monitoring during tests

## Key Scenarios to Test

### 1. User Authentication Flow

```js
// k6 script for authentication load test
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 }, // Ramp up to 50 users
    { duration: '3m', target: 50 }, // Stay at 50 users
    { duration: '1m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '1m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

export default function () {
  const url = 'https://[your-supabase-project].supabase.co/auth/v1/token?grant_type=password';
  const payload = JSON.stringify({
    email: `user${__VU}@example.com`,
    password: 'testPassword123!',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'apikey': '[your-anon-key]',
    },
  };

  const res = http.post(url, payload, params);
  
  check(res, {
    'login successful': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

### 2. Leaderboard Access

```js
// k6 script for leaderboard load test
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: '1s', // 100 iterations per second
      duration: '1m',
      preAllocatedVUs: 100, // how many VUs to pre-allocate
      maxVUs: 200, // max VUs to use if needed
    },
  },
};

export default function () {
  const url = 'https://[your-api-url]/leaderboard';
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'apikey': '[your-anon-key]',
    },
  };

  const res = http.get(url, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(Math.random() * 3);
}
```

### 3. Video Submission Process

```js
// Artillery script for video submission (excerpt)
{
  "config": {
    "target": "https://[your-api-url]",
    "phases": [
      { "duration": 60, "arrivalRate": 5 },
      { "duration": 120, "arrivalRate": 10 },
      { "duration": 180, "arrivalRate": 20 }
    ],
    "defaults": {
      "headers": {
        "Content-Type": "application/json",
        "Authorization": "Bearer {{ $processEnvironment.TEST_AUTH_TOKEN }}"
      }
    }
  },
  "scenarios": [
    {
      "flow": [
        {
          "post": {
            "url": "/video-submission",
            "json": {
              "videoUrl": "https://www.youtube.com/watch?v=testVideo{{ $randomNumber(1, 1000) }}",
              "pullUpCount": "{{ $randomNumber(5, 50) }}",
              "notes": "Load test submission"
            }
          }
        }
      ]
    }
  ]
}
```

### 4. Stripe Checkout Creation

```js
// k6 script for Stripe checkout test
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '3m',
};

export default function () {
  const url = 'https://[your-api-url]/create-checkout';
  
  const payload = JSON.stringify({
    priceId: 'price_test123',
    successUrl: 'https://pullupclub.com/success',
    cancelUrl: 'https://pullupclub.com/cancel',
    customerEmail: `test${__VU}@example.com`,
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`,
    },
  };

  const res = http.post(url, payload, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has checkout URL': (r) => JSON.parse(r.body).url !== undefined,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(3);
}
```

## Database Load Testing

```bash
# pgbench script for database load testing
pgbench -h [host] -p [port] -U [user] -d [database] -c 50 -j 4 -T 60 -P 10 -f ./custom_queries.sql
```

Example `custom_queries.sql`:
```sql
\set user_id random(1, 100000)

-- Leaderboard query
SELECT * FROM leaderboard_view 
WHERE gender = CASE WHEN :user_id % 2 = 0 THEN 'male' ELSE 'female' END
ORDER BY actual_pull_up_count DESC 
LIMIT 100;

-- User profile query
SELECT * FROM profiles WHERE id = :user_id;

-- Submissions query
SELECT * FROM submissions 
WHERE user_id = :user_id 
ORDER BY submitted_at DESC 
LIMIT 10;
```

## Test Execution Plan

1. **Baseline Testing:**
   - Run tests with minimal load to establish baseline performance
   - Record baseline metrics for comparison

2. **Component Testing:**
   - Test individual APIs/functions in isolation
   - Identify component-specific bottlenecks

3. **Scaled Testing:**
   - Gradually increase load to simulate growing user base
   - Test with 1,000 users, then 10,000, then 50,000

4. **Peak Load Testing:**
   - Simulate maximum expected concurrent users (2-5% of total user base)
   - Maintain peak load for extended period (15-30 minutes)

5. **Stress Testing:**
   - Push beyond expected load to find breaking points
   - Identify failure modes and recovery capabilities

## Key Metrics to Monitor

- **Response Time:** Average, median, 95th percentile
- **Throughput:** Requests per second
- **Error Rate:** Percentage of failed requests
- **Database Performance:** Query execution time, connection pool usage
- **Resource Utilization:** CPU, memory, network I/O
- **Supabase Limits:** Edge function invocations, database connections

## Load Test Environments

- **Staging:** Full-scale tests in an environment identical to production
- **Production Simulation:** Use production-like data volumes with anonymized data
- **Isolated Testing:** For components that can be tested in isolation

## Reporting

After each test run, generate a report including:

1. Test configuration and parameters
2. Performance metrics with visualizations
3. Identified bottlenecks and recommendations
4. Comparison to previous test runs and baselines

## Remediation Strategies

Based on test results, implement improvements such as:

- Database query optimization (indexing, denormalization)
- Edge function code optimization
- Caching strategies (Redis, CDN)
- Connection pooling adjustments
- Database scaling (increased resources)
- Architectural changes if needed

## Automated Testing Pipeline

Integrate load testing into CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
name: Load Testing

on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sundays

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install k6
        run: |
          curl -L https://github.com/loadimpact/k6/releases/download/v0.39.0/k6-v0.39.0-linux-amd64.tar.gz | tar xzf -
          sudo cp k6-v0.39.0-linux-amd64/k6 /usr/local/bin
      - name: Run Load Tests
        run: k6 run ./load-tests/auth-flow.js
      - name: Archive test results
        uses: actions/upload-artifact@v3
        with:
          name: load-test-results
          path: ./results
```

## Conclusion

Regular load testing is essential to ensure the Pull-Up Club application can scale reliably to 100,000 users. By following this comprehensive testing approach, we can identify and address performance issues before they impact users, and ensure a smooth experience even during peak usage periods. 