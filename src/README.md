# Pull-Up Club API Integration

This document outlines how API keys are integrated into the application and how user data flows through the system.

## Environment Variables Setup

Create a `.env` file in the project root with the following variables:

```
VITE_SUPABASE_URL=https://yoursupabaseprojectid.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
VITE_LOGO_URL=https://cdn.shopify.com/s/files/1/0567/5237/3945/files/png_bb_logo.png?v=1746303427

# Optional
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

For Supabase Edge Functions, the following environment variables need to be set in your Supabase project:

- `SUPABASE_URL` (automatically set)
- `SUPABASE_ANON_KEY` (automatically set)
- `SUPABASE_SERVICE_ROLE_KEY` (automatically set)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `APP_URL` (your frontend URL, e.g., "https://pullupclub.com")

## User Authentication Flow

1. Users sign up using email/password via Supabase Auth
2. On successful signup, a profile record is created via the `auth-trigger` Edge Function
3. Users can then subscribe via Stripe Checkout
4. Once subscribed, they can submit video URLs for review

## Database Schema Overview

The database is designed to handle 100,000+ users efficiently:

- `auth.users` - Managed by Supabase Auth
- `profiles` - User profile information, linked to auth.users
- `submissions` - Video URL submissions with status (pending, approved, rejected)
- `subscriptions` - Stripe subscription data
- `admin_roles` - Defines which users have admin privileges

## Optimizations for Scale

1. **Indexing**: Key columns are indexed to ensure fast queries even with large datasets
2. **Materialized Views**: Used for complex queries like leaderboards
3. **RLS Policies**: Optimized to prevent performance bottlenecks
4. **Edge Functions**: Used for background processing tasks to avoid blocking operations

## Video Submission System

The application uses URL-based video submission rather than direct uploads:

1. Users upload their videos to YouTube, TikTok, or Instagram
2. They submit the URL through the application
3. URLs are validated and stored in the database
4. Admins review the submissions through the admin dashboard
5. Approved submissions appear on the leaderboard

This approach provides several benefits:
- Reduced storage costs
- Better scalability
- Leverages existing video platforms' infrastructure
- Easier for users to share their achievements

## Admin Review Process

Admins can:
1. See all pending submissions in the admin dashboard
2. Watch videos directly in the interface
3. Approve submissions (setting the verified pull-up count)
4. Reject submissions with feedback notes
5. Manage user accounts and assign admin privileges

## Security Considerations

The system implements several security measures:

1. Row Level Security (RLS) on all database tables
2. SECURITY DEFINER functions for sensitive operations
3. Separate user and admin privileges
4. Authentication required for all sensitive actions
5. Input validation on all form submissions
6. CORS protection on all Edge Functions

## Troubleshooting

If you experience issues with the API connections:

1. Verify all environment variables are correctly set
2. Check network requests in browser dev tools
3. Review Supabase logs for any Edge Function errors
4. Ensure Stripe webhooks are properly configured
5. Verify RLS policies are not blocking legitimate requests