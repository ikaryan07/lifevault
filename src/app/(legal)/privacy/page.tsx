import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Server } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — HomePin",
  description:
    "How HomePin protects your privacy and keeps your family's data safe.",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          Legal
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: 1 May 2026
        </p>
      </div>

      <div className="grid gap-4 not-prose sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <Lock className="h-5 w-5 text-primary" />
          <p className="mt-2 text-sm font-semibold">Zero-knowledge</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Your data is encrypted on your device. We can&apos;t read it.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <Server className="h-5 w-5 text-primary" />
          <p className="mt-2 text-sm font-semibold">Australian hosted</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Stored on Australian servers and never leaves the country.
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-foreground">
          The short version
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          HomePin was built on a simple principle: your family&apos;s most
          sensitive information should be readable only by you and the people
          you trust. We don&apos;t sell data, we don&apos;t track you across
          the web, and we cannot read the contents of your vault.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">
          What we collect
        </h2>
        <ul className="mt-3 space-y-2 text-base leading-relaxed text-muted-foreground">
          <li>
            <strong className="text-foreground">Your account email and name</strong>{" "}
            — to sign you in and send essential service emails.
          </li>
          <li>
            <strong className="text-foreground">Encrypted vault contents</strong>{" "}
            — passwords, documents, household info, and messages, stored in encrypted form. We cannot decrypt them.
          </li>
          <li>
            <strong className="text-foreground">Basic usage diagnostics</strong>{" "}
            — anonymous error logs to keep the service working. We do not track individual users across the web.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">
          What we don&apos;t do
        </h2>
        <ul className="mt-3 space-y-2 text-base leading-relaxed text-muted-foreground">
          <li>We never sell your data. Full stop.</li>
          <li>We never share your data with advertisers.</li>
          <li>We don&apos;t embed third-party trackers or ad networks.</li>
          <li>We don&apos;t access the contents of your vault.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">
          How we keep your data safe
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Files and sensitive data are encrypted with AES-256-GCM on your
          device before they leave it. Encryption keys are derived from your
          password — we never see them. Data is hosted in Australia on
          infrastructure that meets enterprise security standards (Supabase
          and Vercel).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">Your rights</h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          You can export or delete your data at any time from{" "}
          <Link href="/dashboard/settings" className="text-primary underline">
            Settings
          </Link>
          . Under the Australian Privacy Act 1988, you have the right to
          access, correct, or request deletion of your personal information.
          Contact us at{" "}
          <a
            href="mailto:privacy@HomePin.com.au"
            className="text-primary underline"
          >
            privacy@HomePin.com.au
          </a>{" "}
          for any privacy enquiry.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">Contact</h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Questions about this policy? Email{" "}
          <a
            href="mailto:privacy@HomePin.com.au"
            className="text-primary underline"
          >
            privacy@HomePin.com.au
          </a>
          .
        </p>
      </section>

      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <Shield className="h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-foreground">
          We update this policy when our practices change. We&apos;ll let you
          know by email before any meaningful update takes effect.
        </p>
      </div>
    </div>
  );
}
