import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[420px]">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8">
          <span className="w-3 h-3 rounded-full bg-ball-500" />
          <span className="font-display text-2xl tracking-wide text-court-950">THE COURT</span>
        </Link>

        <Card className="p-7">
          <h1 className="font-display text-[26px] text-court-950 mb-1">Welcome back</h1>
          <p className="text-sm text-ink-600 mb-6">Log in to see your rank and join the next session.</p>

          {searchParams.error && (
            <div className="bg-loss-bg text-loss text-sm rounded-lg px-3 py-2.5 mb-4">
              {searchParams.error}
            </div>
          )}

          <form action={signIn}>
            <Input id="email" name="email" type="email" label="Email" placeholder="you@email.com" required />
            <Input id="password" name="password" type="password" label="Password" required />
            <Button type="submit" variant="primary" className="w-full justify-center mt-2">
              Log in
            </Button>
          </form>

          <p className="text-center text-sm text-ink-600 mt-5">
            New here?{" "}
            <Link href="/register" className="text-court-800 font-bold">
              Create an account
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
