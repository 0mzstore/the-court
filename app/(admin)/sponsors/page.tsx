import { createClient } from "@/lib/supabase/server";
import { addSponsor, toggleSponsorActive } from "@/lib/actions/sponsors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default async function AdminSponsorsPage() {
  const supabase = createClient();
  const { data: sponsors } = await supabase.from("sponsors").select("*").order("tier", { ascending: true });

  return (
    <div className="max-w-[760px] mx-auto px-6 py-12">
      <h1 className="font-display text-[28px] text-court-950 mb-8">Sponsors</h1>

      <Card className="p-6 mb-6">
        <h2 className="font-display text-lg text-court-950 mb-4">Add sponsor</h2>
        <form action={addSponsor}>
          <Input id="name" name="name" label="Sponsor name" required />
          <Input id="logoUrl" name="logoUrl" label="Logo URL" placeholder="https://..." />
          <Input id="websiteUrl" name="websiteUrl" label="Website URL" placeholder="https://..." />
          <div className="mb-4">
            <label className="block text-[11.5px] font-bold uppercase tracking-wide text-ink-600 mb-1.5">Tier</label>
            <select name="tier" className="w-full text-sm px-3 py-[9px] rounded-lg border border-black/10 bg-white">
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
            </select>
          </div>
          <Button type="submit" variant="primary" className="w-full justify-center">
            Add sponsor
          </Button>
        </form>
      </Card>

      <Card className="divide-y divide-black/5">
        {sponsors?.map((s) => (
          <div key={s.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <div className="font-bold text-sm">{s.name}</div>
              <div className="text-xs text-ink-600 capitalize">{s.tier} tier</div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={s.active ? "win" : "neutral"}>{s.active ? "Active" : "Hidden"}</Badge>
              <form action={toggleSponsorActive.bind(null, s.id, s.active)}>
                <Button type="submit" variant="outline">
                  {s.active ? "Hide" : "Show"}
                </Button>
              </form>
            </div>
          </div>
        ))}
        {!sponsors?.length && <p className="text-sm text-ink-600 px-5 py-8 text-center">No sponsors yet.</p>}
      </Card>
    </div>
  );
}
