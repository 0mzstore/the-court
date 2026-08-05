import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";

export default async function AnalyticsPage() {
  const supabase = createClient();

  const { data: activeSeason } = await supabase.from("seasons").select("*").eq("is_active", true).maybeSingle();

  const [{ count: totalPlayers }, { count: totalSessions }, { count: totalMatches }, { data: topPlayers }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "player"),
      supabase.from("sessions").select("*", { count: "exact", head: true }).eq("season_id", activeSeason?.id ?? ""),
      supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .not("result", "is", null),
      supabase
        .from("player_season_stats")
        .select("points, profiles(full_name)")
        .eq("season_id", activeSeason?.id ?? "")
        .order("points", { ascending: false })
        .limit(5),
    ]);

  const { data: skillBreakdown } = await supabase.from("profiles").select("skill_level");
  const breakdown = ["beginner", "intermediate", "advanced", "pro"].map((level) => ({
    level,
    count: skillBreakdown?.filter((p) => p.skill_level === level).length ?? 0,
  }));

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12">
      <p className="text-xs font-bold uppercase tracking-wide text-ink-600 mb-1">
        {activeSeason?.name ?? "Overall"}
      </p>
      <h1 className="font-display text-[28px] text-court-950 mb-1">Statistics</h1>
      <p className="text-sm text-ink-600 mb-8">
        This is the same snapshot worth sharing with sponsors — active community, real engagement.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <div className="text-[11.5px] font-bold uppercase tracking-wide text-ink-600 mb-2">Total players</div>
          <div className="font-display text-3xl text-court-950">{totalPlayers ?? 0}</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11.5px] font-bold uppercase tracking-wide text-ink-600 mb-2">Sessions this season</div>
          <div className="font-display text-3xl text-court-950">{totalSessions ?? 0}</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11.5px] font-bold uppercase tracking-wide text-ink-600 mb-2">Matches played</div>
          <div className="font-display text-3xl text-court-950">{totalMatches ?? 0}</div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-6">
          <h2 className="font-display text-lg text-court-950 mb-4">Skill level breakdown</h2>
          {breakdown.map((b) => (
            <div key={b.level} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize font-semibold">{b.level}</span>
                <span className="font-mono text-ink-600">{b.count}</span>
              </div>
              <div className="h-2 bg-court-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-ball-500"
                  style={{ width: `${totalPlayers ? (b.count / totalPlayers) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg text-court-950 mb-4">Top 5 this season</h2>
          {topPlayers?.map((p: any, i: number) => (
            <div key={i} className="flex justify-between text-sm py-2 border-b border-black/5 last:border-0">
              <span className="font-semibold">{p.profiles?.full_name}</span>
              <span className="font-mono font-bold text-court-950">{p.points}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
