"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Heart, FolderLock, Users, ArrowRight, Wifi } from "lucide-react";
import { PageTransition } from "@/components/motion/page-transition";

const WELCOME_KEY = "lifevault:welcome-complete";

const steps = [
  {
    icon: Heart,
    title: "Welcome to LifeVault",
    description:
      "You've just taken an important step for your family. LifeVault is one place for everything your household shares — from WiFi passwords to important documents.",
    detail:
      "Everything you store here is encrypted. Only you and the people you choose can ever see your data. Not even us.",
  },
  {
    icon: Wifi,
    title: "Start with the Family Hub",
    description:
      "Save the everyday things first — your WiFi password, streaming logins, and household details. Your family can access these anytime.",
    detail:
      "It takes about two minutes. Once your shared accounts are in, you'll never have to text someone a password again.",
  },
  {
    icon: FolderLock,
    title: "Add legacy planning when you're ready",
    description:
      "When the time feels right, you can upload important documents like your will, super details, and insurance policies. There's no rush — do it at your own pace.",
    detail:
      "We'll guide you with simple checklists so you know exactly what to organise. Your family won't be left guessing.",
  },
  {
    icon: Users,
    title: "You're in control",
    description:
      "Choose who can see what and when. Give your partner access to shared passwords now, or set documents to be released to trusted contacts later.",
    detail:
      "You can change these settings any time. Nothing happens without your permission.",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(WELCOME_KEY) === "true") {
      router.replace("/dashboard");
    }
  }, [router]);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  function markComplete() {
    if (typeof window !== "undefined") {
      localStorage.setItem(WELCOME_KEY, "true");
    }
  }

  function handleNext() {
    if (isLast) {
      markComplete();
      router.push("/dashboard");
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handleSkip() {
    markComplete();
    router.push("/dashboard");
  }

  return (
    <PageTransition>
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <step.icon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{step.title}</CardTitle>
          <CardDescription className="mt-2 text-base leading-relaxed">
            {step.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {step.detail}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i === currentStep ? "bg-primary" : "bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleNext} className="w-full" size="lg">
              {isLast ? "Let's get started" : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {!isLast && (
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Skip introduction
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Shield className="h-4 w-4" />
        Your data is protected by AES-256 encryption
      </div>
    </div>
    </PageTransition>
  );
}
