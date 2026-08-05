"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
}

/**
 * Subscribes to the notifications table via Supabase Realtime so a player
 * sees "a spot opened up, confirm within 15 min" the instant it's created,
 * not on their next page refresh.
 */
export function NotificationBell({ initialUnreadCount, userId }: { initialUnreadCount: number; userId: string }) {
  const [unread, setUnread] = useState(initialUnreadCount);
  const [open, setOpen] = useState(false);
  const [latest, setLatest] = useState<Notification[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `player_id=eq.${userId}` },
        (payload) => {
          setUnread((n) => n + 1);
          setLatest((prev) => [payload.new as Notification, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 rounded-full bg-court-100 flex items-center justify-center text-court-950"
        aria-label="Notifications"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-pending text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 min-w-[18px] h-[18px] flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-card border border-black/5 z-20 overflow-hidden">
          <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
            <span className="font-bold text-sm">Notifications</span>
            <Link href="/notifications" className="text-xs text-court-800 font-bold" onClick={() => setOpen(false)}>
              View all
            </Link>
          </div>
          {latest.length === 0 ? (
            <p className="text-xs text-ink-600 px-4 py-4">No new notifications.</p>
          ) : (
            latest.map((n) => (
              <div key={n.id} className="px-4 py-3 border-b border-black/5 last:border-0">
                <div className="font-semibold text-sm">{n.title}</div>
                {n.body && <div className="text-xs text-ink-600 mt-0.5">{n.body}</div>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
