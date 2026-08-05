import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LeaderboardPreview } from "@/components/leaderboard/LeaderboardPreview";
import { createClient } from "@/lib/supabase/server";
import type { HeroContent } from "@/lib/actions/cms";

const defaultHero: HeroContent = {
  eyebrow: "Season 4 — Registration Open",
  headlineLine1: "Play.",
  headlineLine2: "Rank.",
  headlineLine3: "Get seen.",
  subtext:
    "Egypt's competitive padel community. Join weekly sessions, climb the season leaderboard, and win real prizes — no group chat required.",
  playerCount: "240+",
  seasonCount: "4",
  sessionCount: "32",
};

const steps = [
  { num: "01", title: "Register", body: "Grab a spot in the next session before it fills. Full? You're first in line the moment someone drops." },
  { num: "02", title: "Get matched", body: "Courts are balanced by skill level, so your matches are competitive, not a mismatch." },
  { num: "03", title: "Play & score", body: "Results go in as they happen. Your points update before you've left the court." },
  { num: "04", title: "Climb & win", body: "Points carry across the season. Top of the table at season end takes the prize." },
];

export default async function LandingPage() {
  const supabase = createClient();
  const { data } = await supabase.from("cms_content").select("content").eq("key", "landing_hero").maybeSingle();
  const hero: HeroContent = { ...defaultHero, ...((data?.content as Partial<HeroContent>) ?? {}) };

  return (
    <>
      <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-md border-b border-black/[0.08]">
        <nav className="max-w-[1080px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-[13px] h-[13px] rounded-full bg-ball-500 shadow-[0_0_0_4px_rgba(207,233,77,0.22)]" />
            <span className="font-display text-[22px] tracking-wide text-court-950">THE COURT</span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-ink-600">
            <a href="#how" className="hover:text-court-800">How it works</a>
            <a href="#rankings" className="hover:text-court-800">Rankings</a>
            <a href="#sponsors" className="hover:text-court-800">Sponsors</a>
            <a href="#contact" className="hover:text-court-800">Contact</a>
            <Button href="/register" variant="dark">Join a session</Button>
          </div>
        </nav>
      </header>

      <section className="pt-16 pb-10 px-6">
        <div className="max-w-[1080px] mx-auto grid md:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-court-100 text-court-800 text-xs font-extrabold uppercase tracking-wide px-3 py-[7px] rounded-full mb-5">
              <span className="w-[7px] h-[7px] rounded-full bg-win animate-pulse" />
              {hero.eyebrow}
            </div>
            <h1 className="font-display text-court-950 text-[56px] md:text-[72px] leading-[0.95] mb-5">
              {hero.headlineLine1}
              <br />
              {hero.headlineLine2}
              <br />
              {hero.headlineLine3}
            </h1>
            <p className="text-lg text-ink-600 leading-relaxed max-w-[480px] mb-8">{hero.subtext}</p>
            <div className="flex gap-3 flex-wrap mb-9">
              <Button href="/register" variant="primary">Join the next session →</Button>
              <Button href="#rankings" variant="outline">See current rankings</Button>
            </div>
            <div className="flex items-center gap-5 flex-wrap text-[13px] text-ink-600 font-semibold">
              <span><span className="font-mono font-bold text-court-950 text-[15px]">{hero.playerCount}</span> active players</span>
              <span><span className="font-mono font-bold text-court-950 text-[15px]">{hero.seasonCount}</span> seasons run</span>
              <span><span className="font-mono font-bold text-court-950 text-[15px]">{hero.sessionCount}</span> sessions this year</span>
            </div>
          </div>
          <LeaderboardPreview />
        </div>
      </section>

      <div className="bg-court-950 text-white">
        <div className="max-w-[1080px] mx-auto flex items-center justify-between gap-5 flex-wrap px-6 py-7">
          <div className="flex items-center gap-4">
            <div className="font-display text-[30px] leading-none text-center bg-white/[0.08] rounded-xl px-4 py-2.5">
              24
              <small className="block font-body text-[9px] tracking-wide uppercase text-white/55 mt-1">Jul</small>
            </div>
            <div>
              <h3 className="text-[17px] font-semibold mb-1">Saturday Session — New Cairo</h3>
              <p className="text-white/65 text-[13.5px]">4 courts · 6:00 PM · Round-robin, skill-balanced</p>
            </div>
          </div>
          <div className="font-mono text-[12.5px] text-ball-500">14 / 16 spots filled — 2 left</div>
          <Button href="/register" variant="primary">Reserve your spot</Button>
        </div>
      </div>

      <section id="how" className="py-24 px-6">
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center max-w-[620px] mx-auto">
            <div className="inline-flex bg-court-100 text-court-800 text-xs font-extrabold uppercase tracking-wide px-3 py-[7px] rounded-full mb-3.5">
              The Loop
            </div>
            <h2 className="font-display text-court-950 text-[36px] mb-3">From sign-up to trophy, in four steps</h2>
            <p className="text-ink-600 text-base leading-relaxed">
              The same loop, every week, all season. Show up enough times and the ranking does the talking for you.
            </p>
          </div>
          <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-5 mt-12">
            {steps.map((s) => (
              <Card key={s.num} className="p-6">
                <div className="inline-block font-mono text-xs font-bold text-ball-ink bg-ball-500 px-2 py-[3px] rounded-md mb-3.5">
                  {s.num}
                </div>
                <h4 className="text-base font-bold mb-2">{s.title}</h4>
                <p className="text-[13.5px] text-ink-600 leading-relaxed">{s.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="rankings" className="pb-24 px-6">
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center max-w-[620px] mx-auto">
            <div className="inline-flex bg-court-100 text-court-800 text-xs font-extrabold uppercase tracking-wide px-3 py-[7px] rounded-full mb-3.5">
              Points System
            </div>
            <h2 className="font-display text-court-950 text-[36px] mb-3">Every match moves your rank</h2>
            <p className="text-ink-600 text-base leading-relaxed">
              Straightforward scoring, no hidden math — win convincingly, and it shows.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-11">
            <div className="rounded-2xl p-6 text-center bg-win-bg">
              <div className="font-display text-[44px] leading-none text-win">+25</div>
              <div className="text-[13px] font-bold text-ink-600 mt-1.5">Win</div>
            </div>
            <div className="rounded-2xl p-6 text-center bg-draw-bg">
              <div className="font-display text-[44px] leading-none text-[#8A6A0B]">+10</div>
              <div className="text-[13px] font-bold text-ink-600 mt-1.5">Draw</div>
            </div>
            <div className="rounded-2xl p-6 text-center bg-pending-bg">
              <div className="font-display text-[44px] leading-none text-pending">−10</div>
              <div className="text-[13px] font-bold text-ink-600 mt-1.5">Loss</div>
            </div>
          </div>
        </div>
      </section>

      <section id="sponsors" className="pb-24 px-6">
        <div className="max-w-[1080px] mx-auto text-center">
          <div className="inline-flex bg-court-100 text-court-800 text-xs font-extrabold uppercase tracking-wide px-3 py-[7px] rounded-full mb-3.5">
            Partner With Us
          </div>
          <h2 className="font-display text-court-950 text-[36px] mb-3 max-w-[620px] mx-auto">
            Get in front of Egypt&apos;s most active padel community
          </h2>
          <p className="text-ink-600 text-base leading-relaxed max-w-[620px] mx-auto mb-8">
            240+ engaged players, weekly sessions, and a leaderboard people actually check.
          </p>
          <Button href="/sponsors" variant="dark">Become a sponsor</Button>
        </div>
      </section>

      <footer id="contact" className="bg-court-950 text-white/60 px-6 pt-12 pb-7">
        <div className="max-w-[1080px] mx-auto flex justify-between gap-6 flex-wrap pb-7 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-ball-500" />
            <span className="font-display text-[22px] text-white">THE COURT</span>
          </div>
          <div className="flex gap-9 flex-wrap text-sm">
            <a href="mailto:hello@thecourt.eg" className="hover:text-ball-500">hello@thecourt.eg</a>
            <a href="#" className="hover:text-ball-500">Instagram</a>
          </div>
        </div>
        <div className="max-w-[1080px] mx-auto text-xs mt-5">© 2026 The Court, Egypt.</div>
      </footer>
    </>
  );
}
