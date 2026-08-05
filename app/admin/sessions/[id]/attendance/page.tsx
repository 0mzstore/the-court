import { createClient } from "@/lib/supabase/server";
import { checkInPlayer, generateSchedule } from "@/lib/actions/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function AttendancePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: session } = await supabase.from("sessions").select("*, session_locations(*)").eq("id", params.id).single();
  const location = session?.session_locations?.[0];

  const { data: registrations } = await supabase
    .from("session_registrations")
    .select("id, status, player_id, profiles(full_name, skill_level)")
    .eq("session_id", params.id)
    .order("registered_at", { ascending: true });

  const confirmed = registrations?.filter((r) => r.status !== "waiting_list" && r.status !== "cancelled") ?? [];
  const waitingList = registrations?.filter((r) => r.status === "waiting_list") ?? [];

  return (
    <div className="max-w-[760px] mx-auto px-6 py-12">
      <p className="text-xs font-bold uppercase tracking-wide text-ink-600 mb-1">{session?.title}</p>
      <h1 className="font-display text-[28px] text-court-950 mb-1">Attendance</h1>
      <p className="text-sm text-ink-600 mb-8">
        Check players in as they arrive. Once everyone's in, generate the match schedule.
      </p>

      <Card className="p-6 mb-6">
        <h2 className="font-display text-lg text-court-950 mb-4">Registered ({confirmed.length})</h2>
        {confirmed.map((r: any) => (
          <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-black/5 last:border-0">
            <div>
              <div className="font-bold text-sm">{r.profiles?.full_name}</div>
              <div className="text-xs text-ink-600 capitalize">{r.profiles?.skill_level}</div>
            </div>
            {r.status === "checked_in" ? (
              <Badge variant="win">Checked in</Badge>
            ) : (
              <form action={checkInPlayer.bind(null, r.id, params.id, location?.id)}>
                <Button type="submit" variant="outline">
                  Check in
                </Button>
              </form>
            )}
          </div>
        ))}
        {!confirmed.length && <p className="text-sm text-ink-600 py-2">No registrations yet.</p>}
      </Card>

      {!!waitingList.length && (
        <Card className="p-6 mb-6">
          <h2 className="font-display text-lg text-court-950 mb-4">Waiting list ({waitingList.length})</h2>
          {waitingList.map((r: any) => (
            <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-black/5 last:border-0">
              <div className="font-bold text-sm">{r.profiles?.full_name}</div>
              <Badge variant="pending">Waiting</Badge>
            </div>
          ))}
        </Card>
      )}

      <form action={generateSchedule.bind(null, params.id, location?.id)}>
        <Button type="submit" variant="primary" className="w-full justify-center">
          Generate match schedule →
        </Button>
      </form>
    </div>
  );
}
