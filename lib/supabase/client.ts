import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database";

/**
 * Use inside Client Components only (interactive bits: live leaderboard
 * subscription, check-in button, waiting-list confirm countdown).
 * Server Components and Server Actions should use lib/supabase/server.ts instead.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
