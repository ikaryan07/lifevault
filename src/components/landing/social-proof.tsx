import { Shield, Heart, Users } from "lucide-react";

const highlights = [
  {
    value: "1 subscription",
    label: "Covers your whole household",
    icon: Users,
  },
  {
    value: "AES-256",
    label: "Encrypted family data",
    icon: Shield,
  },
  {
    value: "Australian-made",
    label: "Built for local families",
    icon: Heart,
  },
];

export function SocialProof() {
  return (
    <section className="border-t bg-muted/30 py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Built for Australian families
        </p>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {highlights.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
