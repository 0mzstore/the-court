import { createBrowserClient } from "@supabase/ssr";

/**
 * Use inside Client Components only (interactive bits: live leaderboard
 * subscription, check-in button, waiting-list confirm countdown).
 * Server Components and Server Actions should use lib/supabase/server.ts instead.
 *
 * Not using the strict `Database` generic here: hand-written Supabase types
 * cause false-positive build failures on narrow/embedded selects (e.g.
 * `.select("content")` or `.select("id, profiles(name)")`) unless every
 * relationship is fully declared. Safer to regenerate real types later with
 * `npx supabase gen types typescript` once the project is live, and add the
 * generic back then.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
