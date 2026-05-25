import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/actions/subscription";
import type { PlanId } from "@/lib/plans";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { planId?: PlanId };
    const planId = body.planId;
    if (!planId || planId === "free") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const result = await createCheckoutSession(planId);
    if ("error" in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ url: result.url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
