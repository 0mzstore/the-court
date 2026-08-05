# The Court

Egypt's competitive padel community platform. Next.js + Supabase.

## What's built so far (Sprint 1)
- Project foundation (Next.js, TypeScript, Tailwind, design system tokens)
- Landing page, matching the approved mockup
- Full database schema (`supabase/migrations/0001_init.sql`) with server-authoritative points
- Waiting list logic (notify-and-confirm) as server actions
- Ported skill-balanced match generator

## Going live — no coding required, ~10 minutes

**1. Create a Supabase project** (free tier is fine to start)
   - Go to supabase.com → New Project
   - Once it's ready: Project Settings → API → copy the "Project URL" and "anon public" key

**2. Load the database**
   - In Supabase: SQL Editor → New query
   - Paste the entire contents of `supabase/migrations/0001_init.sql` → Run

**3. Push this code to GitHub**
   - Create a new repository on github.com and upload this folder
   - (I can walk you through this step-by-step when you're ready — it's a drag-and-drop upload, no terminal needed)

**4. Deploy on Vercel**
   - Go to vercel.com → New Project → import the GitHub repo you just created
   - When it asks for Environment Variables, add the two values from Step 1:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click Deploy

That's it — Vercel gives you a live `.vercel.app` URL immediately. A custom domain
(`thecourt.eg`) can be attached afterward in Vercel's Domains settings, whenever
you're ready for it.

## What's next (Sprint 2)
Auth pages, player dashboard, admin session/attendance management — same process:
I build it here, you deploy it with the same "click Deploy" step, and Vercel
updates the live site automatically every time.
