import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — LifeVault",
  description: "The terms that apply when you use LifeVault.",
};

export default function TermsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          Legal
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: 1 May 2026
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-foreground">
          Welcome to LifeVault
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          By creating an account and using LifeVault, you agree to these
          terms. Please read them carefully. If anything&apos;s unclear, email{" "}
          <a
            href="mailto:support@lifevault.com.au"
            className="text-primary underline"
          >
            support@lifevault.com.au
          </a>{" "}
          and we&apos;ll explain.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">Your account</h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          You&apos;re responsible for keeping your password safe. Because
          LifeVault uses zero-knowledge encryption, we cannot recover your
          encrypted data if you lose your password. We&apos;ll always remind
          you to set up a recovery method when you sign up.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">
          Acceptable use
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          LifeVault is for personal and family use. You agree not to use the
          service to store illegal content, breach anyone&apos;s privacy, or
          attempt to compromise the security of our infrastructure.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">Subscriptions</h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Paid plans are billed monthly or annually. You can cancel anytime
          from{" "}
          <Link href="/dashboard/settings" className="text-primary underline">
            Settings
          </Link>{" "}
          — your plan will stay active until the end of the billing period
          and won&apos;t renew. We don&apos;t lock you in.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">
          Data ownership
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Your data is yours. We&apos;re custodians, not owners. You can
          export everything at any time, and deleting your account removes
          your data from our systems within 30 days.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">
          Limitation of liability
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          LifeVault is provided &ldquo;as is&rdquo;. While we work hard to keep
          the service running and your data safe, we can&apos;t guarantee
          uninterrupted service. Our liability is limited to the amount you
          paid us in the previous 12 months.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">
          Governing law
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          These terms are governed by the laws of Queensland, Australia. Any
          disputes will be handled in the courts of Queensland.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">Changes</h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          We&apos;ll let you know by email before making any material changes
          to these terms. Continued use of LifeVault after the changes take
          effect means you accept them.
        </p>
      </section>
    </div>
  );
}
