# Pull-Up Club MVP

This project is a web application for the Pull-Up Club, allowing users to sign up, subscribe to a monthly plan, submit videos of their pull-up workouts, and compete on a leaderboard.

## Project Status

This project is currently under active development with most core functionality implemented. Key features include:

- ✅ **User Authentication**: Email/password signup and login with Supabase Auth
- ✅ **Profile Management**: User profiles with personal details and subscription status
- ✅ **Stripe Integration**: $9.99/month subscription with secure payment processing
- ✅ **Video Submission**: Support for YouTube, TikTok, and Instagram video URLs
- ✅ **Admin Dashboard**: Review and manage submissions, user management
- ✅ **Leaderboard System**: Dynamic leaderboard with filtering capabilities
- ✅ **Badge System**: Achievement tracking with progress indicators
- ✅ **Email Notifications**: Comprehensive email system using Resend API

## Tech Stack

*   **Frontend:** Vite, React, TypeScript, Tailwind CSS
*   **Backend:** Supabase (PostgreSQL Database, Auth, Edge Functions, Storage)
*   **Payments:** Stripe
*   **Email:** Resend API
*   **Key Dependencies:**
    *   `@supabase/supabase-js`
    *   `@supabase/auth-ui-react`
    *   `@stripe/stripe-js`
    *   `react-router-dom`
    *   `lucide-react` (for icons)
    *   `date-fns` (for date utilities)

## Project Structure

```
.
├── public/                   # Static assets (images, etc.)
├── src/                      # Frontend source code
│   ├── components/           # Reusable React components
│   ├── context/              # React context providers (e.g., AuthContext)
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Libraries and helper functions (e.g., supabase.ts, stripe.ts)
│   ├── pages/                # Page-level components (routed)
│   │   ├── Admin/            # Admin dashboard pages
│   │   ├── Home/             # Home page components
│   │   ├── Leaderboard/      # Leaderboard components
│   │   ├── Profile/          # User profile components
│   │   └── ...               # Other page components
│   ├── services/             # API service integrations
│   ├── styles/               # Global styles, CSS
│   ├── types/                # TypeScript type definitions
│   ├── App.tsx               # Main application component, routing setup
│   └── main.tsx              # Application entry point
├── supabase/
│   ├── functions/            # Supabase Edge Functions source code
│   │   ├── admin-delete-user/  # User management function
│   │   ├── admin-leaderboard/  # Leaderboard management
│   │   ├── admin-submissions/  # Submission review
│   │   ├── auth-trigger/       # Handles new user profile creation
│   │   ├── badge-analytics/    # Badge achievement analytics
│   │   ├── billing-reminders/  # Sends subscription billing reminders
│   │   ├── check-submission-eligibility/ # Validates submission eligibility
│   │   ├── create-checkout/    # Creates Stripe checkout sessions
│   │   ├── customer-portal/    # Creates Stripe customer portal sessions
│   │   ├── get-stripe-products/ # Fetches product/price info from Stripe
│   │   ├── resend-email/       # Email resend functionality
│   │   ├── resend-webhook/     # Handles Resend API webhooks
│   │   ├── send-email/         # Email sending functionality
│   │   ├── stripe-webhooks/    # Handles incoming Stripe webhooks
│   │   ├── subscription-status/ # Checks user's current subscription status
│   │   ├── summon-flow/        # Sends workout summons to subscribers
│   │   ├── system-monitor/     # System health monitoring
│   │   ├── video-submission/   # Processes video submissions
│   │   ├── video-upload/       # Handles video URL validation
│   │   └── welcome-flow/       # Sends welcome messages to new subscribers
│   ├── migrations/           # Database schema migrations (SQL)
│   └── storage-policies/     # Storage access policies (JSON or SQL)
├── stripe/                   # Stripe-specific configurations
├── docs/                     # Project documentation
├── .env                      # Environment variables for frontend (VITE_...)
├── .gitignore
├── index.html                # Main HTML entry point for Vite
├── package.json              # Project dependencies and scripts
├── postcss.config.js         # PostCSS configuration (for Tailwind)
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript compiler options (root)
├── vite.config.ts            # Vite configuration
└── README.md                 # This file
```

## Backend Overview (Supabase)

*   **Project ID:** `yqnikgupiaghgjtsaypr`
*   **Authentication:** Supabase Auth for email/password sign-up and login with JWT.
*   **Database Schema:**
    * `profiles`: User profiles with personal details and subscription status
    * `submissions`: Video submissions with approval workflow
    * `subscriptions`: Stripe subscription tracking
    * `badges`: Achievement badges with requirements
    * `user_badges`: User badge assignments
    * `messages_log`: Communication history
    * `notification_queue`: Email notification system
    * `email_events`, `email_engagement`: Email tracking system
    * Performance monitoring tables for system optimization
*   **Edge Functions:** 20+ deployed functions handling authentication, payments, notifications, and admin operations
*   **Row-Level Security (RLS):** Comprehensive security policies on all tables

## Key Features

### User Authentication & Profile Management
- Email/password authentication with Supabase Auth
- User profile creation and management
- Role-based access control (user vs admin)

### Subscription System
- Stripe integration for $9.99/month subscription
- Secure checkout process
- Subscription status tracking
- Billing reminders and notifications

### Video Submission Workflow
- Support for YouTube, TikTok, and Instagram video URLs
- 30-day cooldown between approved submissions
- Admin review process for submissions
- Notification system for submission status updates

