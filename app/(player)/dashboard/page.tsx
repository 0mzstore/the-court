import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/lib/actions/auth";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const { data: activeSeason } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  const { data: stats } = activeSeason
    ? await supabase
        .from("player_season_stats")
        .select("*")
        .eq("player_id", user.id)
        .eq("season_id", activeSeason.id)
        .maybeSingle()
    : { data: null };

  const { data: leaderboard } = activeSeason
    ? await supabase
        .from("player_season_stats")
        .select("player_id, points")
        .eq("season_id", activeSeason.id)
        .order("points", { ascending: false })
    : { data: [] };

  const myRank = leaderboard?.findIndex((row) => row.player_id === user.id);
  const rankLabel = myRank != null && myRank >= 0 ? `#${myRank + 1}` : "Unranked";

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("player_id", user.id)
    .is("read_at", null);

  const { data: upcomingRegistrations } = await supabase
    .from("session_registrations")
    .select("id, status, session_id, sessions(title, session_date)")
    .eq("player_id", user.id)
    .in("status", ["registered", "waiting_list", "confirmed"])
    .order("registered_at", { ascending: true })
    .limit(3);

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-black/[0.08] bg-white">
        <div className="max-w-[1080px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-ball-500" />
            <span className="font-display text-xl tracking-wide text-court-950">THE COURT</span>
          </Link>
          <div className="flex items-center gap-3">
            <NotificationBell initialUnreadCount={unreadCount ?? 0} userId={user.id} />
            <Link href="/profile" className="text-sm font-semibold text-ink-600 hover:text-court-800">
              Edit profile
            </Link>
            <form action={signOut}>
              <Button variant="outline" type="submit">
                Log out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-[1080px] mx-auto px-6 py-10">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-600 mb-1">
          {activeSeason?.name ?? "No active season"}
        </p>
        <h1 className="font-display text-[34px] text-court-950 mb-8">
          Welcome back, {profile?.full_name?.split(" ")[0] ?? "player"}
        </h1>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <Card className="p-5">
            <div className="text-[11.5px] font-bold uppercase tracking-wide text-ink-600 mb-2">Your rank</div>
            <div className="font-display text-3xl text-court-950">{rankLabel}</div>
          </Card>
          <Card className="p-5">
            <div className="text-[11.5px] font-bold uppercase tracking-wide text-ink-600 mb-2">Points</div>
            <div className="font-display text-3xl text-court-950">{stats?.points ?? 1000}</div>
          </Card>
          <Card className="p-5">
            <div className="text-[11.5px] font-bold uppercase tracking-wide text-ink-600 mb-2">Record</div>
            <div className="font-display text-3xl text-court-950">
              {stats?.wins ?? 0}-{stats?.draws ?? 0}-{stats?.losses ?? 0}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-court-950">Your sessions</h2>
            <Link href="/sessions" className="text-court-800 text-[12.5px] font-bold">
              Browse all →
            </Link>
          </div>

          {!upcomingRegistrations?.length && (
            <p className="text-sm text-ink-600 py-4">
              You&apos;re not registered for anything yet.{" "}
              <Link href="/sessions" className="text-court-800 font-bold">
                Find a session
              </Link>
              .
            </p>
          )}

          {upcomingRegistrations?.map((reg: any) => (
            <div key={reg.id} className="flex items-center justify-between py-3 border-b border-black/5 last:border-0">
              <div>
                <div className="font-bold text-sm">{reg.sessions?.title}</div>
                <div className="text-xs text-ink-600">{reg.sessions?.session_date}</div>
              </div>
              <Badge variant={reg.status === "waiting_list" ? "pending" : "win"}>
                {reg.status === "waiting_list" ? "Waiting list" : "Confirmed"}
              </Badge>
            </div>
          ))}
        </Card>
      </main>
    </div>
  );
}
