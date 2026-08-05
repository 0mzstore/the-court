/**
 * Skill-balanced match generator — ported from the original single-file app.
 * This is the one genuinely differentiated piece of logic in the whole
 * product (per Phase 1 notes), so it lives in its own module rather than
 * buried inside a page component.
 *
 * Given the players checked into a location, splits them into courts of 4
 * and picks a 2v2 split per court that minimizes:
 *  - skill imbalance between the two teams
 *  - repeat partnerships (same two people teaming up again)
 *  - repeat opponents (same two people facing each other again)
 *
 * Runs multiple randomized attempts and keeps the lowest-penalty result,
 * same approach as the original — simple, and it works.
 */

export interface MatchPlayer {
  id: string;
  skill: number; // 1 = beginner .. 4 = pro
}

export interface GeneratedMatch {
  teamA: [string, string];
  teamB: [string, string];
}

export interface GeneratedRound {
  round: number;
  matches: GeneratedMatch[];
  resting: string[];
}

function pairKey(a: string, b: string) {
  return [a, b].sort().join("|");
}

export function generateRounds(
  players: MatchPlayer[],
  courtsCount: number,
  roundsCount: number,
  attemptsPerRound = 60
): GeneratedRound[] {
  const skill: Record<string, number> = {};
  players.forEach((p) => (skill[p.id] = p.skill));

  const partnerCount: Record<string, number> = {};
  const opponentCount: Record<string, number> = {};
  const rounds: GeneratedRound[] = [];

  for (let r = 0; r < roundsCount; r++) {
    const capacity = courtsCount * 4;
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const playing = shuffledPlayers.slice(0, capacity).map((p) => p.id);
    const resting = shuffledPlayers.slice(capacity).map((p) => p.id);

    let best: { totalScore: number; courtResults: GeneratedMatch[] } | null = null;

    for (let attempt = 0; attempt < attemptsPerRound; attempt++) {
      const shuffled = [...playing].sort(() => Math.random() - 0.5);
      const groups: string[][] = [];
      for (let c = 0; c < courtsCount; c++) {
        groups.push(shuffled.slice(c * 4, c * 4 + 4));
      }

      let totalScore = 0;
      const courtResults: GeneratedMatch[] = [];
      let valid = true;

      for (const group of groups) {
        if (group.length < 4) {
          valid = false;
          break;
        }
        const [p1, p2, p3, p4] = group;
        const splits: [[string, string], [string, string]][] = [
          [
            [p1, p2],
            [p3, p4],
          ],
          [
            [p1, p3],
            [p2, p4],
          ],
          [
            [p1, p4],
            [p2, p3],
          ],
        ];

        let bestSplit: { teamA: [string, string]; teamB: [string, string] } | null = null;
        let bestScore = Infinity;

        for (const [teamA, teamB] of splits) {
          const skillDiff = Math.abs(
            skill[teamA[0]] + skill[teamA[1]] - (skill[teamB[0]] + skill[teamB[1]])
          );
          const partnerPenalty =
            partnerCount[pairKey(teamA[0], teamA[1])] + partnerCount[pairKey(teamB[0], teamB[1])] || 0;
          let opponentPenalty = 0;
          for (const a of teamA) for (const b of teamB) opponentPenalty += opponentCount[pairKey(a, b)] || 0;

          const score = skillDiff * 3 + partnerPenalty * 6 + opponentPenalty * 2;
          if (score < bestScore) {
            bestScore = score;
            bestSplit = { teamA, teamB };
          }
        }

        if (!bestSplit) {
          valid = false;
          break;
        }
        totalScore += bestScore;
        courtResults.push(bestSplit);
      }

      if (!valid) continue;
      if (best === null || totalScore < best.totalScore) best = { totalScore, courtResults };
    }

    if (!best) best = { totalScore: 0, courtResults: [] };

    best.courtResults.forEach(({ teamA, teamB }) => {
      partnerCount[pairKey(teamA[0], teamA[1])] = (partnerCount[pairKey(teamA[0], teamA[1])] || 0) + 1;
      partnerCount[pairKey(teamB[0], teamB[1])] = (partnerCount[pairKey(teamB[0], teamB[1])] || 0) + 1;
      for (const a of teamA)
        for (const b of teamB) opponentCount[pairKey(a, b)] = (opponentCount[pairKey(a, b)] || 0) + 1;
    });

    rounds.push({ round: r + 1, matches: best.courtResults, resting });
  }

  return rounds;
}

/** Win +25 / Loss -10 / Draw +10 — the point economy locked in Phase 1/2. */
export function pointsForResult(result: "A" | "B" | "draw", side: "A" | "B"): number {
  if (result === "draw") return 10;
  return result === side ? 25 : -10;
}
