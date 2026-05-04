"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardCheck, CheckCircle2, Circle, PartyPopper } from "lucide-react";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
}

const beforeItems: ChecklistItem[] = [
  {
    id: "will",
    label: "Create or update your will",
    description:
      "Ensure your will is current, signed, and witnessed. Upload a copy to your vault.",
    completed: false,
  },
  {
    id: "poa",
    label: "Set up Power of Attorney",
    description:
      "Appoint someone to make legal/financial decisions if you become incapacitated.",
    completed: false,
  },
  {
    id: "medical",
    label: "Advance Care Directive",
    description:
      "Document your medical treatment preferences and appoint a medical decision maker.",
    completed: false,
  },
  {
    id: "super",
    label: "Review super beneficiaries",
    description:
      "Check your superannuation binding death benefit nomination is up to date.",
    completed: false,
  },
  {
    id: "insurance",
    label: "Document insurance policies",
    description:
      "List all life, income protection, home, car, and health insurance policies.",
    completed: false,
  },
  {
    id: "banking",
    label: "List all bank accounts and debts",
    description:
      "Document every bank account, credit card, mortgage, and loan.",
    completed: false,
  },
  {
    id: "property",
    label: "Organise property documents",
    description:
      "Gather title deeds, mortgage documents, and rental agreements.",
    completed: false,
  },
  {
    id: "digital",
    label: "Document digital accounts",
    description:
      "List important online accounts, subscriptions, and where your password manager is.",
    completed: false,
  },
  {
    id: "contacts",
    label: "Add important contacts",
    description:
      "Record details for your solicitor, accountant, doctor, and financial advisor.",
    completed: false,
  },
  {
    id: "funeral",
    label: "Record funeral wishes",
    description:
      "Document your preferences for burial/cremation, service type, and any prepaid plans.",
    completed: false,
  },
];

const afterItems: ChecklistItem[] = [
  {
    id: "certificate",
    label: "Obtain the death certificate",
    description:
      "Contact the funeral director or Births, Deaths and Marriages in your state.",
    completed: false,
  },
  {
    id: "notify-family",
    label: "Notify family and close friends",
    description: "Inform immediate family, extended family, and close friends.",
    completed: false,
  },
  {
    id: "funeral",
    label: "Arrange the funeral",
    description:
      "Check the vault for funeral wishes and any prepaid funeral plans.",
    completed: false,
  },
  {
    id: "solicitor",
    label: "Contact the solicitor",
    description:
      "Locate the will and begin the probate process if required.",
    completed: false,
  },
  {
    id: "centrelink",
    label: "Notify Centrelink",
    description:
      "Report the death to Services Australia to stop payments and claim bereavement allowance.",
    completed: false,
  },
  {
    id: "medicare",
    label: "Cancel Medicare",
    description: "Notify Medicare and return the Medicare card.",
    completed: false,
  },
  {
    id: "ato",
    label: "Notify the ATO",
    description:
      "Lodge a date-of-death tax return and notify the ATO of the deceased estate.",
    completed: false,
  },
  {
    id: "banks",
    label: "Notify banks and financial institutions",
    description:
      "Contact each bank with the death certificate to freeze/close accounts.",
    completed: false,
  },
  {
    id: "super-claim",
    label: "Claim superannuation death benefit",
    description:
      "Contact the super fund(s) to lodge a death benefit claim.",
    completed: false,
  },
  {
    id: "insurance-claim",
    label: "Lodge insurance claims",
    description: "Claim on life insurance, income protection, and any other policies.",
    completed: false,
  },
  {
    id: "utilities",
    label: "Cancel or transfer utilities",
    description:
      "Electricity, gas, water, internet, phone — cancel or transfer to surviving residents.",
    completed: false,
  },
  {
    id: "subscriptions",
    label: "Cancel subscriptions and memberships",
    description:
      "Cancel streaming services, gym memberships, professional associations, etc.",
    completed: false,
  },
];

export default function ChecklistPage() {
  const [before, setBefore] = useState(beforeItems);
  const [after, setAfter] = useState(afterItems);

  function toggleBefore(id: string) {
    const item = before.find((i) => i.id === id);
    const wasCompleted = item?.completed;
    setBefore((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, completed: !i.completed } : i
      )
    );
    if (!wasCompleted) {
      const completed = before.filter((i) => i.completed).length + 1;
      if (completed === before.length) {
        toast.success("Checklist complete!", {
          description: "Amazing work — you've completed every item!",
          icon: <PartyPopper className="h-5 w-5 text-amber-500" />,
        });
      } else if (completed === 1) {
        toast.success("Great start!", {
          description: "You've ticked off your first item. Keep going!",
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
        });
      } else if (completed % 3 === 0) {
        toast.success(`${completed} items done!`, {
          description: "You're making real progress.",
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
        });
      }
    }
  }

  function toggleAfter(id: string) {
    const item = after.find((i) => i.id === id);
    const wasCompleted = item?.completed;
    setAfter((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, completed: !i.completed } : i
      )
    );
    if (!wasCompleted) {
      toast.success("Step complete", {
        description: "One less thing to worry about.",
        icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
      });
    }
  }

  const beforeProgress = Math.round(
    (before.filter((i) => i.completed).length / before.length) * 100
  );
  const afterProgress = Math.round(
    (after.filter((i) => i.completed).length / after.length) * 100
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Your Checklists</h1>
        <p className="mt-1 text-muted-foreground">
          Simple steps to help you get organised. There&apos;s no rush — tick
          things off whenever you&apos;re ready.
        </p>
      </div>

      <Tabs defaultValue="before" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="before" className="flex-1 sm:flex-initial">
            Planning (Before)
          </TabsTrigger>
          <TabsTrigger value="after" className="flex-1 sm:flex-initial">
            For Family (After)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="before" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                    Planning Checklist
                  </CardTitle>
                  <CardDescription>
                    Things to organise while you can. Take your time — every step
                    counts.
                  </CardDescription>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {beforeProgress}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${beforeProgress}%` }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {before.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => toggleBefore(item.id)}
                      className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/40" />
                      )}
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            item.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="after" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                    After-Death Checklist
                  </CardTitle>
                  <CardDescription>
                    A step-by-step guide for your family. Shared with trusted
                    contacts when the vault is unlocked.
                  </CardDescription>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {afterProgress}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${afterProgress}%` }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {after.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => toggleAfter(item.id)}
                      className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/40" />
                      )}
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            item.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
