import Link from "next/link";
import { Shield, Users, Clock, Heart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HowAccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-bold text-primary">
            HomePin
          </Link>
          <Link href="/security" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Security
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">How vault access works</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            A plain-English guide to what happens when a trusted contact needs access to someone&apos;s vault.
          </p>
        </div>

        <ol className="space-y-6">
          <li className="flex gap-4 rounded-2xl border p-5">
            <Users className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold">1. You choose trusted contacts</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                While setting up HomePin, you invite people you trust — a partner, adult child, or
                executor. They receive an email and must accept before anything happens.
              </p>
            </div>
          </li>
          <li className="flex gap-4 rounded-2xl border p-5">
            <Shield className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold">2. Access is locked by default</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your legacy documents and contacts stay private. Trusted contacts cannot browse
                your vault during your lifetime unless you explicitly grant immediate access.
              </p>
            </div>
          </li>
          <li className="flex gap-4 rounded-2xl border p-5">
            <Heart className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold">3. Someone requests access</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                If something happens to you, a trusted contact scans the emergency card QR code or
                visits the access page. They sign in and submit a request with a brief reason.
              </p>
            </div>
          </li>
          <li className="flex gap-4 rounded-2xl border p-5">
            <Users className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold">4. Others must confirm</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Other trusted contacts receive an email. At least two must confirm the request is
                legitimate. Any contact can deny if they believe it&apos;s wrong.
              </p>
            </div>
          </li>
          <li className="flex gap-4 rounded-2xl border p-5">
            <Clock className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold">5. Access is granted carefully</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                After enough confirmations, access is approved (up to a 7-day waiting period).
                The requester gets read-only access to documents and key contacts — not family
                passwords unless you chose full access.
              </p>
            </div>
          </li>
        </ol>

        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-6">
          <h2 className="font-semibold">Inactivity check-ins</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            HomePin can email you if you haven&apos;t logged in for a while (14, 30, 60, or 90 days —
            you choose). This is a gentle nudge, not an automatic unlock. Trusted contacts are
            only notified if you&apos;ve configured that escalation path.
          </p>
        </div>

        <Link href="/vault-access" className={cn(buttonVariants(), "inline-flex")}>
          Vault access page
        </Link>
      </main>
    </div>
  );
}
