"use client";

import { useVault } from "@/lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  FolderLock,
  Users,
  ClipboardCheck,
  ArrowRight,
  Upload,
  Heart,
  Sparkles,
  Trophy,
  KeyRound,
  Home,
  Wifi,
} from "lucide-react";
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/page-transition";
import { FamilySetupProgress } from "@/components/dashboard/family-setup-progress";

const BEFORE_TOTAL = 16;
const AFTER_TOTAL = 19;

export default function DashboardPage() {
  const {
    documents,
    trustedContacts,
    checklist,
    profile,
    plan,
    sharedCredentials,
    householdInfo,
    isHydrated,
    cloudMode,
  } = useVault();

  if (!isHydrated) {
    return (
      <div className="flex h-64 items-center justify-center" role="status" aria-label="Loading">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const beforeCompleted = Object.values(checklist.before).filter(Boolean).length;
  const afterCompleted = Object.values(checklist.after).filter(Boolean).length;
  const totalChecklist = BEFORE_TOTAL + AFTER_TOTAL;
  const totalCompleted = beforeCompleted + afterCompleted;
  const checklistPercent = Math.round((totalCompleted / totalChecklist) * 100);

  const docCount = documents.length;
  const contactCount = trustedContacts.length;
  const credCount = sharedCredentials.length;
  const householdCount = householdInfo.length;

  function limitLabel(count: number, limit: number) {
    return isFinite(limit) ? `${count}/${limit}` : `${count}`;
  }

  const firstName = profile?.firstName || "there";

  const hasAnyProgress =
    docCount > 0 || contactCount > 0 || totalCompleted > 0 || credCount > 0 || householdCount > 0;

  return (
    <PageTransition>
      <div className="space-y-6 sm:space-y-8">
        {/* Greeting */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
              {hasAnyProgress ? (
                <Trophy className="h-7 w-7 text-primary" />
              ) : (
                <Heart className="h-7 w-7 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {hasAnyProgress
                  ? `Great progress, ${firstName}!`
                  : `Welcome, ${firstName}`}
              </h1>
              <p className="mt-1.5 text-base text-muted-foreground sm:text-lg">
                {hasAnyProgress
                  ? "Everything your family needs — all in one secure place."
                  : "One place for your family's passwords, important info, and future planning."}
              </p>
            </div>
          </div>
        </div>

        <FamilySetupProgress />

        {/* Family Hub Section */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Wifi className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold">Family Hub</h2>
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Everyday
            </span>
          </div>
          <StaggerContainer className="grid gap-4 sm:grid-cols-2">
            <StaggerItem>
              <Link
                href="/dashboard/family/passwords"
                className="group flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 transition-colors group-hover:bg-blue-500">
                  <KeyRound className="h-6 w-6 text-blue-600 transition-colors group-hover:text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-foreground">
                      Passwords & Logins
                    </p>
                    {credCount > 0 && (
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-600">
                        {limitLabel(credCount, plan.limits.passwords)}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {credCount === 0
                      ? "Save your WiFi, Netflix, and shared logins"
                      : `${limitLabel(credCount, plan.limits.passwords)} saved ${credCount === 1 ? "login" : "logins"}`}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground/60" />
              </Link>
            </StaggerItem>

            <StaggerItem>
              <Link
                href="/dashboard/family/household"
                className="group flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-0.5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 transition-colors group-hover:bg-purple-500">
                  <Home className="h-6 w-6 text-purple-600 transition-colors group-hover:text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-foreground">
                      Household Info
                    </p>
                    {householdCount > 0 && (
                      <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-bold text-purple-600">
                        {limitLabel(householdCount, plan.limits.household)}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {householdCount === 0
                      ? "Addresses, emergency numbers, providers"
                      : `${limitLabel(householdCount, plan.limits.household)} saved ${householdCount === 1 ? "item" : "items"}`}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground/60" />
              </Link>
            </StaggerItem>

            {cloudMode && (
              <StaggerItem>
                <Link
                  href="/dashboard/family/members"
                  className="group flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 hover:-translate-y-0.5 sm:col-span-2"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 transition-colors group-hover:bg-teal-500">
                    <Users className="h-6 w-6 text-teal-600 transition-colors group-hover:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-foreground">
                      Family Members
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Invite your partner or kids — everyone sees the same passwords
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground/60" />
                </Link>
              </StaggerItem>
            )}
          </StaggerContainer>
        </div>

        {/* Legacy Vault Section */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <FolderLock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Legacy Vault</h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Future Planning
            </span>
          </div>
          <StaggerContainer className="grid gap-4 sm:grid-cols-3">
            <StaggerItem>
              <Link
                href="/dashboard/vault"
                className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
              >
                <Card className="relative h-full overflow-hidden border-none shadow-md transition-all group-hover:shadow-lg group-hover:-translate-y-0.5">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
                  <CardHeader className="relative pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
                        <FolderLock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                          Documents
                        </CardDescription>
                        <CardTitle className="text-3xl">{limitLabel(docCount, plan.limits.documents)}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-sm text-muted-foreground">
                      {docCount === 0
                        ? "Upload your first document"
                        : `${docCount === 1 ? "document" : "documents"} saved`}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>

            <StaggerItem>
              <Link
                href="/dashboard/contacts"
                className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
              >
                <Card className="relative h-full overflow-hidden border-none shadow-md transition-all group-hover:shadow-lg group-hover:-translate-y-0.5">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
                  <CardHeader className="relative pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 transition-colors group-hover:bg-green-500/20">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                          Trusted People
                        </CardDescription>
                        <CardTitle className="text-3xl">{limitLabel(contactCount, plan.limits.trustedContacts)}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-sm text-muted-foreground">
                      {contactCount === 0
                        ? "Add someone you trust"
                        : `${contactCount === 1 ? "person" : "people"} connected`}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>

            <StaggerItem>
              <Link
                href="/dashboard/checklist"
                className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
              >
                <Card className="relative h-full overflow-hidden border-none shadow-md transition-all group-hover:shadow-lg group-hover:-translate-y-0.5">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
                  <CardHeader className="relative pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 transition-colors group-hover:bg-amber-500/20">
                        <ClipboardCheck className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                          Checklist
                        </CardDescription>
                        <CardTitle className="text-3xl">
                          {checklistPercent}%
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
                        style={{ width: `${checklistPercent}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          </StaggerContainer>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              What would you like to do?
            </h2>
          </div>
          <StaggerContainer className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: KeyRound,
                label: "Save a password",
                description: "WiFi, streaming, or any shared login",
                href: "/dashboard/family/passwords",
                color: "bg-blue-500/10 group-hover:bg-blue-500",
                iconColor: "text-blue-600 group-hover:text-white",
              },
              {
                icon: Upload,
                label: "Upload a document",
                description: "A will, policy, or certificate",
                href: "/dashboard/vault",
                color: "bg-primary/10 group-hover:bg-primary",
                iconColor: "text-primary group-hover:text-primary-foreground",
              },
              {
                icon: ClipboardCheck,
                label: "Work through checklist",
                description: "One step at a time, no rush",
                href: "/dashboard/checklist",
                color: "bg-amber-500/10 group-hover:bg-amber-500",
                iconColor: "text-amber-600 group-hover:text-white",
              },
            ].map((action) => (
              <StaggerItem key={action.label}>
                <Link
                  href={action.href}
                  className="group flex h-full flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${action.color}`}>
                    <action.icon className={`h-6 w-6 transition-colors ${action.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      {action.label}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center gap-1 text-sm font-medium text-primary">
                    Get started <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* Getting Started — only show if user hasn't done much yet */}
        {!hasAnyProgress && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Your first steps</CardTitle>
              <CardDescription>
                Start with the everyday stuff, then tackle the bigger picture when you&apos;re ready.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  {
                    step: 1,
                    title: "Save your WiFi password",
                    description:
                      "The thing everyone in your house asks for. Save it once, never repeat it again.",
                    href: "/dashboard/family/passwords",
                  },
                  {
                    step: 2,
                    title: "Add a streaming login",
                    description:
                      "Netflix, Stan, Disney+ — keep all your shared logins in one spot.",
                    href: "/dashboard/family/passwords",
                  },
                  {
                    step: 3,
                    title: "Upload an important document",
                    description:
                      "A will, insurance policy, or certificate — whenever you're ready.",
                    href: "/dashboard/vault",
                  },
                ].map((item) => (
                  <li key={item.step}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-primary/30 hover:bg-muted/50 hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
