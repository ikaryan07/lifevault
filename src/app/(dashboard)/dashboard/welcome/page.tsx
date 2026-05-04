"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Heart, FolderLock, Users, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Heart,
    title: "Welcome to LifeVault",
    description:
      "You've just taken an important step to protect your family. LifeVault helps you organise all your important documents in one safe place, so your loved ones aren't left guessing.",
    detail:
      "Everything you store here is encrypted — that means only you (and the people you choose) can ever see it. Not even us.",
  },
  {
    icon: FolderLock,
    title: "How it works",
    description:
      "Think of LifeVault like a secure filing cabinet that your family can access when they need to. You'll upload important documents like your will, insurance policies, and bank details.",
    detail:
      "We'll guide you with simple checklists so you know exactly what to organise. There's no rush — you can do a little bit at a time.",
  },
  {
    icon: Users,
    title: "You're in control",
    description:
      "You choose who can see your documents and when. You might give your daughter full access now, or set things up so your son only gets access later.",
    detail:
      "You can change these settings any time. Nothing happens without your permission.",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  function handleNext() {
    if (isLast) {
      router.push("/dashboard");
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handleSkip() {
    router.push("/dashboard");
  }

  return (
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
        Your data is protected by bank-grade encryption
      </div>
    </div>
  );
}
