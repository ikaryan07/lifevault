import {
  Shield,
  FolderLock,
  Users,
  ClipboardCheck,
  Bell,
  FileText,
} from "lucide-react";

const features = [
  {
    icon: FolderLock,
    title: "Encrypted Document Vault",
    description:
      "Your documents are encrypted before they leave your device. Even we can't read them. Bank-grade security for your most sensitive files.",
  },
  {
    icon: Users,
    title: "Trusted Contacts",
    description:
      "Designate family members or trusted people who can access your vault when the time comes. Full control over who sees what.",
  },
  {
    icon: ClipboardCheck,
    title: "Guided Checklists",
    description:
      "Step-by-step guides for what to organise now and what your family needs to do later. No more guessing in a difficult time.",
  },
  {
    icon: Shield,
    title: "Secure Access Handoff",
    description:
      "Multi-party confirmation ensures your vault is only unlocked when it should be. Built-in safeguards prevent misuse.",
  },
  {
    icon: FileText,
    title: "Australian Forms & Guides",
    description:
      "Pre-filled templates for Centrelink, ATO, super funds, and more. Tailored to Australian processes and requirements.",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description:
      "Gentle nudges to keep your documents current. \"Your will was last updated 3 years ago\" — because life changes.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t bg-card py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything your family needs, in one safe place
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            LifeVault goes beyond simple storage. It&apos;s a complete system
            for organising, protecting, and passing on what matters.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border bg-background p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
