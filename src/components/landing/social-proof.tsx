import { Shield, Star, Users } from "lucide-react";

const stats = [
  { value: "2,400+", label: "Australian families", icon: Users },
  { value: "4.9/5", label: "User satisfaction", icon: Star },
  { value: "99.9%", label: "Uptime reliability", icon: Shield },
];

export function SocialProof() {
  return (
    <section className="border-t bg-muted/30 py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Trusted by families across Australia
        </p>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
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
