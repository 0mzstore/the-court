import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { registerForSession, cancelRegistration } from "@/lib/actions/sessions";

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: session } = await supabase
    .from("sessions")
    .select("*, session_locations(*)")
    .eq("id", params.id)
    .single();

  const location = session?.session_locations?.[0];
  const capacity = (location?.courts_count ?? 1) * 4;

  const { data: registrations } = await supabase
    .from("session_registrations")
    .select("id, status, player_id")
    .eq("session_id", params.id)
    .in("status", ["registered", "confirmed", "checked_in"]);

  const confirmedCount = registrations?.length ?? 0;
  const isFull = confirmedCount >= capacity;

  const myRegistration = user
    ? await supabase
        .from("session_registrations")
        .select("*")
        .eq("session_id", params.id)
        .eq("player_id", user.id)
        .maybeSingle()
        .then((r) => r.data)
    : null;

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-black/[0.08] bg-white">
        <div className="max-w-[700px] mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-ball-500" />
            <span className="font-display text-xl tracking-wide text-court-950">THE COURT</span>
          </Link>
        </div>
      </header>

      <main className="max-w-[700px] mx-auto px-6 py-10">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-600 mb-1">
          {location?.name ?? "Session"}
        </p>
        <h1 className="font-display text-[32px] text-court-950 mb-1">{session?.title}</h1>
        <p className="text-sm text-ink-600 mb-8">{session?.session_date}</p>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[11.5px] font-bold uppercase tracking-wide text-ink-600 mb-1">Spots</div>
              <div className="font-display text-2xl text-court-950">
                {confirmedCount} / {capacity} {isFull && "— Full"}
              </div>
            </div>
            {myRegistration && (
              <Badge variant={myRegistration.status === "waiting_list" ? "pending" : "win"}>
                {myRegistration.status === "waiting_list" ? "You're on the waiting list" : "You're registered"}
              </Badge>
            )}
          </div>

          {!user && (
            <p className="text-sm text-ink-600">
              <Link href="/login" className="text-court-800 font-bold">
                Log in
              </Link>{" "}
              to register for this session.
            </p>
          )}

          {user && !myRegistration && (
            <form action={registerForSession.bind(null, params.id, capacity)}>
              <Button type="submit" variant="primary" className="w-full justify-center">
                {isFull ? "Join the waiting list" : "Reserve your spot"}
              </Button>
            </form>
          )}

          {user && myRegistration && myRegistration.status !== "checked_in" && (
            <form action={cancelRegistration.bind(null, myRegistration.id, params.id)}>
              <Button type="submit" variant="outline" className="w-full justify-center">
                Cancel my spot
              </Button>
            </form>
          )}
        </Card>
      </main>
    </div>
  );
}
