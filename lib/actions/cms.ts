"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface HeroContent {
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  headlineLine3: string;
  subtext: string;
  playerCount: string;
  seasonCount: string;
  sessionCount: string;
}

export async function updateHeroContent(formData: FormData) {
  const supabase = createClient();

  const content: HeroContent = {
    eyebrow: String(formData.get("eyebrow")),
    headlineLine1: String(formData.get("headlineLine1")),
    headlineLine2: String(formData.get("headlineLine2")),
    headlineLine3: String(formData.get("headlineLine3")),
    subtext: String(formData.get("subtext")),
    playerCount: String(formData.get("playerCount")),
    seasonCount: String(formData.get("seasonCount")),
    sessionCount: String(formData.get("sessionCount")),
  };

  await supabase
    .from("cms_content")
    .upsert({ key: "landing_hero", content, updated_at: new Date().toISOString() });

  revalidatePath("/");
  revalidatePath("/admin/cms");
}
