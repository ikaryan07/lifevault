import { Upload, UserPlus, CheckCircle, KeyRound } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload your documents",
    description:
      "Add your will, insurance policies, super statements, and other important documents. They're encrypted on your device before upload.",
  },
  {
    number: "02",
    icon: UserPlus,
    title: "Add trusted contacts",
    description:
      "Invite family members or trusted people. Choose their access level — immediate, limited, or only after you pass.",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Work through the checklists",
    description:
      "Our guided checklists help you make sure nothing is missed. From updating your will to organising your digital accounts.",
  },
  {
    number: "04",
    icon: KeyRound,
    title: "Your family is prepared",
    description:
      "When the time comes, your trusted contacts can access everything they need. Step-by-step guidance helps them through the process.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Getting started takes just a few minutes. LifeVault guides you
            through every step.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Step {step.number}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
