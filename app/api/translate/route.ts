import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    let session = null;
    try { session = await auth(); } catch { /* auth 미설정 */ }
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ translated: "" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a professional architectural translator. Translate Korean text into natural, professional English suitable for an architecture portfolio. Return only the translated text with no explanation.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Groq error:", errText);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }

  const data = await res.json();
  const translated = data.choices?.[0]?.message?.content?.trim() ?? "";

  return NextResponse.json({ translated });
}
