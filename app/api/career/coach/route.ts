import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  successResponse,
  errorResponse,
} from "@/lib/auth/server";
import { geminiPro } from "@/lib/gemini/client";
import { buildCareerCoachPrompt } from "@/lib/gemini/prompts";
import {
  getUserProfile,
  getLatestResumeAnalysis,
  getLatestCareerPlan,
  getUserReports,
} from "@/lib/firestore/operations";
import { withTimeout } from "@/lib/utils";

// Server-side response sanitizer & parser layer: transforms any raw JSON into human-readable Markdown
function sanitizeAndFormatCoachResponse(
  rawText: string,
  candidateRole: string,
  candidateScore: number
): { text: string; followUps: string[] } {
  let cleaned = rawText.trim();
  const defaultFollowUps = [
    `How do I prepare for a senior ${candidateRole} interview?`,
    "What system design architecture topics should I focus on?",
    "How can I improve my resume ATS match for tier-1 tech companies?",
    "What compensation range should I negotiate for this role?",
  ];

  // If text starts with json code block or curly brace, parse it
  if (cleaned.startsWith("```json") || cleaned.startsWith("{") || cleaned.includes('"atsScore"') || cleaned.includes('"technicalSkills"')) {
    try {
      const jsonStr = cleaned
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      const parsed = JSON.parse(jsonStr);

      // Convert JSON structure into conversational human Markdown
      const parts: string[] = [];

      if (parsed.careerAdvice || parsed.advice || parsed.summary || parsed.message) {
        parts.push(`### 🎯 Strategic Mentorship\n\n${parsed.careerAdvice || parsed.advice || parsed.summary || parsed.message}`);
      } else {
        parts.push(`### 🎯 Strategic Mentorship\n\nBased on your profile as a **${candidateRole}** (ATS Readiness: **${candidateScore}%**), here is your targeted roadmap.`);
      }

      if (Array.isArray(parsed.actionSteps || parsed.steps || parsed.actionItems)) {
        parts.push(`### 🚀 High-Impact Action Steps\n\n` + (parsed.actionSteps || parsed.steps || parsed.actionItems).map((s: string, i: number) => `${i + 1}. **${s}**`).join("\n"));
      }

      if (Array.isArray(parsed.missingSkills || parsed.skillGaps || parsed.technicalSkills)) {
        parts.push(`### 🛠️ Priority Technical Competencies\n\n` + (parsed.missingSkills || parsed.skillGaps || parsed.technicalSkills).map((s: string) => `- \`${s}\` — Implement in a real-world portfolio service`).join("\n"));
      }

      if (parsed.roadmap || parsed.plan90Day) {
        parts.push(`### 📈 90-Day Execution Timeline\n\n${parsed.roadmap || parsed.plan90Day}`);
      }

      if (parsed.salaryInsights || parsed.salaryPotential) {
        parts.push(`### 💰 Market Salary Projection\n\n${parsed.salaryInsights || parsed.salaryPotential}`);
      }

      const followUps = Array.isArray(parsed.suggestedFollowUps) && parsed.suggestedFollowUps.length > 0
        ? parsed.suggestedFollowUps
        : defaultFollowUps;

      return {
        text: parts.join("\n\n"),
        followUps,
      };
    } catch {
      // Fallback clean regex cleanup
      cleaned = cleaned
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/[{}[\]"]/g, "")
        .trim();
    }
  }

  // Remove any remaining stray raw JSON formatting tags
  cleaned = cleaned.replace(/```json[\s\S]*?```/gi, (match) => {
    return match.replace(/```json/gi, "").replace(/```/g, "").trim();
  });

  return {
    text: cleaned,
    followUps: defaultFollowUps,
  };
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return unauthorizedResponse();

    const body = await req.json().catch(() => ({}));
    const { message, history } = body as {
      message: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!message || !message.trim()) {
      return errorResponse("Message is required", 400);
    }

    // Fetch user context in parallel
    const [profile, resumeAnalysis, careerPlan, reports] = await Promise.all([
      getUserProfile(user.uid),
      getLatestResumeAnalysis(user.uid),
      getLatestCareerPlan(user.uid),
      getUserReports(user.uid),
    ]);

    const latestReport = reports && reports.length > 0 ? reports[0] : null;
    const targetRole = careerPlan?.targetRole || profile?.targetRole || "Full Stack Developer";
    const resumeScore = resumeAnalysis?.atsScore || profile?.resumeScore || 85;

    const candidateContext = {
      targetRole,
      resumeScore,
      skills: resumeAnalysis?.technicalSkills || ["TypeScript", "React", "Node.js", "Cloud Run"],
      missingSkills: resumeAnalysis?.missingSkills || careerPlan?.skillGaps || ["Distributed Caching", "Kubernetes"],
      interviewAverageScore: profile?.averageScore || (latestReport ? latestReport.scores.overall : undefined),
      weaknesses: latestReport?.weaknesses || ["System design depth under high RPS", "STAR metric precision"],
    };

    const prompt = buildCareerCoachPrompt(
      message.trim(),
      history || [],
      candidateContext
    );

    const result = await withTimeout(
      geminiPro.generateContent(prompt),
      14000,
      null,
      "CareerCoachQuery"
    );

    const rawResponse =
      result?.response.text() ||
      `### 🎯 Strategic Mentorship\n\nTo advance toward top-tier placement as a **${targetRole}** (Current ATS Match: **${resumeScore}%**), focus on demonstrating end-to-end service ownership and high-concurrency systems.\n\n### 🚀 High-Impact Action Steps\n\n1. **Master Distributed Caching**: Build an idempotent rate limiter using Redis and Next.js 15 to showcase sub-10ms latency.\n2. **Drill System Architecture**: Practice database sharding and CAP theorem trade-offs for 10M DAU scale.\n3. **Quantify Resume Impact**: Frame your project bullets with concrete % latency reductions and user adoption metrics.`;

    const { text: formattedReply, followUps } = sanitizeAndFormatCoachResponse(
      rawResponse,
      targetRole,
      resumeScore
    );

    return successResponse({
      reply: formattedReply,
      suggestedFollowUps: followUps,
      candidateContext,
    });
  } catch (err) {
    console.error("Career Coach API error:", err);
    return errorResponse("Failed to process career coaching request");
  }
}
