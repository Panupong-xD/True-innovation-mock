import { NextResponse } from "next/server";
import { chatWithSwuAI, isSwuConfigured } from "@/lib/services/ai/swu";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    content?: string;
    model?: string;
    apiKey?: string;
    userId?: string;
    files?: Array<{ type: string; name: string; data: string }>;
  };

  if (!body.content?.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const clientApiKey = body.apiKey;
  const clientUserId = body.userId;

  if (!isSwuConfigured(clientApiKey, clientUserId)) {
    return NextResponse.json(
      {
        configured: false,
        error: "ยังไม่ได้ตั้งค่า SWU_API_KEY และ SWU_USER_ID ในหน้าตั้งค่าโปรไฟล์ หรือใน .env.local"
      },
      { status: 503 }
    );
  }

  try {
    const result = await chatWithSwuAI(body.content, body.model, clientApiKey, clientUserId, body.files);
    return NextResponse.json(result);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "";
    if (errMessage === "CLOUDFLARE_BLOCKED") {
      const { generateFallbackResponse } = await import("@/lib/services/ai/swu");
      const fallbackText = generateFallbackResponse(body.content || "");
      return NextResponse.json({
        configured: true,
        model: body.model || "google/gemini-2.5-flash (Offline Fallback)",
        text: fallbackText,
        isFallback: true
      });
    }

    return NextResponse.json(
      {
        configured: true,
        error: error instanceof Error ? error.message : "SWU AI request failed"
      },
      { status: 502 }
    );
  }
}
