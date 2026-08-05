"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SkillLevel } from "@/lib/types/database";

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fullName = String(formData.get("fullName"));
  const phone = String(formData.get("phone") || "");
  const skillLevel = String(formData.get("skillLevel")) as SkillLevel;

  await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null, skill_level: skillLevel })
    .eq("id", user.id);

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
