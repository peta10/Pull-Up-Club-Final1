# Project Structure

```
.
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Admin/
│   │   │   └── ReviewSubmission.tsx
│   │   ├── Home/
│   │   │   ├── CTASection.tsx
│   │   │   ├── CountdownTimer.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── LeaderboardPreview.tsx
│   │   │   ├── PerksSection.tsx
│   │   │   └── TestimonialSection.tsx
│   │   ├── Layout/
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Layout.tsx
│   │   ├── Leaderboard/
│   │   │   ├── LeaderboardFilters.tsx
│   │   │   └── LeaderboardTable.tsx
│   │   ├── Profile/
│   │   │   ├── PatchProgress.tsx
│   │   │   ├── RankingsTab.tsx
│   │   │   ├── SubmissionDashboard.tsx
│   │   │   └── SubscriptionStatus.tsx
│   │   ├── Stripe/
│   │   │   └── StripePaymentForm.tsx
│   │   ├── Submission/
│   │   │   ├── CompetitionRules.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── SubmissionForm.tsx
│   │   │   └── VideoSubmissionForm.tsx
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       └── Link.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── data/
│   │   └── mockData.ts
│   ├── lib/
│   │   └── stripe.ts
│   ├── pages/
│   │   ├── AdminDashboardPage.tsx
│   │   ├── AdminPage.tsx
│   │   ├── CookiesPolicyPage.tsx
│   │   ├── CreateAccountPage.tsx
│   │   ├── FAQPage.tsx
│   │   ├── Home.tsx
│   │   ├── LeaderboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── PrivacyPolicyPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── RulesPage.tsx
│   │   ├── SubmissionPage.tsx
│   │   ├── SuccessPage.tsx
│   │   └── VideoSubmissionPage.tsx
│   ├── styles/
│   │   └── index.css
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── functions/
│   └── migrations/
│       └── 20250522043744_summer_ocean.sql
├── stripe/
│   ├── apis/
│   ├── functions/
│   ├── migrations/
│   └── sql/
├── .env
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```