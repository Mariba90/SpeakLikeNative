# Speak Like a Native

A password-protected Next.js app for practicing spoken English and receiving warm, practical AI feedback.

## Run locally

1. Install Node.js 20.9 or newer.
2. Copy `.env.example` to `.env.local` and set the two required values:

   ```env
   OPENAI_API_KEY=your_server_only_key
   SITE_PASSWORD=a-long-shared-password
   ```

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

Open `http://localhost:3000`. Allow microphone access when prompted.

## Deploy to Vercel

1. Import this repository into the existing Vercel project for `speak-like-native.vercel.app`.
2. In **Project Settings → Environment Variables**, add `OPENAI_API_KEY` and `SITE_PASSWORD` for Production (and Preview if desired).
3. Deploy. Vercel automatically detects the Next.js app.

Never expose `OPENAI_API_KEY` in any `NEXT_PUBLIC_` variable.

## Password and sessions

Update `SITE_PASSWORD` in Vercel and redeploy to change the shared password. Existing browser sessions become invalid because the session cookie is an HTTP-only HMAC derived from the password. Sessions last 14 days; users can log out at any time.

## AI design and approximate costs

- Speech recognition defaults to `gpt-4o-mini-transcribe`, selected for efficient, strong English transcription.
- Coaching defaults to `gpt-5-mini` through the current **Responses API**, with strict JSON-schema output.
- Models live in `lib/models.ts` and can be overridden via `OPENAI_TRANSCRIPTION_MODEL` / `OPENAI_COACHING_MODEL` without changing the routes.

OpenAI pricing changes; check the current pricing page before setting a public usage budget. Cost per session depends on recording length and feedback length. The app caps uploads at 10 MB and performs one transcription plus one compact coaching response per recording.

## Troubleshooting

- **“Microphone access is needed”**: Use HTTPS (Vercel does this automatically) or localhost, then allow the microphone in the browser site settings.
- **“OPENAI_API_KEY is not configured”**: Add the key to `.env.local` locally or Vercel environment variables, then restart/redeploy.
- **Upload rejected**: The app accepts WebM, MP4/M4A, MP3, WAV, and OGG files up to 10 MB.
- **No transcript**: Try a short English recording in a quieter location.

## Future-ready structure

Authentication, audio handling, model selection, prompts, API handlers, feedback types, and UI components are separated so accounts, saved sessions, study modes, subscriptions, and personalized learning can be introduced without changing the core recording loop.
