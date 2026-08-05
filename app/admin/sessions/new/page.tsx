import { createClient } from "@/lib/supabase/server";
import { createSession } from "@/lib/actions/admin";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default async function NewSessionPage() {
  const supabase = createClient();
  const { data: seasons } = await supabase.from("seasons").select("id, name, is_active").order("created_at", { ascending: false });

  return (
    <div className="max-w-[560px] mx-auto px-6 py-12">
      <h1 className="font-display text-[28px] text-court-950 mb-6">New session</h1>
      <Card className="p-7">
        <form action={createSession}>
          <div className="mb-4">
            <label className="block text-[11.5px] font-bold uppercase tracking-wide text-ink-600 mb-1.5">
              Season
            </label>
            <select name="seasonId" required className="w-full text-sm px-3 py-[9px] rounded-lg border border-black/10 bg-white">
              {seasons?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.is_active ? "— Active" : ""}
                </option>
              ))}
            </select>
          </div>
          <Input id="title" name="title" label="Session title" placeholder="Saturday Session — New Cairo" required />
          <Input id="sessionDate" name="sessionDate" type="date" label="Date" required />
          <Input id="locationName" name="locationName" label="Location name" placeholder="New Cairo" required />
          <div className="grid grid-cols-2 gap-3">
            <Input id="courtsCount" name="courtsCount" type="number" min={1} defaultValue={4} label="Courts" required />
            <Input id="roundsCount" name="roundsCount" type="number" min={1} defaultValue={5} label="Rounds" required />
          </div>
          <Button type="submit" variant="primary" className="w-full justify-center mt-2">
            Create session
          </Button>
        </form>
      </Card>
    </div>
  );
}
