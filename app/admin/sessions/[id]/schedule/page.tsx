import { createClient } from "@/lib/supabase/server";
import { MatchCard } from "@/components/admin/MatchCard";

export default async function SchedulePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: session } = await supabase.from("sessions").select("*, session_locations(*)").eq("id", params.id).single();
  const location = session?.session_locations?.[0];

  const { data: rounds } = await supabase
    .from("rounds")
    .select("*, matches(*)")
    .eq("location_id", location?.id)
    .order("round_number", { ascending: true });

  const playerIds = new Set<string>();
  rounds?.forEach((r: any) => r.matches.forEach((m: any) => [...m.team_a, ...m.team_b].forEach((id: string) => playerIds.add(id))));
  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", Array.from(playerIds));
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12">
      <p className="text-xs font-bold uppercase tracking-wide text-ink-600 mb-1">{session?.title}</p>
      <h1 className="font-display text-[28px] text-court-950 mb-8">Match schedule</h1>

      {!rounds?.length && (
        <p className="text-sm text-ink-600">No schedule generated yet — go back to attendance and generate it.</p>
      )}

      {rounds?.map((round: any) => (
        <div key={round.id} className="mb-9">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-display text-base tracking-wide text-court-950 whitespace-nowrap">
              ROUND {round.round_number}
            </span>
            <div className="flex-1 h-px bg-black/10" />
          </div>
          <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {round.matches.map((m: any) => (
              <MatchCard
                key={m.id}
                matchId={m.id}
                sessionId={params.id}
                teamA={m.team_a.map((id: string) => profileMap.get(id) ?? { id, full_name: "Unknown" })}
                teamB={m.team_b.map((id: string) => profileMap.get(id) ?? { id, full_name: "Unknown" })}
                scoreA={m.score_a}
                scoreB={m.score_b}
                result={m.result}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
