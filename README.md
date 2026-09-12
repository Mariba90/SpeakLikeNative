# Speak Like a Native

A two-stage protected Next.js app for practicing spoken English and receiving warm, practical AI feedback. Learners first enter the shared beta password, then sign in with an approved email address. The app records from the browser microphone, calls OpenAI only from the server, and gives administrators a private usage and access dashboard.

## Run locally

1. Install Node.js 20.9 or newer.
2. Copy `.env.example` to `.env.local` and set every value.
3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

Open `http://localhost:3000`. Allow microphone access when prompted.

## Supabase setup

1. Create a Supabase project.
2. In **Project Settings → API** (or **Data API**), copy the project root URL. It should look like `https://your-project.supabase.co` — do not include `/rest/v1`.
3. Copy the Publishable key (or legacy `anon` key) into `NEXT_PUBLIC_SUPABASE_ANON_KEY`; copy the `service_role` secret into `SUPABASE_SERVICE_ROLE_KEY`.
4. In **SQL Editor**, run [supabase/schema.sql](supabase/schema.sql).
5. In the final bootstrap statement in that file, replace `admin@example.com` with your email, remove `--`, and run it. This creates the first dashboard administrator.
6. In **Authentication → URL Configuration**, set the Site URL to `https://speak-like-native.vercel.app` and add these redirect URLs:

   ```text
   https://speak-like-native.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```

Keep **Enable Data API** and **automatic RLS** enabled, and leave **Automatically expose new tables** disabled. The schema also enables RLS and grants no browser access to the two application tables; the service-role key is used only in server routes.

## Environment variables

```env
OPENAI_API_KEY=server-only-openai-key
SITE_PASSWORD=a-long-shared-password
OPENAI_BASE_URL=https://us.api.openai.com/v1
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-or-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
```

`OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must never use a `NEXT_PUBLIC_` prefix. Add all six values in Vercel under **Project Settings → Environment Variables** for Production (and Preview if wanted), then redeploy.

## Authentication and access

- The shared password remains the first gate and uses a 14-day HTTP-only signed cookie.
- Approved people receive a passwordless email sign-in link from Supabase.
- A signed-in person cannot access the app or its OpenAI routes unless their lowercase email appears in `authorized_emails`.
- Administrators can add more approved emails and assign member/admin roles from `/admin`.
- **Log out** clears both the shared-password cookie and the Supabase session.

## Deploy to Vercel

1. Import this repository into the existing Vercel project for `speak-like-native.vercel.app`.
2. Add the environment variables above.
3. Configure the Supabase redirect URL before testing a sign-in link.
4. Redeploy after each environment-variable change.

## Usage and estimated costs

Every successful practice session logs a separate transcription and coaching event in `usage_events`. The admin dashboard at `/admin` shows the last 30 days, grouped by model, along with raw token counts when OpenAI returns them. Price estimates are centralized in [lib/pricing.ts](lib/pricing.ts), so changing a model requires updating one small mapping.

The default setup uses `gpt-4o-mini-transcribe` and `gpt-5-mini`. OpenAI currently documents `gpt-4o-mini-transcribe` at $1.25 input / $5 output per million audio tokens and `gpt-5-mini` at $0.25 input / $2 output per million tokens. Actual invoices can differ from estimates due to model changes, pricing updates, cached input, and usage not represented in this app.

## Troubleshooting

- **Account sign-in is not configured**: confirm all three Supabase variables exist locally and in Vercel; a URL alone is not enough.
- **A magic link sends but returns to the sign-in page**: add the exact callback URL in Supabase Authentication URL Configuration, then request a new link.
- **“Not on the approved list”**: add the email in `/admin`, or insert it into `authorized_emails` using the SQL editor.
- **“Microphone access is needed”**: use HTTPS (Vercel does this automatically) or localhost, then allow the microphone in browser site settings.
- **“OPENAI_API_KEY is not configured”**: add the key to `.env.local` locally or Vercel, then restart/redeploy.
- **Regional hostname error**: set `OPENAI_BASE_URL=https://us.api.openai.com/v1` in the matching Vercel environment and redeploy.
- **Upload rejected**: the app accepts WebM, MP4/M4A, MP3, WAV, and OGG files up to 10 MB.

## Future-ready structure

Authentication, Supabase clients, access checks, audio handling, model selection, pricing, usage logging, prompts, API handlers, feedback types, and UI components are separated so saved sessions, history, study modes, subscriptions, and personalized learning can be added without changing the core recording loop.
