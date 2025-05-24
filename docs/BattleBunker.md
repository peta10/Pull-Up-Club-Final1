# Pull Up Club – Full‑Stack Repository

A subscription‑based pull‑up competition platform inspired by Battle Bunker. Users pay **$9.99/mo** via Stripe, submit pull‑up videos, and compete on a public leaderboard while judges review every clip in an admin portal.

---
## Tech stack

| Layer | Tools & libraries |
|-------|------------------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling / UI | Tailwind CSS, shadcn/ui components |
| Animation | motion.dev micro‑interactions, Lenis smooth‑scroll |
| Auth & Database | Supabase Auth, Postgres with row‑level security |
| Payments | Stripe Checkout and Webhooks |
| Tooling | ESLint, Prettier, Husky, pnpm |

---
## Project tree (high‑level)

```text
.
├── README.md                ← you are here
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── .env.example             ← copy to .env.local and fill keys
├── app                      ← Next.js route segments
│   ├── layout.tsx           ← root layout (+SmoothScrollProvider)
│   ├── page.tsx             ← redirect → /(marketing)
│   ├── (marketing)
│   │   ├── Home.tsx
│   │   ├── FAQPage.tsx
│   │   ├── RulesPage.tsx
│   │   ├── PrivacyPolicyPage.tsx
│   │   ├── CookiesPolicyPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── (auth)
│   │   ├── CreateAccountPage.tsx   ← sign‑up
│   │   ├── LoginPage.tsx
│   │   └── SuccessPage.tsx         ← post‑checkout success
│   ├── (dashboard)
│   │   ├── layout.tsx
│   │   ├── page.tsx                ← UserDashboard wrapper
│   │   ├── ProfilePage.tsx
│   │   ├── SubmissionPage.tsx      ← form page 1
│   │   ├── VideoSubmissionPage.tsx ← form page 2 (upload)
│   │   └── LeaderboardPage.tsx
│   └── (admin)
│       ├── AdminDashboardPage.tsx
│       └── AdminPage.tsx           ← review queue
├── components                ← shared UI + motion wrappers
│   ├── Header.tsx / Footer.tsx
│   ├── SubmissionStepper.tsx
│   ├── LeaderboardTable.tsx
│   ├── PricingCard.tsx
│   └── …
├── lib                        ← helpers & SDK wrappers
│   ├── supabaseClient.ts
│   ├── auth.ts
│   ├── stripe.ts
│   └── validators.ts
└── public                     ← static assets (logo, favicons)
```

> Note: screenshots of the original `*.tsx` page files are in `/legacy-screens/` for reference.

---
## Quick start

1. Clone and install
   ```bash
   git clone https://github.com/your‑org/pull‑up‑club.git
   cd pull‑up‑club
   pnpm install
   ```
2. Environment variables – create `.env.local` from the template
   ```ini
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=
   ```
3. Run the development server
   ```bash
   pnpm dev
   ```
4. Database – run `supabase db push` or apply SQL in `/prisma/schema.prisma` if using Prisma.
5. Stripe webhook – start the listener
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

---
## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Launches Next.js development server |
| `pnpm build` | Creates a production build |
| `pnpm start` | Serves the compiled build |
| `pnpm lint` | Runs ESLint |
| `pnpm format` | Runs Prettier |
| `pnpm prepare` | Installs Husky Git hooks |

---
## Contributing

1. Fork the repository, create a feature branch, open a pull request.
2. Follow commit‑lint guidelines.
3. All pull requests must pass continuous integration (lint, build, type‑check).

---
## License

MIT — see the `LICENSE` file for details.
