import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "@/lib/actions/profile";

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[420px]">
        <Link href="/dashboard" className="text-sm font-semibold text-ink-600 hover:text-court-800 mb-6 block">
          ← Back to dashboard
        </Link>
        <Card className="p-7">
          <h1 className="font-display text-[26px] text-court-950 mb-1">Edit profile</h1>
          <p className="text-sm text-ink-600 mb-6">Username: @{profile?.username}</p>

          <form action={updateProfile}>
            <Input id="fullName" name="fullName" label="Full name" defaultValue={profile?.full_name} required />
            <Input id="phone" name="phone" label="Phone" defaultValue={profile?.phone ?? ""} />
            <div className="mb-4">
              <label className="block text-[11.5px] font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                Skill level
              </label>
              <select
                name="skillLevel"
                defaultValue={profile?.skill_level ?? "beginner"}
                className="w-full text-sm px-3 py-[9px] rounded-lg border border-black/10 bg-white text-ink-900"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="pro">Pro</option>
              </select>
            </div>
            <Button type="submit" variant="primary" className="w-full justify-center mt-2">
              Save changes
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
