import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function RegisterPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[420px]">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8">
          <span className="w-3 h-3 rounded-full bg-ball-500" />
          <span className="font-display text-2xl tracking-wide text-court-950">THE COURT</span>
        </Link>

        <Card className="p-7">
          <h1 className="font-display text-[26px] text-court-950 mb-1">Create your account</h1>
          <p className="text-sm text-ink-600 mb-6">Join the community and register for your first session.</p>

          {searchParams.error && (
            <div className="bg-loss-bg text-loss text-sm rounded-lg px-3 py-2.5 mb-4">
              {searchParams.error}
            </div>
          )}

          <form action={signUp}>
            <Input id="fullName" name="fullName" label="Full name" placeholder="Karim Adel" required />
            <Input id="email" name="email" type="email" label="Email" placeholder="you@email.com" required />
            <Input id="password" name="password" type="password" label="Password" minLength={6} required />
            <div className="mb-4">
              <label className="block text-[11.5px] font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                Skill level
              </label>
              <select
                name="skillLevel"
                defaultValue="beginner"
                className="w-full text-sm px-3 py-[9px] rounded-lg border border-black/10 bg-white text-ink-900"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="pro">Pro</option>
              </select>
            </div>
            <Button type="submit" variant="primary" className="w-full justify-center mt-2">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-ink-600 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-court-800 font-bold">
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
