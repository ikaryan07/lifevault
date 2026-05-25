"use client";

import Link from "next/link";
import { PageTransition } from "@/components/motion/page-transition";
import { PlanGate } from "@/components/subscription/plan-gate";
import { useVault } from "@/lib/store";
import { hasLegacyAccess } from "@/lib/plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, FileText } from "lucide-react";

const resources = [
  {
    title: "State Trustee — Wills & estates (VIC)",
    description: "Official guidance on wills, powers of attorney, and estate administration in Victoria.",
    href: "https://www.statetrustees.com.au/wills-and-estate-planning",
  },
  {
    title: "Australian Government — Death and bereavement",
    description: "Centrelink, Medicare, and practical steps after a death.",
    href: "https://www.servicesaustralia.gov.au/death-and-bereavement",
  },
  {
    title: "LawAccess NSW — Planning ahead",
    description: "Free legal information on enduring guardianship, powers of attorney, and advance care.",
    href: "https://www.lawaccess.nsw.gov.au/Pages/representing/planning_ahead/planning_ahead_overview.aspx",
  },
  {
    title: "Australian Red Cross — Emergency contacts",
    description: "Guidance on keeping emergency contact information accessible for your family.",
    href: "https://www.redcross.org.au/",
  },
];

export default function FormsLibraryPage() {
  const { plan } = useVault();

  if (!hasLegacyAccess(plan.id)) {
    return (
      <PageTransition>
        <PlanGate feature="forms_library" />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Forms & resources</h1>
          <p className="mt-1 text-muted-foreground">
            Helpful Australian links for wills, powers of attorney, and estate planning.
            HomePin does not provide legal advice — consult a professional for your situation.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((item) => (
            <Card key={item.href}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-primary" />
                  {item.title}
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  Open resource
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
