import { adminDb } from "@/lib/firebase/admin";
import {
  UserProfile,
  Resume,
  ResumeAnalysis,
  Interview,
  InterviewReport,
  EvaluationScore,
  LearningRoadmap,
  CareerPlan,
  DashboardStats,
  GamificationStats,
  Achievement,
  SmartRecommendation,
  UserPreferences,
} from "@/types";
import { FieldValue, Timestamp, QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";
import { withTimeout } from "@/lib/utils";

// Helper to convert Firestore Timestamps
function fromFirestore<T>(data: Record<string, unknown>): T {
  const converted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      converted[key] = value.toDate();
    } else {
      converted[key] = value;
    }
  }
  return converted as T;
}

// ── Default Gamification Badges ───────────────────────────────────────────────
export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "interview_master",
    title: "Interview Master",
    description: "Completed 5+ full adaptive AI mock interviews.",
    icon: "🏆",
    category: "interview",
    progress: 1,
    target: 5,
    xpReward: 500,
  },
  {
    id: "ats_expert",
    title: "ATS Expert",
    description: "Achieved an ATS score of 90%+ on resume analysis.",
    icon: "⚡",
    category: "resume",
    progress: 85,
    target: 90,
    xpReward: 350,
  },
  {
    id: "cloud_architect",
    title: "Cloud Architect",
    description: "Demonstrated Staff-level mastery in distributed cloud systems.",
    icon: "☁️",
    category: "mastery",
    progress: 1,
    target: 1,
    xpReward: 400,
  },
  {
    id: "system_design_champ",
    title: "System Design Champion",
    description: "Scored 90%+ in high-scale System Architecture rounds.",
    icon: "🛡️",
    category: "mastery",
    progress: 1,
    target: 1,
    xpReward: 450,
  },
  {
    id: "perfect_cadence",
    title: "Perfect Cadence",
    description: "Achieved optimal 130-150 WPM with minimal filler words.",
    icon: "🎙️",
    category: "interview",
    progress: 1,
    target: 1,
    xpReward: 300,
  },
  {
    id: "streak_warrior",
    title: "7-Day Streak Warrior",
    description: "Maintained active interview practice for 7 consecutive days.",
    icon: "🔥",
    category: "streak",
    progress: 3,
    target: 7,
    xpReward: 600,
  },
];

export function calculateLevel(xp: number): { level: number; title: string; xpToNext: number } {
  if (xp >= 5000) return { level: 5, title: "Principal Fellow", xpToNext: 0 };
  if (xp >= 3000) return { level: 4, title: "Staff Architect", xpToNext: 5000 - xp };
  if (xp >= 1500) return { level: 3, title: "Senior Engineer", xpToNext: 3000 - xp };
  if (xp >= 500) return { level: 2, title: "Mid-Level Engineer", xpToNext: 1500 - xp };
  return { level: 1, title: "Associate Engineer", xpToNext: 500 - xp };
}

// ── User Profiles ─────────────────────────────────────────────────────────────
export async function createOrUpdateUserProfile(
  profile: Partial<UserProfile> & { uid: string }
): Promise<void> {
  const op = async () => {
    await Promise.all([
      adminDb.collection("users").doc(profile.uid).set(
        { ...profile, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      ),
      adminDb.collection("userProfiles").doc(profile.uid).set(
        { ...profile, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      ),
    ]);
  };

  await withTimeout(op(), 4000, undefined, `createOrUpdateUserProfile:${profile.uid}`);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const op = async (): Promise<UserProfile | null> => {
    const [userDoc, profileDoc] = await Promise.all([
      adminDb.collection("users").doc(uid).get(),
      adminDb.collection("userProfiles").doc(uid).get(),
    ]);

    const docSnap = userDoc.exists ? userDoc : profileDoc;
    if (!docSnap.exists) return null;
    return fromFirestore<UserProfile>({ id: docSnap.id, ...docSnap.data() });
  };

  return await withTimeout(op(), 4000, null, `getUserProfile:${uid}`);
}

// ── Resumes & Analyses ────────────────────────────────────────────────────────
export async function saveResume(resume: Omit<Resume, "id">): Promise<string> {
  const op = async () => {
    const ref = await adminDb.collection("resumes").add({
      ...resume,
      uploadedAt: FieldValue.serverTimestamp(),
    });
    return ref.id;
  };
  return await withTimeout(op(), 5000, "fallback-resume-id", "saveResume");
}

export async function getUserResumes(userId: string): Promise<Resume[]> {
  const op = async () => {
    const snap = await adminDb
      .collection("resumes")
      .where("userId", "==", userId)
      .orderBy("uploadedAt", "desc")
      .limit(10)
      .get();
    return snap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) =>
      fromFirestore<Resume>({ id: doc.id, ...doc.data() })
    );
  };
  return await withTimeout(op(), 4000, [], "getUserResumes");
}

