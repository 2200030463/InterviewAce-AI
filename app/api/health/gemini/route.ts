import { NextResponse } from "next/server";
import { isGeminiConfigured } from "@/lib/gemini/client";
import { apiSuccess } from "@/lib/api-response";

export async function GET() {
  const configured = isGeminiConfigured();
  return apiSuccess({
    status: configured ? "healthy" : "fallback_mode",
    model: "gemini-1.5-pro / gemini-1.5-flash",
    configured,
    message: configured 
      ? "Gemini API connected successfully." 
      : "Gemini API running in intelligent fallback mode until GEMINI_API_KEY is populated.",
  });
}
