import { Shield, Lock, Eye, Server, KeyRound, Users } from "lucide-react";

const securityPoints = [
  {
    icon: Lock,
    title: "AES-256 Encryption",
    description: "Your files are encrypted on your device before upload. The same standard used by banks and governments worldwide.",
  },
  {
    icon: Eye,
    title: "Zero-Knowledge Architecture",
    description: "We can never see your data. Not our staff, not our servers. Only you hold the keys.",
  },
  {
    icon: Server,
    title: "Australian Data Hosting",
    description: "Your data is stored in Sydney on Australian servers. It never leaves the country.",
  },
  {
    icon: KeyRound,
    title: "End-to-End Encrypted",
    description: "Passwords and sensitive data are encrypted from your browser to our database. No middleman can intercept them.",
  },
  {
    icon: Users,
    title: "Multi-Party Vault Access",
    description: "No single person can access your legacy vault. Multiple trusted contacts must confirm, with a mandatory waiting period.",
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Infrastructure",
    description: "Built on SOC 2-audited infrastructure (Supabase and Vercel) — trusted by thousands of companies globally.",
  },
];

export function Security() {
  return (
    <section id="security" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
            <Shield className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Security isn&apos;t a feature. It&apos;s the foundation.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            You&apos;re trusting us with your family&apos;s most sensitive information.
            We built LifeVault so that even we can&apos;t access your data.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {securityPoints.map((point) => (
            <div
              key={point.title}
              className="rounded-2xl border bg-card p-6 transition-all hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/5 hover:-translate-y-0.5"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <point.icon className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-foreground">
                {point.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