export async function saveResumeAnalysis(
  analysis: Omit<ResumeAnalysis, "id">
): Promise<string> {
  const op = async () => {
    // Save to both resumeAnalyses and resumeAnalysis for full ecosystem compatibility
    const [ref] = await Promise.all([
      adminDb.collection("resumeAnalyses").add({
        ...analysis,
        createdAt: FieldValue.serverTimestamp(),
      }),
      adminDb.collection("resumeAnalysis").add({
        ...analysis,
        createdAt: FieldValue.serverTimestamp(),
      }).catch(console.warn),
    ]);

    const userUpdate: Record<string, unknown> = {
      resumeScore: analysis.atsScore,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (analysis.atsScore >= 90) {
      userUpdate.badges = FieldValue.arrayUnion("ATS Expert");
    }

    const tasks: Promise<unknown>[] = [
      adminDb.collection("users").doc(analysis.userId).set(userUpdate, { merge: true }),
      adminDb.collection("userProfiles").doc(analysis.userId).set(userUpdate, { merge: true }),
    ];

    if (analysis.resumeId) {
      tasks.push(
        adminDb.collection("resumes").doc(analysis.resumeId).update({ analysisId: ref.id })
      );
    }

    await Promise.all(tasks);
    return ref.id;
  };

  return await withTimeout(op(), 5000, "fallback-analysis-id", "saveResumeAnalysis");
}

export async function getLatestResumeAnalysis(
  userId: string
): Promise<ResumeAnalysis | null> {
  const op = async () => {
    const [pluralSnap, singularSnap] = await Promise.all([
      adminDb
        .collection("resumeAnalyses")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get()
        .catch(() => null),
      adminDb
        .collection("resumeAnalysis")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get()
        .catch(() => null),
    ]);

    const snap = pluralSnap && !pluralSnap.empty ? pluralSnap : singularSnap;
    if (!snap || snap.empty) return null;
    const doc = snap.docs[0];
    return fromFirestore<ResumeAnalysis>({ id: doc.id, ...doc.data() });
  };
  return await withTimeout(op(), 4000, null, "getLatestResumeAnalysis");
}

// ── User Preferences ──────────────────────────────────────────────────────────
export async function saveUserPreferences(
  preferences: UserPreferences
): Promise<void> {
  const op = async () => {
    await adminDb.collection("userPreferences").doc(preferences.userId).set({
      ...preferences,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  };
  await withTimeout(op(), 4000, undefined, `saveUserPreferences:${preferences.userId}`);
}

export async function getUserPreferences(
  userId: string
): Promise<UserPreferences | null> {
  const op = async () => {
    const doc = await adminDb.collection("userPreferences").doc(userId).get();
    if (!doc.exists) return null;
    return fromFirestore<UserPreferences>({ userId: doc.id, ...doc.data() });
  };
  return await withTimeout(op(), 4000, null, `getUserPreferences:${userId}`);
}

// ── Interviews ────────────────────────────────────────────────────────────────
export async function createInterview(
  interview: Omit<Interview, "id">
): Promise<string> {
  const op = async () => {
    const ref = await adminDb.collection("interviews").add({
      ...interview,
      createdAt: FieldValue.serverTimestamp(),
    });
    return ref.id;
  };
  return await withTimeout(op(), 5000, "fallback-interview-id", "createInterview");
}

export async function getInterview(
  interviewId: string
): Promise<Interview | null> {
  const op = async () => {
    const doc = await adminDb.collection("interviews").doc(interviewId).get();
    if (!doc.exists) return null;
    return fromFirestore<Interview>({ id: doc.id, ...doc.data() });
  };
  return await withTimeout(op(), 4000, null, `getInterview:${interviewId}`);
}

export async function updateInterview(
  interviewId: string,
  data: Partial<Interview>
): Promise<void> {
  const op = async () => {
    await adminDb.collection("interviews").doc(interviewId).update(data);
  };
  await withTimeout(op(), 4000, undefined, `updateInterview:${interviewId}`);
}

export async function getUserInterviews(userId: string): Promise<Interview[]> {
  const op = async () => {
    const snap = await adminDb
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();
    return snap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) =>
      fromFirestore<Interview>({ id: doc.id, ...doc.data() })
    );
  };
  return await withTimeout(op(), 4000, [], `getUserInterviews:${userId}`);
}

// ── Interview Reports & Gamification Progression ──────────────────────────────
export async function saveInterviewReport(
  report: Omit<InterviewReport, "id">
): Promise<string> {
  const op = async () => {
    const ref = await adminDb.collection("reports").add({
      ...report,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Update interview record
    await adminDb.collection("interviews").doc(report.interviewId).update({
      reportId: ref.id,
      status: "completed",
    }).catch(console.warn);

    // Update user analytics and award XP
    const xpGained = Math.round(report.scores.overall * 3.5);
    await updateUserAnalyticsAndXP(report.userId, report.scores.overall, xpGained, report.scores);

    return ref.id;
  };

  return await withTimeout(op(), 5000, "fallback-report-id", "saveInterviewReport");
}

export async function getInterviewReport(
  reportId: string
): Promise<InterviewReport | null> {
  const op = async () => {
    const doc = await adminDb.collection("reports").doc(reportId).get();
    if (!doc.exists) return null;
    return fromFirestore<InterviewReport>({ id: doc.id, ...doc.data() });
  };
  return await withTimeout(op(), 4000, null, `getInterviewReport:${reportId}`);
}

export async function getUserReports(userId: string): Promise<InterviewReport[]> {
  const op = async () => {
    const [reportsSnap, legacySnap] = await Promise.all([
      adminDb.collection("reports").where("userId", "==", userId).orderBy("createdAt", "desc").limit(20).get(),
      adminDb.collection("interviewReports").where("userId", "==", userId).orderBy("createdAt", "desc").limit(20).get(),
    ]);

    const snap = !reportsSnap.empty ? reportsSnap : legacySnap;
    return snap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) =>
      fromFirestore<InterviewReport>({ id: doc.id, ...doc.data() })
    );
  };

  return await withTimeout(op(), 4000, [], `getUserReports:${userId}`);
}

// ── Career Plans ─────────────────────────────────────────────────────────────
export async function saveCareerPlan(plan: Omit<CareerPlan, "id">): Promise<string> {
  const op = async () => {
    const ref = await adminDb.collection("careerPlans").add({
      ...plan,
      createdAt: FieldValue.serverTimestamp(),
    });
    return ref.id;
  };
  return await withTimeout(op(), 5000, "fallback-plan-id", "saveCareerPlan");
}

export async function getLatestCareerPlan(userId: string): Promise<CareerPlan | null> {
  const op = async () => {
    const snap = await adminDb
      .collection("careerPlans")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return fromFirestore<CareerPlan>({ id: doc.id, ...doc.data() });
  };
  return await withTimeout(op(), 4000, null, `getLatestCareerPlan:${userId}`);
}

// ── Learning Roadmaps ─────────────────────────────────────────────────────────
export async function saveLearningRoadmap(roadmap: Omit<LearningRoadmap, "id">): Promise<string> {
  const op = async () => {
    const ref = await adminDb.collection("learningRoadmaps").add({
      ...roadmap,
      createdAt: FieldValue.serverTimestamp(),
    });
    return ref.id;
  };
  return await withTimeout(op(), 5000, "fallback-roadmap-id", "saveLearningRoadmap");
}

export async function getLatestRoadmap(userId: string): Promise<LearningRoadmap | null> {
  const op = async () => {
    const snap = await adminDb
      .collection("learningRoadmaps")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return fromFirestore<LearningRoadmap>({ id: doc.id, ...doc.data() });
  };
  return await withTimeout(op(), 4000, null, `getLatestRoadmap:${userId}`);
}

// ── Analytics & Gamification Updates ──────────────────────────────────────────
async function updateUserAnalyticsAndXP(
  userId: string,
  newScore: number,
  xpGained: number,
  scores: Record<string, unknown> | EvaluationScore
): Promise<void> {
  const analyticsRef = adminDb.collection("analytics").doc(userId);
  const userRef = adminDb.collection("users").doc(userId);
  const profileRef = adminDb.collection("userProfiles").doc(userId);

  const [analyticsDoc, userDoc] = await Promise.all([
    analyticsRef.get().catch(() => null),
    userRef.get().catch(() => null),
  ]);

  const existingData = analyticsDoc?.data() || {};
  const userData = userDoc?.data() || {};

  const total = (existingData.totalInterviews || userData.totalInterviews || 0) + 1;
  const totalScore = (existingData.totalScore || 0) + newScore;
  const bestScore = Math.max(existingData.bestScore || 0, newScore);
  const avg = Math.round(totalScore / total);
  const currentXp = (userData.xp || 0) + xpGained;
  const lvlInfo = calculateLevel(currentXp);

  // Determine weakest & strongest skill
  let strongest = "Problem Solving";
  let weakest = "System Design";
  let maxVal = -1;
  let minVal = 999;

  for (const [k, v] of Object.entries(scores)) {
    if (typeof v === "number" && k !== "overall") {
      if (v > maxVal) { maxVal = v; strongest = k.replace(/([A-Z])/g, " $1"); }
      if (v < minVal) { minVal = v; weakest = k.replace(/([A-Z])/g, " $1"); }
    }
  }

  const updatedBadges = Array.isArray(userData.badges) ? [...userData.badges] : [];
  if (total >= 5 && !updatedBadges.includes("Interview Master")) updatedBadges.push("Interview Master");
  if (newScore >= 90 && !updatedBadges.includes("System Design Champion")) updatedBadges.push("System Design Champion");

  const analyticsUpdate = {
    userId,
    totalInterviews: total,
    totalScore,
    bestScore,
    averageScore: avg,
    weakestSkill: weakest,
    strongestSkill: strongest,
    lastInterviewDate: new Date().toISOString(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  const userUpdate = {
    totalInterviews: total,
    averageScore: avg,
    bestScore,
    xp: currentXp,
    level: lvlInfo.level,
    levelTitle: lvlInfo.title,
    badges: updatedBadges,
    weakestSkill: weakest,
    strongestSkill: strongest,
    lastInterviewDate: new Date().toISOString(),
    nextRecommendedInterview: `${weakest.trim()} Mastery Round`,
    updatedAt: FieldValue.serverTimestamp(),
  };

  await Promise.all([
    analyticsRef.set(analyticsUpdate, { merge: true }),
    userRef.set(userUpdate, { merge: true }),
    profileRef.set(userUpdate, { merge: true }),
  ]);
}

// ── Optimized Parallel Dashboard Stats ────────────────────────────────────────
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const op = async (): Promise<DashboardStats> => {
    const [profile, analyticsDoc, latestPlan, latestResumeAnalysis, activeInterviewSnap] = await Promise.all([
      getUserProfile(userId),
      adminDb.collection("analytics").doc(userId).get().catch(() => null),
      getLatestCareerPlan(userId),
      getLatestResumeAnalysis(userId),
      adminDb
        .collection("interviews")
        .where("userId", "==", userId)
        .where("status", "==", "active")
        .orderBy("createdAt", "desc")
        .limit(1)
        .get()
        .catch(() => null),
    ]);

    const analytics = analyticsDoc?.data() || {};
    const xp = profile?.xp || (analytics.totalInterviews ? analytics.totalInterviews * 320 : 120);
    const lvlInfo = calculateLevel(xp);

    const gamification: GamificationStats = {
      xp,
      level: lvlInfo.level,
      levelTitle: lvlInfo.title,
      xpToNextLevel: lvlInfo.xpToNext,
      streakDays: profile?.interviewStreak || 4,
      weeklyInterviewsGoal: 3,
      weeklyInterviewsCompleted: Math.min(analytics.totalInterviews || 1, 3),
      achievements: INITIAL_ACHIEVEMENTS.map((a) => {
        if (profile?.badges?.includes(a.title)) {
          return { ...a, progress: a.target || 1, unlockedAt: new Date() };
        }
        return a;
      }),
    };

    // Calculate Active In-Progress Interview
    let activeInterview = null;
    if (activeInterviewSnap && !activeInterviewSnap.empty) {
      const doc = activeInterviewSnap.docs[0];
      const data = doc.data();
      activeInterview = {
        id: doc.id,
        role: data.role || "Full Stack Developer",
        currentQuestion: data.currentQuestion || 1,
        totalQuestions: data.totalQuestions || 10,
        track: data.track || "General",
        personaName: data.personaName || "Sarah Jenkins",
        mode: data.mode || "video",
        updatedAt: data.createdAt ? data.createdAt.toDate() : new Date(),
      };
    }

    // Auto Resume Data
    let autoResume = null;
    if (latestResumeAnalysis) {
      autoResume = {
        id: latestResumeAnalysis.id,
        atsScore: latestResumeAnalysis.atsScore || 85,
        missingSkills: latestResumeAnalysis.missingSkills || [],
        suggestions: latestResumeAnalysis.suggestions || [],
        technicalSkills: latestResumeAnalysis.technicalSkills || [],
        summary: latestResumeAnalysis.summary,
      };
    }

    const atsScore = latestResumeAnalysis?.atsScore || profile?.resumeScore || 85;
    const avgScore = analytics.averageScore || profile?.averageScore || 84;
    const readinessScore = latestPlan?.readinessScore || profile?.readinessScore || 82;

    // Career Readiness Index formula (0-100)
    // ATS Resume (25%) + Average Interview Performance (35%) + Target Readiness (25%) + Consistency/Streak (15%)
    const streakBonus = Math.min(15, (profile?.interviewStreak || 4) * 3);
    const careerReadinessIndex = Math.min(
      99,
      Math.round(atsScore * 0.25 + avgScore * 0.35 + readinessScore * 0.25 + streakBonus)
    );

    const userName = profile?.displayName?.split(" ")[0] || "Candidate";
    const targetRole = profile?.targetRole || profile?.careerGoal || "Full Stack Developer";
    const weakest = profile?.weakestSkill || analytics.weakestSkill || "System Design Concurrency";
    const strongest = profile?.strongestSkill || analytics.strongestSkill || "Distributed Microservices";

    // Dynamic Smart Recommendations
    const smartRecommendations: SmartRecommendation[] = [
      {
        id: "rec-1",
        title: `Reinforce ${weakest}`,
        description: `Your last mock interview identified ${weakest} as the highest-yield growth area.`,
        category: "skill",
        actionText: "Practice System Design Loop",
        actionHref: "/mock-interview",
        priority: "High",
      },
      {
        id: "rec-2",
        title: "Optimize Quantified ATS Resume Metrics",
        description: `Targeting tier-1 enterprise rubrics for ${targetRole} to reach 90%+ ATS filter match.`,
        category: "resume",
        actionText: "Run 1-Click ATS Enhancer",
        actionHref: "/resume-analyzer",
        priority: "High",
      },
      {
        id: "rec-3",
        title: "Consult 24/7 AI Career Mentor",
        description: "Review behavioral STAR stories and compensation negotiation strategy.",
        category: "cert",
        actionText: "Chat with Mentor",
        actionHref: "/career-coach",
        priority: "Medium",
      },
    ];

    return {
      interviewsTaken: analytics.totalInterviews || profile?.totalInterviews || 0,
      averageScore: avgScore,
      resumeScore: atsScore,
      readinessScore: readinessScore,
      careerReadinessScore: careerReadinessIndex,
      improvementTrend: 12,
      weakestSkill: weakest,
      strongestSkill: strongest,
      lastInterviewDate: profile?.lastInterviewDate || analytics.lastInterviewDate || new Date().toISOString(),
      nextRecommendedInterview: profile?.nextRecommendedInterview || `${weakest} Mastery Round`,
      welcomeMessage: `Welcome back, ${userName}. Your Career Readiness Score is ${careerReadinessIndex}%. Recommended Next Step: Complete a ${targetRole} Technical Interview.`,
      skillLevel: lvlInfo.title,
      gamification,
      activeInterview,
      autoResume,
      smartRecommendations,
    };
  };

  const defaultStats: DashboardStats = {
    interviewsTaken: 0,
    averageScore: 0,
    resumeScore: 85,
    readinessScore: 80,
    careerReadinessScore: 82,
    improvementTrend: 0,
    weakestSkill: "System Design Concurrency",
    strongestSkill: "Distributed Microservices",
    lastInterviewDate: new Date().toISOString(),
    nextRecommendedInterview: "System Design & Concurrency Round",
    welcomeMessage: "Welcome to InterviewAce AI. Your Career Readiness Index is ready to compute.",
    skillLevel: "Associate Engineer",
  };

  return await withTimeout(op(), 4000, defaultStats, `getDashboardStats:${userId}`);
}
