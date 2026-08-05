"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

interface Row {
  name: string;
  tag: string;
  pts: number;
  delta: string | null;
}

const initialRows: Row[] = [
  { name: "Karim Adel", tag: "Advanced", pts: 1420, delta: "+25" },
  { name: "Nour Fathy", tag: "Advanced", pts: 1395, delta: "+25" },
  { name: "Yassin Reda", tag: "Pro", pts: 1380, delta: null },
  { name: "Mariam Sami", tag: "Intermediate", pts: 1310, delta: "+10" },
  { name: "Omar Khaled", tag: "Advanced", pts: 1275, delta: null },
];

/**
 * Static demo data for now — swap for a Supabase Realtime subscription on
 * `player_season_stats` (filtered to the active season, ordered by points)
 * once the DB is connected. The flash-on-change behavior below is exactly
 * what should happen when a real row's points update mid-session.
 */
export function LeaderboardPreview() {
  const [rows, setRows] = useState(initialRows);
  const [flashName, setFlashName] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRows((prev) => {
        const next = [...prev];
        const rising = next.pop()!;
        rising.pts += 30;
        rising.delta = "+25";
        next.splice(1, 0, rising);
        setFlashName(rising.name);
        return next;
      });
      setTimeout(() => setFlashName(null), 900);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white rounded-[20px] shadow-card overflow-hidden border border-black/5">
      <div className="bg-court-950 text-white px-5 py-4 flex items-center justify-between">
        <div className="font-display text-lg tracking-wide">SEASON 4 — LEADERBOARD</div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ball-500">
          <span className="w-1.5 h-1.5 rounded-full bg-ball-500 animate-pulse" />
          Live
        </div>
      </div>
      <div className="p-2.5">
        {rows.map((row, i) => (
          <div
            key={row.name}
            className={clsx(
              "grid grid-cols-[34px_1fr_auto] items-center gap-3 px-2.5 py-3 rounded-[10px] transition-colors duration-500",
              flashName === row.name && "bg-ball-500/35"
            )}
          >
            <div
              className={clsx(
                "w-[30px] h-[30px] rounded-lg flex items-center justify-center font-display text-[15px]",
                i === 0 ? "bg-ball-500 text-ball-ink" : "bg-court-100 text-court-950"
              )}
            >
              {i + 1}
            </div>
            <div>
              <div className="font-bold text-[14.5px]">{row.name}</div>
              <div className="text-ink-600 text-[11.5px]">{row.tag}</div>
            </div>
            <div className="font-mono font-bold text-[14px] text-court-950 text-right">
              {row.pts}
              {row.delta && <span className="block text-[10.5px] text-win font-bold">{row.delta}</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 text-center text-[12.5px] text-ink-600 border-t border-court-100">
        Updates the moment a match ends.
      </div>
    </div>
  );
}
