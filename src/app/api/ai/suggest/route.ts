import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { page, context } = await request.json();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ suggestion: null, reason: "No API key configured" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a gentle, encouraging assistant for HomePin, an Australian end-of-life planning app. 
            Your job is to provide ONE short, warm suggestion (1-2 sentences max) to help the user with their next step.
            Be specific and actionable. Never be pushy or scary. Use Australian English.
            The user is on the "${page}" page. Context: ${JSON.stringify(context)}`
          },
          {
            role: "user",
            content: "What should I do next?"
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ suggestion: null });
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content || null;

    return NextResponse.json({ suggestion });
  } catch {
    return NextResponse.json({ suggestion: null });
  }
}
