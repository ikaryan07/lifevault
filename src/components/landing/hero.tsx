import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Shield,
  ArrowRight,
  Wifi,
  KeyRound,
  FolderLock,
  Lock,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32 lg:pt-36 lg:pb-40">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Copy */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Shield className="h-4 w-4" />
              Secure. Private. Australian-made.
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
              One place for your family&apos;s
              <span className="relative ml-2 text-primary">
                passwords
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 200 8"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 5.5C40 2 70 2 100 4.5C130 7 160 5 199 2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-primary/40"
                  />
                </svg>
              </span>{" "}
              and{" "}
              <span className="text-primary">future.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Stop texting WiFi passwords and hunting for Netflix logins.
              HomePin keeps your family&apos;s shared accounts, household info,
              and important documents in one secure place — today and for the future.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 text-base"
                )}
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "text-base"
                )}
              >
                See how it works
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-green-500" />
                Free forever plan
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-green-500" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-green-500" />
                Bank-grade encryption
              </span>
            </div>
          </div>

          {/* Right: App Preview */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative rounded-2xl border bg-card p-1 shadow-2xl shadow-primary/10">
              <div className="rounded-xl bg-background p-5">
                {/* Mini app header */}
                <div className="mb-5 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                    <Shield className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-bold">HomePin</span>
                  <div className="ml-auto flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-red-400" />
                    <div className="h-2 w-2 rounded-full bg-yellow-400" />
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                  </div>
                </div>

                {/* Family Hub preview */}
                <div className="mb-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-blue-500">
                    Family Hub
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                        <Wifi className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold">Home WiFi</p>
                        <p className="text-[10px] text-muted-foreground">TelstraNet_5G</p>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">••••••••</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                        <KeyRound className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold">Netflix</p>
                        <p className="text-[10px] text-muted-foreground">family@email.com</p>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">••••••••</span>
                    </div>
                  </div>
                </div>

                {/* Legacy Vault preview */}
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Legacy Vault
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <FolderLock className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold">Family Will</p>
                        <p className="text-[10px] text-muted-foreground">Updated 2 weeks ago</p>
                      </div>
                      <Lock className="h-3 w-3 text-green-500" />
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 opacity-80">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                        <Shield className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold">Life Insurance</p>
                        <p className="text-[10px] text-muted-foreground">AMP Policy #4829</p>
                      </div>
                      <Lock className="h-3 w-3 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute left-2 top-6 hidden rounded-xl border bg-card px-3 py-2 shadow-lg sm:flex sm:-left-4 sm:top-8 lg:-left-8">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10">
                  <Lock className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-xs font-semibold">AES-256 Encrypted</span>
              </div>
            </div>
            <div className="absolute right-2 bottom-10 hidden rounded-xl border bg-card px-3 py-2 shadow-lg sm:flex sm:-right-2 sm:bottom-12 lg:-right-6">
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">🇦🇺</span>
                <span className="text-xs font-semibold">Australian hosted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
