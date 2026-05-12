import {
  Shield,
  FolderLock,
  Users,
  ClipboardCheck,
  Bell,
  KeyRound,
  Home,
  Wifi,
  Copy,
  QrCode,
  Video,
} from "lucide-react";

const hubFeatures = [
  {
    icon: KeyRound,
    title: "Shared Passwords",
    description: "WiFi, Netflix, Stan, utilities — one tap to copy. No more texting passwords around the house.",
  },
  {
    icon: Home,
    title: "Household Info",
    description: "Emergency numbers, doctor details, school info, utility accounts — always there when someone needs it.",
  },
  {
    icon: Copy,
    title: "Tap to Copy",
    description: "One tap copies any password or detail to your clipboard. Fast, simple, and secure.",
  },
];

const vaultFeatures = [
  {
    icon: FolderLock,
    title: "Encrypted Documents",
    description: "Wills, insurance, super, property deeds — encrypted on your device before upload. Even we can't read them.",
  },
  {
    icon: Users,
    title: "Trusted Contacts",
    description: "Choose who gets access and when. Multi-party confirmation prevents misuse. You stay in control.",
  },
  {
    icon: ClipboardCheck,
    title: "Planning Checklists",
    description: "Step-by-step Australian guides for before and after. No more guessing in a difficult time.",
  },
  {
    icon: Video,
    title: "Messages for Loved Ones",
    description: "Record video, audio, or write letters to be delivered to your family when the time comes.",
  },
  {
    icon: QrCode,
    title: "Emergency Access Card",
    description: "Print a wallet card with QR code so your family can find your vault in an emergency.",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Gentle nudges when documents are outdated or it's been a while since you checked in.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t">
      {/* Family Hub */}
      <div className="bg-gradient-to-b from-blue-500/5 to-background py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Wifi className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-bold uppercase tracking-widest text-blue-500">
              Family Hub
            </span>
          </div>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              The stuff your family uses every single day
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No more yelling &ldquo;what&apos;s the WiFi password?&rdquo; across the house.
              Every shared login and household detail, always at your fingertips.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {hubFeatures.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border bg-card p-6 transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-blue-500 group-hover:text-white">
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
      </div>

      {/* Legacy Vault */}
      <div className="bg-gradient-to-b from-background to-primary/5 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold uppercase tracking-widest text-primary">
              Legacy Vault
            </span>
          </div>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Protect the people you love, for when it matters most
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Important documents, funeral wishes, trusted contacts — organised and
              encrypted so your family never has to scramble during the hardest time of their lives.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vaultFeatures.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
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
      </div>
    </section>
  );
}
