"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Eye, EyeOff, Check, Sparkles } from "lucide-react";
import { completeDemoSignUp, signUpClient } from "@/lib/auth/client";
import { startPlanTrial } from "@/lib/actions/subscription";
import { storageKeys } from "@/lib/storage-keys";
import type { PlanId } from "@/lib/plans";

const planLabels: Record<string, { name: string; tagline: string }> = {
  family: { name: "Family", tagline: "14-day free trial — no card required" },
  legacy: { name: "Legacy", tagline: "14-day free trial — no card required" },
};

const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

function passwordIsValid(p: string) {
  return passwordRequirements.every((r) => r.test(p));
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; tagline: string } | null>(
    null
  );
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const planKey = params.get("plan") || "";
    if (planLabels[planKey]) {
      setSelectedPlan(planLabels[planKey]);
    }
    const join = params.get("join") || params.get("code");
    if (join) setJoinCode(join);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!passwordIsValid(password)) {
      setError("Please choose a password that meets all the requirements below.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const firstName = (formData.get("firstName") as string)?.trim() ?? "";
    const lastName = (formData.get("lastName") as string)?.trim() ?? "";
    const email = (formData.get("email") as string)?.trim() ?? "";

    try {
      const result = await signUpClient(firstName, lastName, email, password);

      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }

      if ("success" in result && result.success === "demo") {
        completeDemoSignUp(firstName, lastName, email);
        const planKey = new URLSearchParams(window.location.search).get("plan");
        if (planKey === "family" || planKey === "legacy") {
          localStorage.setItem(storageKeys.plan, JSON.stringify(planKey));
        }
        window.location.href = "/dashboard/welcome";
        return;
      }

      if (
        "success" in result &&
        result.success === true &&
        "hasSession" in result &&
        result.hasSession
      ) {
        const planKey = new URLSearchParams(window.location.search).get("plan") as PlanId | null;
        if (planKey === "family" || planKey === "legacy") {
          await startPlanTrial(planKey);
        }
        const destination = joinCode
          ? `/join-family?code=${encodeURIComponent(joinCode)}`
          : "/dashboard/welcome";
        window.location.href = destination;
        return;
      }

      if ("success" in result && result.success === "verify_email") {
        sessionStorage.setItem("homepin:pending-email", email);
        window.location.href = "/verify-email";
        return;
      }

      setError("Sign up failed. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8 lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">HomePin</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Create your vault</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start organising your important documents today. Free to get started.
        </p>
      </div>

      {joinCode && (
        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
          <p className="font-semibold text-foreground">Joining a family vault</p>
          <p className="mt-1 text-muted-foreground">
            After you create your account, you&apos;ll be added to the family automatically.
          </p>
        </div>
      )}

      {selectedPlan && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 text-sm">
            <p className="font-semibold text-foreground">{selectedPlan.name} plan selected</p>
            <p className="text-xs text-muted-foreground">{selectedPlan.tagline}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="First name"
              required
              autoComplete="given-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Last name"
              required
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <ul className="mt-2 space-y-1" aria-label="Password requirements">
              {passwordRequirements.map((req) => {
                const passed = req.test(password);
                return (
                  <li
                    key={req.label}
                    className={`flex items-center gap-2 text-xs transition-colors ${
                      passed ? "text-green-600" : "text-muted-foreground"
                    }`}
                  >
                    <Check className={`h-3 w-3 ${passed ? "opacity-100" : "opacity-40"}`} />
                    {req.label}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading || (password.length > 0 && !passwordIsValid(password))}
        >
          {loading ? "Creating vault..." : "Create your vault"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login?force=1" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
