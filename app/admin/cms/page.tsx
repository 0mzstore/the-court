import { createClient } from "@/lib/supabase/server";
import { updateHeroContent, type HeroContent } from "@/lib/actions/cms";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const defaults: HeroContent = {
  eyebrow: "Season 4 — Registration Open",
  headlineLine1: "Play.",
  headlineLine2: "Rank.",
  headlineLine3: "Get seen.",
  subtext:
    "Egypt's competitive padel community. Join weekly sessions, climb the season leaderboard, and win real prizes.",
  playerCount: "240+",
  seasonCount: "4",
  sessionCount: "32",
};

export default async function CmsPage() {
  const supabase = createClient();
  const { data } = await supabase.from("cms_content").select("content").eq("key", "landing_hero").maybeSingle();
  const content: HeroContent = { ...defaults, ...(data?.content ?? {}) };

  return (
    <div className="max-w-[600px] mx-auto px-6 py-12">
      <h1 className="font-display text-[28px] text-court-950 mb-1">Landing page content</h1>
      <p className="text-sm text-ink-600 mb-8">
        Edit what visitors see on thecourt.eg — no code, changes go live immediately.
      </p>

      <Card className="p-7">
        <form action={updateHeroContent}>
          <Input id="eyebrow" name="eyebrow" label="Status badge" defaultValue={content.eyebrow} />
          <div className="grid grid-cols-3 gap-3">
            <Input id="headlineLine1" name="headlineLine1" label="Headline line 1" defaultValue={content.headlineLine1} />
            <Input id="headlineLine2" name="headlineLine2" label="Headline line 2" defaultValue={content.headlineLine2} />
            <Input id="headlineLine3" name="headlineLine3" label="Headline line 3" defaultValue={content.headlineLine3} />
          </div>
          <div className="mb-4">
            <label className="block text-[11.5px] font-bold uppercase tracking-wide text-ink-600 mb-1.5">
              Subtext
            </label>
            <textarea
              name="subtext"
              defaultValue={content.subtext}
              rows={3}
              className="w-full text-sm px-3 py-[9px] rounded-lg border border-black/10 bg-white"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input id="playerCount" name="playerCount" label="Player count" defaultValue={content.playerCount} />
            <Input id="seasonCount" name="seasonCount" label="Seasons run" defaultValue={content.seasonCount} />
            <Input id="sessionCount" name="sessionCount" label="Sessions/year" defaultValue={content.sessionCount} />
          </div>
          <Button type="submit" variant="primary" className="w-full justify-center mt-2">
            Publish changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
