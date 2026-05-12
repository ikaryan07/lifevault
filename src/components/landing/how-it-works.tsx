import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Wifi, Upload, CheckCircle, Heart, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    icon: Wifi,
    color: "bg-blue-500/10 text-blue-600",
    title: "Save your shared passwords",
    description:
      "Start with the everyday stuff — your WiFi password, streaming logins, household accounts. Takes two minutes. Immediately useful.",
    time: "2 minutes",
  },
  {
    number: "02",
    icon: Upload,
    color: "bg-primary/10 text-primary",
    title: "Upload important documents",
    description:
      "When you're ready, add your will, insurance policies, super statements. Everything is encrypted on your device before it's stored.",
    time: "10 minutes",
  },
  {
    number: "03",
    icon: CheckCircle,
    color: "bg-amber-500/10 text-amber-600",
    title: "Work through the checklists",
    description:
      "Our guided checklists walk you through everything — updating your will, binding super nominations, organising digital accounts.",
    time: "At your pace",
  },
  {
    number: "04",
    icon: Heart,
    color: "bg-green-500/10 text-green-600",
    title: "Your family is covered",
    description:
      "Your household has shared passwords anytime. Your trusted contacts have everything they need, when the time comes.",
    time: "Peace of mind",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t bg-card py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Up and running in minutes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start with the passwords your family shares every day.
            Add legacy planning whenever you&apos;re ready — no pressure.
          </p>
        </div>

        <div className="mt-16 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-0">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connecting line (desktop) */}
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-8 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-border via-border to-transparent lg:block" />
              )}

              <div className="relative flex gap-4 lg:flex-col lg:items-center lg:text-center lg:px-4">
                {/* Number + Icon */}
                <div className="relative z-10">
                  <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl", step.color)}>
                    <step.icon className="h-7 w-7" />
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                    {step.number}
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 pb-4 lg:pb-0 lg:mt-5">
                  <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground mb-2">
                    {step.time}
                  </span>
                  <h3 className="text-base font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: "lg" }), "gap-2 text-base")}
          >
            Get started for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
