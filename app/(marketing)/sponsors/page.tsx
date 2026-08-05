import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const tierLabel: Record<string, string> = { gold: "Gold Partner", silver: "Silver Partner", bronze: "Bronze Partner" };

export default async function SponsorsPage() {
  const supabase = createClient();
  const { data: sponsors } = await supabase.from("sponsors").select("*").eq("active", true).order("tier");

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-black/[0.08] bg-white">
        <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-ball-500" />
            <span className="font-display text-xl tracking-wide text-court-950">THE COURT</span>
          </Link>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-6 py-14 text-center">
        <div className="inline-flex bg-court-100 text-court-800 text-xs font-extrabold uppercase tracking-wide px-3 py-[7px] rounded-full mb-4">
          Partner With Us
        </div>
        <h1 className="font-display text-[38px] text-court-950 mb-4">Our sponsors</h1>
        <p className="text-ink-600 max-w-[560px] mx-auto mb-12">
          The brands backing Egypt&apos;s most active padel community.
        </p>

        <div className="grid sm:grid-cols-3 gap-5 mb-12">
          {sponsors?.map((s) => (
            <a
              key={s.id}
              href={s.website_url ?? "#"}
              target="_blank"
              className="bg-white rounded-2xl shadow-card p-6 flex flex-col items-center gap-3 hover:-translate-y-0.5 transition-transform"
            >
              {s.logo_url ? (
                <img src={s.logo_url} alt={s.name} className="h-12 object-contain" />
              ) : (
                <div className="h-12 flex items-center font-display text-xl text-court-950">{s.name}</div>
              )}
              <span className="text-[11px] font-bold uppercase tracking-wide text-ink-600">{tierLabel[s.tier]}</span>
            </a>
          ))}
          {!sponsors?.length && (
            <div className="col-span-3 border-2 border-dashed border-black/10 rounded-2xl py-14 text-ink-600 text-sm">
              Sponsor slots open — be the first.
            </div>
          )}
        </div>

        <Button href="mailto:hello@thecourt.eg" variant="dark">
          Become a sponsor
        </Button>
      </main>
    </div>
  );
}
