import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  successResponse,
  errorResponse,
} from "@/lib/auth/server";
import { geminiPro } from "@/lib/gemini/client";
import { buildRoadmapPrompt } from "@/lib/gemini/prompts";
import {
  getLatestResumeAnalysis,
  getLatestRoadmap,
  saveLearningRoadmap,
  getUserReports,
} from "@/lib/firestore/operations";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return unauthorizedResponse();

    // Gather context: latest resume analysis + latest interview report
    const [resumeAnalysis, reports] = await Promise.all([
      getLatestResumeAnalysis(user.uid),
      getUserReports(user.uid),
    ]);

    const latestReport = reports[0] || null;

    const missingSkills = resumeAnalysis?.missingSkills || [];
    const weaknesses = latestReport?.weaknesses || [];
    const overallScore = latestReport?.scores.overall || 0;
    const role =
      latestReport?.role || resumeAnalysis ? "Software Developer" : "Software Developer";

    // Generate roadmap with Gemini
    const prompt = buildRoadmapPrompt(role, missingSkills, weaknesses, overallScore);
    const result = await geminiPro.generateContent(prompt);
    const responseText = result.response.text();

    let roadmapData;
    try {
      const cleaned = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      roadmapData = JSON.parse(cleaned);
    } catch {
      return errorResponse("Failed to parse roadmap response", 500);
    }

    // Save to Firestore
    const roadmapId = await saveLearningRoadmap({
      userId: user.uid,
      role,
      basedOnResumeId: resumeAnalysis?.id,
      basedOnInterviewId: latestReport?.interviewId,
      title: roadmapData.title,
      description: roadmapData.description,
      weeks: roadmapData.weeks,
      totalDays: roadmapData.totalDays || 30,
      createdAt: new Date(),
    });

    return successResponse({ roadmapId, ...roadmapData });
  } catch (err) {
    console.error("Roadmap generation error:", err);
    return errorResponse("Failed to generate learning roadmap");
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return unauthorizedResponse();

    const roadmap = await getLatestRoadmap(user.uid);
    return successResponse(roadmap);
  } catch (err) {
    console.error("Get roadmap error:", err);
    return errorResponse("Failed to fetch roadmap");
  }
}
