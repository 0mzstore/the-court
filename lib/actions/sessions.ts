"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const CONFIRMATION_WINDOW_MINUTES = 15;

/**
 * Player registers for a session. If the session is full, they're placed on
 * the waiting list at the back of the queue rather than turned away.
 */
export async function registerForSession(sessionId: string, capacity: number) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You need to be signed in to register.");

  const { count } = await supabase
    .from("session_registrations")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .in("status", ["registered", "confirmed", "checked_in"]);

  const isFull = (count ?? 0) >= capacity;

  if (isFull) {
    const { data: queue } = await supabase
      .from("session_registrations")
      .select("position_in_queue")
      .eq("session_id", sessionId)
      .eq("status", "waiting_list")
      .order("position_in_queue", { ascending: false })
      .limit(1);

    const nextPosition = (queue?.[0]?.position_in_queue ?? 0) + 1;

    await supabase.from("session_registrations").insert({
      session_id: sessionId,
      player_id: user.id,
      status: "waiting_list",
      position_in_queue: nextPosition,
    });
  } else {
    await supabase.from("session_registrations").insert({
      session_id: sessionId,
      player_id: user.id,
      status: "registered",
    });
  }

  revalidatePath(`/sessions/${sessionId}`);
}

/**
 * A confirmed player cancels — this is what opens up a spot. Notifies (does
 * not auto-promote) the next person in the waiting-list queue, per the
 * notify-and-confirm decision: they get a fixed window to claim the spot
 * before it passes to the next person.
 */
export async function cancelRegistration(registrationId: string, sessionId: string) {
  const supabase = createClient();

  await supabase.from("session_registrations").update({ status: "cancelled" }).eq("id", registrationId);

  const { data: nextInLine } = await supabase
    .from("session_registrations")
    .select("id, player_id")
    .eq("session_id", sessionId)
    .eq("status", "waiting_list")
    .order("position_in_queue", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (nextInLine) {
    const expiresAt = new Date(Date.now() + CONFIRMATION_WINDOW_MINUTES * 60_000).toISOString();

    await supabase
      .from("session_registrations")
      .update({ confirmation_expires_at: expiresAt })
      .eq("id", nextInLine.id);

    await supabase.from("notifications").insert({
      player_id: nextInLine.player_id,
      type: "waiting_list_promotion",
      title: "A spot opened up!",
      body: `You have ${CONFIRMATION_WINDOW_MINUTES} minutes to confirm your spot before it passes to the next player.`,
    });
  }

  revalidatePath(`/sessions/${sessionId}`);
}

/** The notified player taps "Confirm my spot" before the window expires. */
export async function confirmWaitingListSpot(registrationId: string, sessionId: string) {
  const supabase = createClient();

  const { data: reg } = await supabase
    .from("session_registrations")
    .select("confirmation_expires_at")
    .eq("id", registrationId)
    .single();

  if (!reg?.confirmation_expires_at || new Date(reg.confirmation_expires_at) < new Date()) {
    throw new Error("This confirmation window has expired.");
  }

  await supabase
    .from("session_registrations")
    .update({ status: "confirmed", confirmation_expires_at: null })
    .eq("id", registrationId);

  revalidatePath(`/sessions/${sessionId}`);
}
