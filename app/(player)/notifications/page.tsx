import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { markAllNotificationsRead } from "@/lib/actions/notifications";

export default async function NotificationsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("player_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-black/[0.08] bg-white">
        <div className="max-w-[680px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm font-semibold text-ink-600 hover:text-court-800">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-[680px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-[28px] text-court-950">Notifications</h1>
          <form action={markAllNotificationsRead}>
            <Button type="submit" variant="outline">
              Mark all read
            </Button>
          </form>
        </div>

        <Card className="divide-y divide-black/5">
          {notifications?.map((n) => (
            <div key={n.id} className={`px-5 py-4 flex items-start gap-3 ${!n.read_at ? "bg-ball-500/10" : ""}`}>
              {!n.read_at && <span className="w-2 h-2 rounded-full bg-ball-ink mt-1.5 flex-shrink-0" />}
              <div className="flex-1">
                <div className="font-bold text-sm">{n.title}</div>
                {n.body && <div className="text-sm text-ink-600 mt-0.5">{n.body}</div>}
                <div className="text-xs text-ink-600 mt-1">{new Date(n.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
          {!notifications?.length && <p className="text-sm text-ink-600 px-5 py-8 text-center">Nothing here yet.</p>}
        </Card>
      </main>
    </div>
  );
}
