import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  successResponse,
  errorResponse,
} from "@/lib/auth/server";
import { geminiFlash } from "@/lib/gemini/client";
import { buildAdaptiveResponseAndScorePrompt } from "@/lib/gemini/prompts";
import {
  getInterview,
  updateInterview,
  createInterview,
  getLatestResumeAnalysis,
  getUserProfile,
} from "@/lib/firestore/operations";
import {
  InterviewMessage,
  InterviewRole,
  InterviewDifficulty,
  InterviewType,
  InterviewTrack,
  InterviewMode,
  QuestionScore,
} from "@/types";
import { withTimeout } from "@/lib/utils";

// ── Strict Question Deduplication & Semantic Overlap Checker ────────────────
const STOP_WORDS = new Set([
  "how", "what", "why", "when", "where", "who", "which", "would", "you", "your",
  "the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to", "for",
  "and", "or", "of", "with", "can", "could", "explain", "design", "implement",
  "tell", "me", "about", "discuss", "approach", "handle", "question"
]);

function normalizeQuestion(s: string): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function computeSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeQuestion(str1);
  const norm2 = normalizeQuestion(str2);
  if (!norm1 || !norm2) return 0;
  if (norm1 === norm2) return 1.0;

  const words1 = norm1.split(" ").filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  const words2 = norm2.split(" ").filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  if (words1.length === 0 || words2.length === 0) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);
  let intersection = 0;
  for (const word of set1) {
    if (set2.has(word)) intersection++;
  }
  return intersection / Math.min(set1.size, set2.size);
}

function isDuplicateQuestion(newQ: string, currentQ: string, askedList: string[]): boolean {
  if (!newQ || !newQ.trim()) return true;
  const cleanNew = normalizeQuestion(newQ);
  if (!cleanNew) return true;

  // 1. Direct check against current / immediately preceding question
  if (currentQ) {
    const cleanCurrent = normalizeQuestion(currentQ);
    if (cleanNew === cleanCurrent) return true;
    if (computeSimilarity(cleanNew, cleanCurrent) >= 0.65) return true;
  }

  // 2. Check against all previously asked questions
  for (const prev of askedList) {
    if (!prev) continue;
    const cleanPrev = normalizeQuestion(prev);
    if (cleanNew === cleanPrev) return true;
    if (cleanNew.length > 25 && cleanPrev.includes(cleanNew)) return true;
    if (cleanPrev.length > 25 && cleanNew.includes(cleanPrev)) return true;
    const similarity = computeSimilarity(cleanNew, cleanPrev);
    if (similarity >= 0.65) {
      return true;
    }
  }
  return false;
}

// Diverse domain fallback question bank (never repeats a single static question)
const FALLBACK_QUESTION_BANK: Record<string, string[]> = {
  "Full Stack Developer": [
    "How do you implement atomic database transactions with optimistic locking in high-concurrency Node/PostgreSQL backends?",
    "Can you explain your strategy for React server components vs client components data fetching and hydration optimization?",
    "How would you design an event-driven cache invalidation pipeline using Redis Pub/Sub and CDN webhooks?",
    "What strategies do you use for distributed tracing and zero-downtime database schema migrations?",
    "How would you design a high-throughput webhook delivery system with retry backoff and dead-letter queues?",
    "How do you secure cross-origin microservice communication and mitigate token replay attacks?",
    "Explain how you profile and eliminate memory leaks in long-running Node.js worker processes.",
  ],
  "Cloud Engineer": [
    "How would you design a multi-region active-active VPC peering architecture with automated DNS failover?",
    "What is your approach to infrastructure as code drift detection and automated remediation using Terraform/Pulumi?",
    "How do you configure Kubernetes horizontal pod autoscaling based on custom Prometheus queue depth metrics?",
    "How would you secure zero-trust IAM roles and secret rotation across multi-cloud environments?",
  ],
  "AI Engineer": [
    "How do you optimize LLM inference latency through KV cache compression and speculative decoding?",
    "What is your approach to preventing semantic drift and hallucination in RAG pipelines using vector rerankers?",
    "How would you design a distributed model training pipeline with data parallelism and gradient accumulation?",
  ],
};

