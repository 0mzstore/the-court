"use client";

import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { submitMatchScore } from "@/lib/actions/admin";

interface Player {
  id: string;
  full_name: string;
}

interface MatchCardProps {
  matchId: string;
  sessionId: string;
  teamA: Player[];
  teamB: Player[];
  scoreA: number | null;
  scoreB: number | null;
  result: "A" | "B" | "draw" | null;
}

export function MatchCard({ matchId, sessionId, teamA, teamB, scoreA, scoreB, result }: MatchCardProps) {
  const [a, setA] = useState(scoreA?.toString() ?? "");
  const [b, setB] = useState(scoreB?.toString() ?? "");
  const [pending, startTransition] = useTransition();

  const submit = () => {
    const nA = parseInt(a, 10);
    const nB = parseInt(b, 10);
    if (isNaN(nA) || isNaN(nB) || nA < 0 || nB < 0) return;
    startTransition(() => submitMatchScore(matchId, nA, nB, sessionId));
  };

  return (
    <div
      className={clsx(
        "bg-white rounded-2xl shadow-card border overflow-hidden",
        result === "A" && "border-win",
        result === "B" && "border-info",
        result === "draw" && "border-draw",
        !result && "border-black/5"
      )}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-2.5 py-4">
        <div className={clsx("text-center px-2", result === "A" && "text-win font-bold", result === "B" && "text-ink-600 line-through opacity-70")}>
          <div className="text-[10px] font-extrabold uppercase tracking-wide text-ink-600 mb-2">Team A</div>
          {teamA.map((p) => (
            <div key={p.id} className="font-bold text-[15.5px] leading-relaxed">
              {p.full_name}
            </div>
          ))}
        </div>
        <div className="w-px h-full bg-[repeating-linear-gradient(to_bottom,theme(colors.black/10)_0_6px,transparent_6px_12px)] relative">
          <div
            className={clsx(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2",
              result === "A" && "bg-win border-win",
              result === "B" && "bg-info border-info",
              result === "draw" && "bg-draw border-draw",
              !result && "bg-court-100 border-black/10"
            )}
          />
        </div>
        <div className={clsx("text-center px-2", result === "B" && "text-win font-bold", result === "A" && "text-ink-600 line-through opacity-70")}>
          <div className="text-[10px] font-extrabold uppercase tracking-wide text-ink-600 mb-2">Team B</div>
          {teamB.map((p) => (
            <div key={p.id} className="font-bold text-[15.5px] leading-relaxed">
              {p.full_name}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 px-3.5 pb-3.5">
        <input
          value={a}
          onChange={(e) => setA(e.target.value)}
          type="number"
          min={0}
          className="w-14 text-center py-2 rounded-lg border border-black/10 font-extrabold text-[15px]"
        />
        <span className="text-ink-600 font-bold">–</span>
        <input
          value={b}
          onChange={(e) => setB(e.target.value)}
          type="number"
          min={0}
          className="w-14 text-center py-2 rounded-lg border border-black/10 font-extrabold text-[15px]"
        />
        <button
          onClick={submit}
          disabled={pending}
          className="ml-1 bg-court-950 text-white rounded-lg px-3 py-2 text-xs font-extrabold disabled:opacity-50"
        >
          {result ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
}
