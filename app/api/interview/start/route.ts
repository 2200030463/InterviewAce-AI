import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  successResponse,
  errorResponse,
} from "@/lib/auth/server";
import { geminiFlash } from "@/lib/gemini/client";
import { buildInterviewStartPrompt, QUESTION_DOMAINS } from "@/lib/gemini/prompts";
import { createInterview, getLatestResumeAnalysis, getUserProfile } from "@/lib/firestore/operations";
import { InterviewRole, InterviewDifficulty, InterviewType, InterviewTrack, InterviewMode } from "@/types";
import { withTimeout } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return unauthorizedResponse();

    const body = await req.json().catch(() => ({}));
    const { role, difficulty, type, personaName, track, mode, category, totalQuestions, targetCompany } = body as {
      role: InterviewRole;
      difficulty: InterviewDifficulty;
      type: InterviewType;
      personaName?: string;
      track?: InterviewTrack;
      mode?: InterviewMode;
      category?: string;
      totalQuestions?: number;
      targetCompany?: string;
    };

    if (!role || !difficulty || !type) {
      return errorResponse("role, difficulty, and type are required", 400);
    }

    const activePersona = personaName || "Sarah Jenkins";
    const activeTrack = track || "General";
    const activeMode = mode || "video";
    const totalCount = Number(totalQuestions) || 10;

    // Fetch user profile and latest resume for true resume-anchored questioning
    const [profile, resumeAnalysis] = await Promise.all([
      getUserProfile(user.uid),
      getLatestResumeAnalysis(user.uid),
    ]);

    const activeCompany = targetCompany || (profile?.targetCompanies && profile.targetCompanies.length > 0 ? profile.targetCompanies[0] : activeTrack);

    const resumeContext = resumeAnalysis
      ? {
          skills: resumeAnalysis.technicalSkills || [],
          techStack: resumeAnalysis.techStack || resumeAnalysis.technicalSkills || [],
          projects: resumeAnalysis.projects || [],
          experience: resumeAnalysis.experience || "Senior Engineer",
          summary: resumeAnalysis.summary || "",
        }
      : null;

    // Randomize category archetype if not specified
    const availableCategories = QUESTION_DOMAINS[type] || QUESTION_DOMAINS["Technical"];
    const chosenCategory = category || availableCategories[Math.floor(Math.random() * availableCategories.length)];

    // Generate first question with resume grounding and timeout protection
    const prompt = buildInterviewStartPrompt(
      role,
      difficulty,
      type,
      activePersona,
      activeTrack,
      activeMode,
      chosenCategory,
      resumeContext,
      activeCompany,
      totalCount
    );

    const result = await withTimeout(
      geminiFlash.generateContent(prompt),
      12000,
      null,
      "InterviewStartQuestion"
    );

    const firstQuestion =
      result?.response.text().trim() ||
      `Welcome to your ${role} interview (${difficulty} level, ${activeCompany} track). I'm ${activePersona}. Let's begin: Could you walk me through the highest-scale distributed architecture you've designed, and explain how you handled data consistency and latency?`;

    // Create interview session in Firestore
    const interviewId = await createInterview({
      userId: user.uid,
      role,
      difficulty,
      type,
      track: activeTrack,
      personaName: activePersona,
      mode: activeMode,
      status: "active",
      currentQuestion: 1,
      totalQuestions: totalCount,
      askedQuestions: [firstQuestion],
      messages: [
        {
          role: "interviewer",
          content: firstQuestion,
          timestamp: new Date(),
          questionNumber: 1,
          category: chosenCategory,
        },
      ],
      createdAt: new Date(),
    });

    return successResponse({
      interviewId,
      message: firstQuestion,
      questionNumber: 1,
      totalQuestions: totalCount,
      personaName: activePersona,
      track: activeTrack,
      mode: activeMode,
      category: chosenCategory,
      askedQuestions: [firstQuestion],
    });
  } catch (err) {
    console.error("Interview start error:", err);
    return errorResponse("Failed to start interview session");
  }
}
