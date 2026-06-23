# Arden Wood

Handcrafted solid European oak furniture.

## Features

- **Size Configurator**: Custom dimensions for tables with real-time price updates.
- **Wishlist**: Save your favorite pieces (logged-in users).
- **Product Comparison**: Side-by-side comparison of up to 3 products.
- **Wood Grain Parallax**: Subtle parallax effect on the hero section.
- **Made to Order**: Animated badges and production countdowns.
- **Live Exchange Rates**: Automatic EUR/CZK rate updates every 6 hours.
- **Multi-language**: Auto-detection and 10 supported languages.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (Auth, Database, RLS)
- **Payment**: Stripe
- **SMS**: Twilio
- **Rate Limiting**: Upstash Ratelimit & Vercel KV
- **Deployment**: Vercel

## Setup

1.  **Supabase Setup**:
    - Run migrations in `supabase/migrations/`.
    - Enable Phone Auth in Supabase Dashboard.
    - Set up RLS policies (included in migrations).
2.  **Twilio Setup**:
    - Obtain SID, Token, and Phone Number.
    - Create a Verify Service and get its SID.
3.  **Stripe Setup**:
    - Get publishable and secret keys.
    - Set up a webhook pointing to `/api/checkout/webhook`.
4.  **Environment Variables**:
    - Copy `.env.example` to `.env.local` and fill in the values.
5.  **Installation**:
    ```bash
    npm install
    npm run dev
    ```

## Admin Setup

To create an admin user, run this SQL in your Supabase dashboard:
```sql
UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID';
```

## Deployment

Deploy to Vercel and ensure all environment variables are set. The `vercel.json` handles the cron job for exchange rates.
