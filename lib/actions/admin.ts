"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateRounds, type MatchPlayer } from "@/lib/matchmaking/generateMatches";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Admin access required.");

  return { supabase, user };
}

export async function createSession(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const seasonId = String(formData.get("seasonId"));
  const title = String(formData.get("title"));
  const sessionDate = String(formData.get("sessionDate"));
  const locationName = String(formData.get("locationName"));
  const courtsCount = Number(formData.get("courtsCount"));
  const roundsCount = Number(formData.get("roundsCount"));

  const { data: session, error } = await supabase
    .from("sessions")
    .insert({ season_id: seasonId, title, session_date: sessionDate, created_by: user.id, status: "attendance_open" })
    .select()
    .single();

  if (error || !session) throw new Error(error?.message ?? "Could not create session.");

  await supabase.from("session_locations").insert({
    session_id: session.id,
    name: locationName,
    courts_count: courtsCount,
    rounds_count: roundsCount,
  });

  redirect(`/admin/sessions/${session.id}/attendance`);
}

/** Toggle a registered player's attendance — the manual predecessor to QR check-in. */
export async function checkInPlayer(registrationId: string, sessionId: string, locationId: string) {
  await requireAdmin();
  const supabase = createClient();

  await supabase
    .from("session_registrations")
    .update({ status: "checked_in", checked_in_at: new Date().toISOString(), location_id: locationId })
    .eq("id", registrationId);

  revalidatePath(`/admin/sessions/${sessionId}/attendance`);
}

/**
 * Generates the round-robin schedule for everyone checked in to a location,
 * using the ported skill-balanced matchmaking algorithm, then writes the
 * rounds + matches to the database.
 */
export async function generateSchedule(sessionId: string, locationId: string) {
  const { supabase } = await requireAdmin();

  const { data: location } = await supabase
    .from("session_locations")
    .select("*")
    .eq("id", locationId)
    .single();
  if (!location) throw new Error("Location not found.");

  const { data: registrations } = await supabase
    .from("session_registrations")
    .select("player_id, profiles(skill_level)")
    .eq("session_id", sessionId)
    .eq("location_id", locationId)
    .eq("status", "checked_in");

  const skillToNumber: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3, pro: 4 };
  const players: MatchPlayer[] = (registrations ?? []).map((r: any) => ({
    id: r.player_id,
    skill: skillToNumber[r.profiles?.skill_level ?? "beginner"] ?? 1,
  }));

  const rounds = generateRounds(players, location.courts_count, location.rounds_count);

  for (const round of rounds) {
    const { data: roundRow } = await supabase
      .from("rounds")
      .insert({ location_id: locationId, round_number: round.round })
      .select()
      .single();
    if (!roundRow) continue;

    const matchRows = round.matches.map((m, i) => ({
      round_id: roundRow.id,
      court_number: i + 1,
      team_a: m.teamA,
      team_b: m.teamB,
    }));
    if (matchRows.length) await supabase.from("matches").insert(matchRows);
  }

  await supabase.from("session_locations").update({ status: "schedule" }).eq("id", locationId);
  revalidatePath(`/admin/sessions/${sessionId}/schedule`);
}

/**
 * Records a match score. The `apply_match_points` trigger in the database
 * handles the points math — this action just writes the result.
 */
export async function submitMatchScore(
  matchId: string,
  scoreA: number,
  scoreB: number,
  sessionId: string
) {
  const { supabase, user } = await requireAdmin();

  const result = scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : "draw";

  await supabase
    .from("matches")
    .update({ score_a: scoreA, score_b: scoreB, result, recorded_by: user.id, recorded_at: new Date().toISOString() })
    .eq("id", matchId);

  revalidatePath(`/admin/sessions/${sessionId}/schedule`);
  revalidatePath("/rankings");
}
