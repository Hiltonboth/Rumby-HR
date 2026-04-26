# ZivoHR Supabase Migration Guide

This project has been converted from Firebase to Supabase. To get your environment up and running, follow these steps:

## 1. Setup Supabase Project
1. Create a new project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `supabase-schema.sql` (found in this project's root) and run it. This will create your tables, triggers, and Row Level Security (RLS) policies.

## 2. Configure Environment Variables
1. Go to **Project Settings > API**.
2. Copy your **Project URL** and **anon public key**.
3. Create a `.env` file in the project root (or update your environment settings in AI Studio) with the following:
   ```env
   VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
   VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
   ```

## 3. Authentication Flow
- The app now uses Supabase Auth.
- When a user signs up, a SQL trigger automatically creates a entry in the `profiles` table.
- The `admin` who signs up through the `LoginPage` will also have a entry created in the `tenants` table to represent their company.

## 4. Key Changes in Code
- **Auth**: Replaced `firebase/auth` with `supabase.auth` in `App.tsx` and `LoginPage.tsx`.
- **Database**: Replaced `firebase/firestore` with `supabase-js` queries.
- **Client**: Initialized in `src/lib/supabase.ts`.

## 5. Next Steps
- Convert remaining components (Payroll, Hiring, etc.) to fetch from their respective Supabase tables.
- Use Supabase Storage for employee avatars instead of base64 strings if desired.
