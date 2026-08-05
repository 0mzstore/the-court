"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addSponsor(formData: FormData) {
  const supabase = createClient();

  await supabase.from("sponsors").insert({
    name: String(formData.get("name")),
    logo_url: String(formData.get("logoUrl") || ""),
    tier: String(formData.get("tier")),
    website_url: String(formData.get("websiteUrl") || ""),
    active: true,
  });

  revalidatePath("/admin/sponsors");
  revalidatePath("/sponsors");
}

export async function toggleSponsorActive(sponsorId: string, active: boolean) {
  const supabase = createClient();
  await supabase.from("sponsors").update({ active: !active }).eq("id", sponsorId);
  revalidatePath("/admin/sponsors");
  revalidatePath("/sponsors");
}