### Leaderboard System
- Dynamic leaderboard based on verified pull-up counts
- Filtering by gender and organization
- Optimized with materialized views for performance
- Badge display integration

### Badge System
- Achievement badges based on pull-up performance
- Progress tracking toward next badge level
- Badge assignment notifications
- Analytics for badge distribution and achievements

### Admin Dashboard
- Submission review with approval/rejection workflow
- User management with role assignment
- User deletion functionality
- Leaderboard management tools

### Email Notification System
- Comprehensive email system using Resend API
- Event tracking (delivery, opens, clicks)
- Email templates for various notifications
- Analytics for email performance

### Performance Optimization
- Database indexes on frequently queried columns
- Materialized views for complex queries
- Query performance monitoring
- System metrics tracking

## Completed Items

### Frontend Connection
- ✅ Supabase client configuration
- ✅ Authentication integration with context provider
- ✅ Protected routes and role-based access
- ✅ API endpoint integration
- ✅ Home page experience with public access
- ✅ Navigation structure with conditional rendering
- ✅ Leaderboard data fetching with badge display
- ✅ User profile integration
- ✅ Stripe payment integration
- ✅ Admin dashboard for submissions and user management

### Backend Setup
- ✅ Supabase project configuration
- ✅ Authentication setup with email/password
- ✅ Database schema implementation
- ✅ Row-Level Security (RLS) policies
- ✅ Edge Functions deployment
- ✅ Database webhooks configuration
- ✅ Scheduled functions (CRON jobs)
- ✅ Database optimization
- ✅ Monitoring and logging setup
- ✅ Security verification
- ✅ Performance testing framework
- ✅ Badge system implementation
- ✅ Dependency management

## Environment Variables

### Frontend (`.env` - in project root):
*   `VITE_SUPABASE_URL`: Your Supabase project URL.
*   `VITE_SUPABASE_ANON_KEY`: Your Supabase project anonymous key.
*   `VITE_STRIPE_PUBLISHABLE_KEY_PK`: Your Stripe publishable key.
*   `VITE_GA_MEASUREMENT_ID` (Optional): Google Analytics Measurement ID.

### Backend (Supabase Edge Functions):
These must be set in the Supabase project dashboard under Settings > Environment Variables, or via a `supabase/.env` file if using the Supabase CLI for local development (ensure this file is in `.gitignore`).
*   `SUPABASE_URL`: (Usually inherited)
*   `SUPABASE_ANON_KEY`: (Usually inherited)
*   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin-level operations).
*   `STRIPE_SECRET_KEY`: Your Stripe secret key.
*   `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret for the `stripe-webhooks` function.
*   `APP_URL`: The base URL of your deployed application (e.g., `https://pullupclub.com`). Used in functions for constructing links.
*   `RESEND_API_KEY`: API key for Resend email service.
*   `RESEND_WEBHOOK_SECRET`: Webhook signing secret for Resend events.

## Getting Started

1.  **Clone the repository.**
2.  **Install dependencies:** `npm install`
3.  **Set up environment variables:**
    *   Create a `.env` file in the project root and populate it with your frontend keys (see above).
    *   Configure backend environment variables in your Supabase project settings or a local `supabase/.env` file.
4.  **Supabase Setup:**
    *   Ensure your Supabase project (`yqnikgupiaghgjtsaypr`) is running.
    *   Apply database migrations if setting up locally or if new migrations are pulled: `npx supabase db push` (if using Supabase CLI and migrations are synced locally).
    *   Deploy Edge Functions: `npx supabase functions deploy --project-ref yqnikgupiaghgjtsaypr` (or deploy individual functions).
    *   **Configure Redirect URLs for Auth:**
        * In your Supabase Dashboard, go to Authentication > URL Configuration
        * Set your Site URL to `https://pullupclub.netlify.app` (your production Netlify URL)
        * Add the following additional redirect URLs for development and deployment previews:
          ```
          http://localhost:3000/**
          https://**--pullupclub.netlify.app/**
          ```
        * These wildcard patterns will handle both local development and Netlify preview deployments
5.  **Set up Deno for Supabase Edge Functions:**
    *   Run `npm run setup-deno` to check Deno installation and set up the environment.
    *   Install the Deno VS Code extension if using VS Code.
    *   The project includes Deno configuration files (`deno.json`, `deno-types.d.ts`) to help with TypeScript errors.
6.  **Run the development server:** `npm run dev`

## Deployment on Netlify

1. **Connect your repository to Netlify**
2. **Configure the build settings:**
   * Build command: `npm run build`
   * Publish directory: `dist`
3. **Set environment variables:**
   * `VITE_SUPABASE_URL`: Your Supabase project URL
   * `VITE_SUPABASE_ANON_KEY`: Your Supabase project anonymous key
   * `VITE_SITE_URL`: Set to your Netlify app domain (e.g., `https://pullupclub.netlify.app`)
   * `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
4. **Deploy the site**
5. **Verify authentication flows:**
   * Test sign-up, login, and password reset flows to ensure redirect URLs are working correctly

## Next Steps

*   **Testing:** Implement comprehensive unit and integration tests
*   **Real-time Features:** Add Supabase Realtime for live updates
*   **Progressive Enhancement:** Implement offline capabilities and fallback UI
*   **Accessibility & SEO:** Improve compliance and optimization
*   **Cross-Browser & Device Testing:** Verify compatibility across platforms
*   **Documentation:** Complete code and user documentation