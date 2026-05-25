"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { HelpCircle, Shield, FolderLock, Users, Mail } from "lucide-react";
import { motion } from "framer-motion";

const faqs = [
  {
    icon: Shield,
    question: "Is my data safe?",
    answer:
      "Yes. Your documents are encrypted on your device before they're stored. This means nobody — not even us — can read your files. It's the same level of security banks use.",
  },
  {
    icon: FolderLock,
    question: "What happens to my documents if I stop paying?",
    answer:
      "Your documents are always yours. If you downgrade to the free plan, you can still access everything you've already uploaded. You just won't be able to add more beyond the free limit.",
  },
  {
    icon: Users,
    question: "How do trusted contacts get access?",
    answer:
      "When the time comes, your trusted contacts can request access. Other contacts must confirm, and there's a waiting period to prevent misuse. You can set this up in the Trusted People section.",
  },
  {
    icon: Mail,
    question: "I need help with something else",
    answer:
      "No worries! You can email us anytime at support@homepin.com.au and we'll get back to you within 24 hours. We're a small Australian team and we're happy to help.",
  },
];

export function HelpButtonDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How can we help?</DialogTitle>
          <DialogDescription>
            Common questions about HomePin. If you need more help, don&apos;t hesitate to reach out.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl border p-4 transition-colors open:bg-muted/50"
            >
              <summary className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-foreground">
                <faq.icon className="h-4 w-4 shrink-0 text-primary" />
                {faq.question}
              </summary>
              <p className="mt-3 pl-7 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Desktop-only floating help — mobile uses More → Help & FAQ */
export function HelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        className="fixed bottom-6 left-[17rem] z-40 hidden lg:block"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          size="lg"
          className="rounded-full px-4 shadow-lg"
        >
          <HelpCircle className="mr-2 h-5 w-5" />
          Need help?
        </Button>
      </motion.div>
      <HelpButtonDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
