import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default async function SessionsListPage() {
  const supabase = createClient();
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, title, session_date, status")
    .order("session_date", { ascending: true });

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
        <h1 className="font-display text-[32px] text-court-950 mb-8">Sessions</h1>

        <div className="flex flex-col gap-3">
          {sessions?.map((s) => (
            <Link key={s.id} href={`/sessions/${s.id}`}>
              <Card className="p-5 flex items-center justify-between hover:-translate-y-0.5 transition-transform">
                <div>
                  <div className="font-bold text-sm">{s.title}</div>
                  <div className="text-xs text-ink-600">{s.session_date}</div>
                </div>
                <span className="text-court-800 text-sm font-bold">View →</span>
              </Card>
            </Link>
          ))}
          {!sessions?.length && <p className="text-sm text-ink-600">No sessions scheduled yet.</p>}
        </div>
      </main>
    </div>
  );
}
