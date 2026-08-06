import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/actions/auth";

const links = [
  { href: "/admin/sessions/new", label: "New Session" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/cms", label: "Site Content" },
];

/**
 * Wraps every /admin/* page. Redirects anyone who isn't role=admin back to
 * the player dashboard — this is the guard that was missing before; the
 * admin pages worked but anyone with the URL could technically reach them.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-black/[0.08] bg-court-950">
        <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 py-4">
              <span className="w-3 h-3 rounded-full bg-ball-500" />
              <span className="font-display text-lg tracking-wide text-white">THE COURT ADMIN</span>
            </Link>
            <nav className="flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] font-semibold text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-[13px] font-semibold text-white/70 hover:text-white">
              Player view
            </Link>
            <form action={signOut}>
              <button className="text-[13px] font-semibold text-white/70 hover:text-white">Log out</button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
