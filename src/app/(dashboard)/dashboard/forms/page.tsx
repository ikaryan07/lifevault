"use client";

import Link from "next/link";
import { PageTransition } from "@/components/motion/page-transition";
import { PlanGate } from "@/components/subscription/plan-gate";
import { useVault } from "@/lib/store";
import { hasLegacyAccess } from "@/lib/plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, FileText } from "lucide-react";

const stateResources = [
  {
    state: "Victoria",
    links: [
      { title: "State Trustees — Wills & POA", href: "https://www.statetrustees.com.au/wills-and-estate-planning" },
      { title: "Office of the Public Advocate (VIC)", href: "https://www.publicadvocate.vic.gov.au/" },
    ],
  },
  {
    state: "New South Wales",
    links: [
      { title: "LawAccess NSW — Planning ahead", href: "https://www.lawaccess.nsw.gov.au/Pages/representing/planning_ahead/planning_ahead_overview.aspx" },
      { title: "NSW Trustee & Guardian", href: "https://www.tag.nsw.gov.au/" },
    ],
  },
  {
    state: "Queensland",
    links: [
      { title: "QLD Public Trustee — Wills", href: "https://www.pt.qld.gov.au/wills" },
      { title: "Office of the Public Guardian (QLD)", href: "https://www.publicguardian.qld.gov.au/" },
    ],
  },
  {
    state: "Western Australia",
    links: [
      { title: "WA Public Trustee", href: "https://www.publictrustee.wa.gov.au/" },
      { title: "Office of the Public Advocate (WA)", href: "https://www.publicadvocate.wa.gov.au/" },
    ],
  },
  {
    state: "South Australia",
    links: [
      { title: "SA Public Trustee", href: "https://www.publictrustee.sa.gov.au/" },
      { title: "Office of the Public Advocate (SA)", href: "https://www.opa.sa.gov.au/" },
    ],
  },
  {
    state: "Tasmania",
    links: [
      { title: "Public Trustee Tasmania", href: "https://www.publictrustee.tas.gov.au/" },
    ],
  },
  {
    state: "ACT",
    links: [
      { title: "Public Trustee & Guardian (ACT)", href: "https://www.ptg.act.gov.au/" },
    ],
  },
  {
    state: "Northern Territory",
    links: [
      { title: "Office of the Public Guardian (NT)", href: "https://nt.gov.au/law/legal-aid/public-guardian" },
    ],
  },
];

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

        <div>
          <h2 className="text-lg font-semibold">National resources</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
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

        <div>
          <h2 className="text-lg font-semibold">State & territory guides</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Wills, powers of attorney, and guardianship rules vary by state — start with your local authority.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {stateResources.map((section) => (
              <Card key={section.state}>
                <CardHeader>
                  <CardTitle className="text-base">{section.state}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      {link.title}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
