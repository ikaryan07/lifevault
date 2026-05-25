"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, ArrowRight, Mail } from "lucide-react";
import { resendVerificationEmail } from "@/lib/auth/client";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { pendingJoinRedirectPath } from "@/lib/auth/pending-join";
import { loginPathWithNext } from "@/lib/auth/safe-redirect";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");
  const [postAuthNext, setPostAuthNext] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("homepin:pending-email");
    if (stored) setEmail(stored);
    setPostAuthNext(pendingJoinRedirectPath());
  }, []);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    setResending(true);
    setError("");
    setResent(false);

    const result = await resendVerificationEmail(email, postAuthNext ?? undefined);
    if ("error" in result && result.error) {
      setError(result.error);
    } else {
      setResent(true);
    }
    setResending(false);
  }

  const loginHref = loginPathWithNext(postAuthNext);

  return (
    <div className="text-center">
      <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <MapPin className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-foreground">HomePin</span>
      </Link>

      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Mail className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
      <p className="mx-auto mt-3 max-w-sm text-base text-muted-foreground">
        We&apos;ve sent a verification link{email ? ` to ${email}` : ""}. Click the link to
        activate your vault
        {postAuthNext?.startsWith("/join-family") ? " and join your family" : ""}.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        It may take a minute to arrive. Check your spam folder if you don&apos;t see it.
      </p>

      {isSupabaseConfigured() && (
        <form onSubmit={handleResend} className="mx-auto mt-8 max-w-sm space-y-3 text-left">
          <div>
            <Label htmlFor="resend-email">Didn&apos;t get it? Resend to:</Label>
            <Input
              id="resend-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1"
              required
            />
          </div>
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {resent && (
            <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-700">
              Verification email sent again.
            </p>
          )}
          <Button type="submit" variant="outline" className="w-full" disabled={resending}>
            {resending ? "Sending..." : "Resend verification email"}
          </Button>
        </form>
      )}

      <div className="mt-8">
        <Link href={loginHref} className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
          Continue to sign in
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
