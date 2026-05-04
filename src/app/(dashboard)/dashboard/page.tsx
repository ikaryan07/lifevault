"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FolderLock,
  Users,
  ClipboardCheck,
  ArrowRight,
  Upload,
  UserPlus,
  Heart,
  Sparkles,
} from "lucide-react";

const quickActions = [
  {
    icon: Upload,
    label: "Upload a document",
    description: "Add a will, policy, or certificate",
    href: "/dashboard/vault",
  },
  {
    icon: UserPlus,
    label: "Add a trusted person",
    description: "Someone your family can rely on",
    href: "/dashboard/contacts",
  },
  {
    icon: ClipboardCheck,
    label: "Work through checklist",
    description: "One step at a time, no rush",
    href: "/dashboard/checklist",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 p-6">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back
            </h1>
            <p className="mt-1 text-base text-muted-foreground">
              Every little step you take here helps protect your family.
              There&apos;s no rush — go at your own pace.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <FolderLock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                  Documents
                </CardDescription>
                <CardTitle className="text-3xl">0</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              5 free uploads available
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                  Trusted People
                </CardDescription>
                <CardTitle className="text-3xl">0</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add someone you trust
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <ClipboardCheck className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                  Checklist
                </CardDescription>
                <CardTitle className="text-3xl">0%</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-2.5 w-full rounded-full bg-muted">
              <div
                className="h-2.5 rounded-full bg-amber-500 transition-all"
                style={{ width: "0%" }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* What to do next */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">What would you like to do?</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex flex-col gap-3 rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <action.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
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
          ))}
        </div>
      </div>

      {/* Getting Started Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your first steps</CardTitle>
          <CardDescription>
            Complete these three things and you&apos;re off to a great start.
            Each one only takes a few minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {[
              {
                step: 1,
                title: "Upload your first document",
                description:
                  "Start with anything — your will, an insurance policy, or even a simple list of accounts.",
                href: "/dashboard/vault",
              },
              {
                step: 2,
                title: "Add someone you trust",
                description:
                  "This could be your partner, a child, or your solicitor. You choose what they can see.",
                href: "/dashboard/contacts",
              },
              {
                step: 3,
                title: "Check off one item on the checklist",
                description:
                  "Just one! Every step forward counts.",
                href: "/dashboard/checklist",
              },
            ].map((item) => (
              <li key={item.step}>
                <Link
                  href={item.href}
                  className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-primary/30 hover:bg-muted/50"
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
    </div>
  );
}