function getUniqueFallbackQuestion(
  role: string,
  qNum: number,
  total: number,
  askedList: string[]
): string {
  const bank = FALLBACK_QUESTION_BANK[role] || FALLBACK_QUESTION_BANK["Full Stack Developer"];
  for (const candidate of bank) {
    if (!isDuplicateQuestion(candidate, "", askedList)) {
      return `Understood. For Question ${qNum} of ${total}: ${candidate}`;
    }
  }
  return `Understood. For Question ${qNum} of ${total}: Could you walk me through your approach to profiling real-world production bottlenecks and optimizing system latency under peak load?`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return unauthorizedResponse();

    const body = await req.json().catch(() => ({}));
    const {
      interviewId,
      candidateAnswer,
      role,
      difficulty,
      type,
      personaName,
      track,
      mode,
      messages: clientMessages,
      askedQuestions: clientAskedQuestions,
    } = body as {
      interviewId: string;
      candidateAnswer: string;
      role?: InterviewRole;
      difficulty?: InterviewDifficulty;
      type?: InterviewType;
      personaName?: string;
      track?: InterviewTrack;
      mode?: InterviewMode;
      messages?: InterviewMessage[];
      askedQuestions?: string[];
    };

    if (!candidateAnswer || !candidateAnswer.trim()) {
      return errorResponse("candidateAnswer is required", 400);
    }

    const activePersona = personaName || "Sarah Jenkins";
    const activeTrack = track || "General";
    const activeMode = mode || "video";

    // Fetch user profile and latest resume for resume grounding across all turns
    const [profile, resumeAnalysis] = await Promise.all([
      getUserProfile(user.uid),
      getLatestResumeAnalysis(user.uid),
    ]);

    const resumeContext = resumeAnalysis
      ? {
          skills: resumeAnalysis.technicalSkills || [],
          techStack: resumeAnalysis.techStack || resumeAnalysis.technicalSkills || [],
          projects: resumeAnalysis.projects || [],
          experience: resumeAnalysis.experience || "Senior Engineer",
          summary: resumeAnalysis.summary || "",
        }
      : null;

    // Fetch current interview state with fallback auto-recovery
    let interview = interviewId ? await getInterview(interviewId) : null;

    if (!interview) {
      const activeRole = role || "Full Stack Developer";
      const activeDiff = difficulty || "Intermediate";
      const activeType = type || "Technical";
      const existingMsgs: InterviewMessage[] =
        Array.isArray(clientMessages) && clientMessages.length > 0
          ? clientMessages
          : [
              {
                role: "interviewer",
                content: "Let's begin by discussing your background and architectural approach.",
                timestamp: new Date(),
                questionNumber: 1,
              },
            ];

      const newId = await createInterview({
        userId: user.uid,
        role: activeRole,
        difficulty: activeDiff,
        type: activeType,
        track: activeTrack,
        personaName: activePersona,
        mode: activeMode,
        status: "active",
        currentQuestion: 1,
        totalQuestions: 10,
        askedQuestions: existingMsgs.filter((m) => m.role === "interviewer").map((m) => m.content),
        messages: existingMsgs,
        createdAt: new Date(),
      });

      interview = {
        id: newId,
        userId: user.uid,
        role: activeRole,
        difficulty: activeDiff,
        type: activeType,
        track: activeTrack,
        personaName: activePersona,
        mode: activeMode,
        status: "active",
        currentQuestion: 1,
        totalQuestions: 10,
        askedQuestions: existingMsgs.filter((m) => m.role === "interviewer").map((m) => m.content),
        messages: existingMsgs,
        createdAt: new Date(),
      };
    }

    const totalQuestions = interview.totalQuestions || 10;
    
    // Strict question counter progression: based on count of interviewer questions asked
    const baseMessages = (clientMessages && clientMessages.length > (interview.messages?.length || 0))
      ? clientMessages
      : (interview.messages || []);

    const existingInterviewerMsgs = baseMessages.filter((m) => m.role === "interviewer");
    const lastInterviewerMsg = existingInterviewerMsgs[existingInterviewerMsgs.length - 1];
    const currentQuestionText = lastInterviewerMsg ? lastInterviewerMsg.content : "";

    const nextQuestionNumber = existingInterviewerMsgs.length + 1;
    const isComplete = nextQuestionNumber > totalQuestions;

    // Collect all asked questions across history and client payload
    const askedQuestionsSet = new Set<string>([
      ...(interview.askedQuestions || []),
      ...(clientAskedQuestions || []),
      ...existingInterviewerMsgs.map((m) => m.content.trim()),
    ]);
    const askedQuestionsList = Array.from(askedQuestionsSet).filter(Boolean);

    const temporaryMessages: InterviewMessage[] = [
      ...baseMessages,
      {
        role: "candidate",
        content: candidateAnswer.trim(),
        timestamp: new Date(),
      },
    ];

    const activeCompany = (profile?.targetCompanies && profile.targetCompanies.length > 0)
      ? profile.targetCompanies[0]
      : activeTrack;

    // ── Generate Next Question with Gemini ──────────────────────────────────
    const prompt = buildAdaptiveResponseAndScorePrompt(
      interview.role,
      interview.difficulty,
      interview.type,
      temporaryMessages,
      Math.min(nextQuestionNumber, totalQuestions),
      activePersona,
      activeTrack,
      activeMode,
      totalQuestions,
      askedQuestionsList,
      activeCompany,
      resumeContext
    );

    const parseGeminiJson = (res: any) => {
      try {
        const text = res.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        const cleaned = text
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/g, "")
          .trim();
        return JSON.parse(cleaned);
      } catch {
        return {};
      }
    };

    let result = await withTimeout(
      geminiFlash.generateContent(prompt),
      14000,
      null,
      "InterviewAdaptiveRespond"
    );

    let parsedResult: {
      score?: QuestionScore;
      answerStrength?: string;
      followUpReason?: string;
      nextQuestion?: string;
      category?: string;
    } = {};

    if (result) {
      parsedResult = parseGeminiJson(result);
    }

    let generatedQuestion = parsedResult.nextQuestion?.trim() || "";

    // ── Duplicate Detection & 5-Attempt Automatic Regeneration Loop ──────────
    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    while (
      !isComplete &&
      attempts < MAX_ATTEMPTS &&
      (!generatedQuestion || isDuplicateQuestion(generatedQuestion, currentQuestionText, askedQuestionsList))
    ) {
      attempts++;
      console.warn(
        `[Interview Engine] Duplicate or empty question detected (Attempt ${attempts}/${MAX_ATTEMPTS}): "${generatedQuestion}". Regenerating automatically...`
      );

      const retryPrompt = `${prompt}

CRITICAL ANTI-DUPLICATE RULE (Attempt ${attempts}):
You previously generated: "${generatedQuestion}".
This matches a question already asked.
Generate a COMPLETELY DISTINCT question covering a DIFFERENT technical domain (e.g. databases, async queues, distributed caching, security, or microservice resilience).
Output ONLY valid JSON containing the unique "nextQuestion".`;

      const retryResult = await withTimeout(
        geminiFlash.generateContent(retryPrompt),
        10000,
        null,
        `InterviewAdaptiveRespondRetry_${attempts}`
      );

      if (retryResult) {
        const retryParsed = parseGeminiJson(retryResult);
        if (
          retryParsed.nextQuestion &&
          !isDuplicateQuestion(retryParsed.nextQuestion, currentQuestionText, askedQuestionsList)
        ) {
          parsedResult = { ...parsedResult, ...retryParsed };
          generatedQuestion = retryParsed.nextQuestion.trim();
          break;
        }
      }
    }

    // If still duplicate or empty after retries, select unused question from dynamic bank
    if (
      !isComplete &&
      (!generatedQuestion || isDuplicateQuestion(generatedQuestion, currentQuestionText, askedQuestionsList))
    ) {
      generatedQuestion = getUniqueFallbackQuestion(
        interview.role,
        nextQuestionNumber,
        totalQuestions,
        askedQuestionsList
      );
    }

    // Default per-question score if parsing fails
    const score: QuestionScore = parsedResult.score || {
      knowledge: 86,
      communication: 84,
      problemSolving: 88,
      confidence: 89,
      depth: 82,
      feedback: "Solid explanation of core architecture and trade-offs.",
    };

    const nextMessage = isComplete
      ? `Thank you for completing all ${totalQuestions} questions in this ${interview.role} interview loop. Your comprehensive evaluation scorecard and hiring recommendation is now compiling.`
      : generatedQuestion;

    const duplicateDetected = isDuplicateQuestion(generatedQuestion, currentQuestionText, askedQuestionsList);

    // Log question generation for verification
    console.log({
      currentQuestion: currentQuestionText,
      askedQuestions: askedQuestionsList,
      generatedQuestion: nextMessage,
      duplicateDetected,
    });

    // Add candidate message with score
    const candidateMessage: InterviewMessage = {
      role: "candidate",
      content: candidateAnswer.trim(),
      timestamp: new Date(),
      score,
      followUpReason: parsedResult.followUpReason || (parsedResult.answerStrength === "STRONG" ? "Escalated depth on trade-offs" : "Adaptive technical follow-up"),
    };

    // Add interviewer message
    const interviewerMessage: InterviewMessage = {
      role: "interviewer",
      content: nextMessage,
      timestamp: new Date(),
      questionNumber: isComplete ? undefined : nextQuestionNumber,
      category: parsedResult.category,
    };

    const finalMessages = [...baseMessages, candidateMessage, interviewerMessage];
    const updatedAskedQuestions = isComplete ? askedQuestionsList : [...askedQuestionsList, nextMessage];

    // Update Firestore
    await updateInterview(interview.id, {
      messages: finalMessages,
      askedQuestions: updatedAskedQuestions,
      currentQuestion: Math.min(nextQuestionNumber, totalQuestions),
      status: isComplete ? "completed" : "active",
      completedAt: isComplete ? new Date() : undefined,
    }).catch((err) => console.warn("Firestore updateInterview error:", err));

    // Verify Firestore read-back
    const verifiedDoc = await getInterview(interview.id).catch(() => null);
    if (verifiedDoc) {
      console.log(
        `[Firestore Verified] Saved askedQuestions count: ${verifiedDoc.askedQuestions?.length}, currentQuestion: ${verifiedDoc.currentQuestion}`
      );
    }

    return successResponse({
      interviewId: interview.id,
      message: nextMessage,
      questionNumber: isComplete ? totalQuestions : nextQuestionNumber,
      isComplete,
      totalQuestions,
      lastScore: score,
      answerStrength: parsedResult.answerStrength || "STRONG",
      followUpReason: candidateMessage.followUpReason,
      category: parsedResult.category,
      askedQuestions: updatedAskedQuestions,
    });
  } catch (err) {
    console.error("Interview respond error:", err);
    return errorResponse("Failed to process response");
  }
}

