import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function RankingsPage() {
  const supabase = createClient();

  const { data: activeSeason } = await supabase.from("seasons").select("*").eq("is_active", true).maybeSingle();

  const { data: rows } = activeSeason
    ? await supabase
        .from("player_season_stats")
        .select("points, wins, draws, losses, matches_played, profiles(full_name, skill_level)")
        .eq("season_id", activeSeason.id)
        .order("points", { ascending: false })
    : { data: [] };

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-black/[0.08] bg-white">
        <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-ball-500" />
            <span className="font-display text-xl tracking-wide text-court-950">THE COURT</span>
          </Link>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-6 py-10">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-600 mb-1">
          {activeSeason?.name ?? "No active season"}
        </p>
        <h1 className="font-display text-[32px] text-court-950 mb-8">Rankings</h1>

        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5">
                <th className="text-left text-[10.5px] uppercase tracking-wide text-ink-600 font-bold px-5 py-3 w-12"></th>
                <th className="text-left text-[10.5px] uppercase tracking-wide text-ink-600 font-bold px-2 py-3">Player</th>
                <th className="text-center text-[10.5px] uppercase tracking-wide text-ink-600 font-bold px-2 py-3">W-D-L</th>
                <th className="text-right text-[10.5px] uppercase tracking-wide text-ink-600 font-bold px-5 py-3">Points</th>
              </tr>
            </thead>
            <tbody>
              {rows?.map((row: any, i: number) => (
                <tr key={i} className="border-b border-black/5 last:border-0">
                  <td className="px-5 py-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-display text-[13px] ${
                        i === 0 ? "bg-ball-500 text-ball-ink" : "bg-court-100 text-court-950"
                      }`}
                    >
                      {i + 1}
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="font-bold">{row.profiles?.full_name}</div>
                    <div className="text-xs text-ink-600 capitalize">{row.profiles?.skill_level}</div>
                  </td>
                  <td className="text-center font-mono text-ink-600">
                    {row.wins}-{row.draws}-{row.losses}
                  </td>
                  <td className="text-right px-5 font-mono font-bold text-court-950">{row.points}</td>
                </tr>
              ))}
              {!rows?.length && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-ink-600 text-sm">
                    No matches played yet this season.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
