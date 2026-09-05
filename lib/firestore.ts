/**
 * lib/firestore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Optimized Firestore database service with:
 * - withTimeout() timeout protection (5000ms max)
 * - console.time / console.timeEnd observability
 * - Safe fallback returns
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { withTimeout } from "@/lib/utils";
import {
  UserProfile,
  ResumeAnalysis,
  InterviewReport,
  CareerPlan,
} from "@/types";

export function convertTimestamp(val: unknown): Date {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  if (typeof val === "string" || typeof val === "number") return new Date(val);
  return new Date();
}

// ── 1. USERS Collection ───────────────────────────────────────────────────────
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirebaseDb();
  console.time(`Firestore:fetchUserProfile:${uid}`);

  const op = async (): Promise<UserProfile | null> => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists()) return null;
      const data = snap.data();
      return {
        uid: snap.id,
        email: data.email || "",
        displayName: data.name || data.displayName || "Candidate",
        photoURL: data.photoURL || "",
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        resumeScore: Number(data.resumeScore) || 0,
        averageScore: Number(data.averageScore) || 0,
        totalInterviews: Number(data.totalInterviews) || 0,
      };
    } catch (err) {
      console.warn(`[Firestore] fetchUserProfile error:`, err);
      return null;
    } finally {
      console.timeEnd(`Firestore:fetchUserProfile:${uid}`);
    }
  };

  return await withTimeout(op(), 4000, null, `fetchUserProfile:${uid}`);
}

export async function updateUserProfileDoc(uid: string, updates: Partial<DocumentData>): Promise<void> {
  const db = getFirebaseDb();
  console.time(`Firestore:updateUserProfileDoc:${uid}`);

  const op = async (): Promise<void> => {
    try {
      await setDoc(doc(db, "users", uid), {
        ...updates,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.warn(`[Firestore] updateUserProfileDoc error:`, err);
    } finally {
      console.timeEnd(`Firestore:updateUserProfileDoc:${uid}`);
    }
  };

  return await withTimeout(op(), 4000, undefined, `updateUserProfileDoc:${uid}`);
}

// ── 2. RESUMES Collection ─────────────────────────────────────────────────────
export async function saveResumeDoc(data: {
  userId: string;
  resumeText: string;
  atsScore: number;
  fileName?: string;
  technicalSkills?: string[];
  missingSkills?: string[];
  strengths?: string[];
  suggestions?: string[];
  summary?: string;
}): Promise<string> {
  const db = getFirebaseDb();
  console.time(`Firestore:saveResumeDoc:${data.userId}`);

  const op = async (): Promise<string> => {
    try {
      const ref = await addDoc(collection(db, "resumes"), {
        ...data,
        createdAt: serverTimestamp(),
      });

      // Update user's latest ATS score in background
      updateUserProfileDoc(data.userId, { resumeScore: data.atsScore }).catch(console.warn);
      return ref.id;
    } catch (err) {
      console.warn(`[Firestore] saveResumeDoc error:`, err);
      return "fallback-resume-id";
    } finally {
      console.timeEnd(`Firestore:saveResumeDoc:${data.userId}`);
    }
  };

  return await withTimeout(op(), 5000, "fallback-resume-id", `saveResumeDoc`);
}

export async function getLatestUserResume(userId: string): Promise<ResumeAnalysis | null> {
  const db = getFirebaseDb();
  console.time(`Firestore:getLatestUserResume:${userId}`);

  const op = async (): Promise<ResumeAnalysis | null> => {
    try {
      const q = query(
        collection(db, "resumes"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const d = snap.docs[0];
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        resumeId: d.id,
        atsScore: Number(data.atsScore) || 0,
        technicalSkills: data.technicalSkills || [],
        softSkills: data.softSkills || [],
        missingSkills: data.missingSkills || [],
        suggestions: data.suggestions || [],
        strengths: data.strengths || [],
        experience: data.experience || "",
        education: data.education || "",
        summary: data.summary || "",
        createdAt: convertTimestamp(data.createdAt),
      };
    } catch (err) {
      console.warn(`[Firestore] getLatestUserResume error:`, err);
      return null;
    } finally {
      console.timeEnd(`Firestore:getLatestUserResume:${userId}`);
    }
  };

  return await withTimeout(op(), 4000, null, `getLatestUserResume`);
}

// ── 3. INTERVIEWS Collection ──────────────────────────────────────────────────
export async function saveInterviewDoc(interview: {
  userId: string;
  role: string;
  difficulty: string;
  type: string;
  score?: number;
  status: "active" | "completed";
  messages: unknown[];
  currentQuestion: number;
  totalQuestions: number;
}): Promise<string> {
  const db = getFirebaseDb();
  console.time(`Firestore:saveInterviewDoc:${interview.userId}`);

  const op = async (): Promise<string> => {
    try {
      const ref = await addDoc(collection(db, "interviews"), {
        ...interview,
        createdAt: serverTimestamp(),
      });
      return ref.id;
    } catch (err) {
      console.warn(`[Firestore] saveInterviewDoc error:`, err);
      return "fallback-interview-id";
    } finally {
      console.timeEnd(`Firestore:saveInterviewDoc:${interview.userId}`);
    }
  };

  return await withTimeout(op(), 5000, "fallback-interview-id", `saveInterviewDoc`);
}

// ── 4. REPORTS Collection ─────────────────────────────────────────────────────
export async function saveReportDoc(report: {
  userId: string;
  interviewId: string;
  role: string;
  difficulty: string;
  type: string;
  overallScore: number;
  scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedFeedback: string;
}): Promise<string> {
  const db = getFirebaseDb();
  console.time(`Firestore:saveReportDoc:${report.userId}`);

  const op = async (): Promise<string> => {
    try {
      const ref = await addDoc(collection(db, "reports"), {
        ...report,
        createdAt: serverTimestamp(),
      });

      // Update user analytics in parallel/background
      fetchUserProfile(report.userId).then((user) => {
        const currentTotal = user?.totalInterviews || 0;
        const currentAvg = user?.averageScore || 0;
        const newTotal = currentTotal + 1;
        const newAvg = Math.round((currentAvg * currentTotal + report.overallScore) / newTotal);

        updateUserProfileDoc(report.userId, {
          totalInterviews: newTotal,
          averageScore: newAvg,
        }).catch(console.warn);
      }).catch(console.warn);

      return ref.id;
    } catch (err) {
      console.warn(`[Firestore] saveReportDoc error:`, err);
      return "fallback-report-id";
    } finally {
      console.timeEnd(`Firestore:saveReportDoc:${report.userId}`);
    }
  };

  return await withTimeout(op(), 5000, "fallback-report-id", `saveReportDoc`);
}

export async function getUserReportsList(userId: string): Promise<InterviewReport[]> {
  const db = getFirebaseDb();
  console.time(`Firestore:getUserReportsList:${userId}`);

  const op = async (): Promise<InterviewReport[]> => {
    try {
      const q = query(
        collection(db, "reports"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId,
          interviewId: data.interviewId || "",
          role: data.role || "Full Stack Developer",
          difficulty: data.difficulty || "Intermediate",
          type: data.type || "Technical",
          scores: {
            technicalKnowledge: data.scores?.technicalKnowledge || data.overallScore || 0,
            communication: data.scores?.communication || data.overallScore || 0,
            problemSolving: data.scores?.problemSolving || data.overallScore || 0,
            confidence: data.scores?.confidence || data.overallScore || 0,
            industryReadiness: data.scores?.industryReadiness || data.overallScore || 0,
            overall: data.overallScore || data.scores?.overall || 0,
          },
          strengths: data.strengths || [],
          weaknesses: data.weaknesses || [],
          recommendations: data.recommendations || [],
          detailedFeedback: data.detailedFeedback || "",
          createdAt: convertTimestamp(data.createdAt),
        };
      });
    } catch (err) {
      console.warn(`[Firestore] getUserReportsList error:`, err);
      return [];
    } finally {
      console.timeEnd(`Firestore:getUserReportsList:${userId}`);
    }
  };

  return await withTimeout(op(), 4000, [], `getUserReportsList`);
}

// ── 5. CAREER PLANS Collection ────────────────────────────────────────────────
export async function saveCareerPlanDoc(plan: {
  userId: string;
  targetRole: string;
  readinessScore: number;
  readinessEstimate: string;
  roadmap?: unknown;
  certifications: string[];
  recommendedTechnologies: string[];
  recommendedProjects: string[];
  interviewPrepAreas: string[];
  careerStrategy: string;
}): Promise<string> {
  const db = getFirebaseDb();
  console.time(`Firestore:saveCareerPlanDoc:${plan.userId}`);

  const op = async (): Promise<string> => {
    try {
      const ref = await addDoc(collection(db, "careerPlans"), {
        ...plan,
        createdAt: serverTimestamp(),
      });

      updateUserProfileDoc(plan.userId, {
        readinessScore: plan.readinessScore,
        targetRole: plan.targetRole,
      }).catch(console.warn);

      return ref.id;
    } catch (err) {
      console.warn(`[Firestore] saveCareerPlanDoc error:`, err);
      return "fallback-plan-id";
    } finally {
      console.timeEnd(`Firestore:saveCareerPlanDoc:${plan.userId}`);
    }
  };

  return await withTimeout(op(), 5000, "fallback-plan-id", `saveCareerPlanDoc`);
}

export async function getLatestCareerPlanDoc(userId: string): Promise<CareerPlan | null> {
  const db = getFirebaseDb();
  console.time(`Firestore:getLatestCareerPlanDoc:${userId}`);

  const op = async (): Promise<CareerPlan | null> => {
    try {
      const q = query(
        collection(db, "careerPlans"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const d = snap.docs[0];
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        targetRole: data.targetRole || "Full Stack Developer",
        readinessScore: Number(data.readinessScore) || 0,
        readinessEstimate: data.readinessEstimate || "2-3 months",
        skillGaps: data.skillGaps || [],
        recommendedTechnologies: data.recommendedTechnologies || [],
        recommendedCertifications: data.certifications || data.recommendedCertifications || [],
        recommendedProjects: data.recommendedProjects || [],
        interviewPrepAreas: data.interviewPrepAreas || [],
        careerStrategy: data.careerStrategy || "",
        createdAt: convertTimestamp(data.createdAt),
      };
    } catch (err) {
      console.warn(`[Firestore] getLatestCareerPlanDoc error:`, err);
      return null;
    } finally {
      console.timeEnd(`Firestore:getLatestCareerPlanDoc:${userId}`);
    }
  };

  return await withTimeout(op(), 4000, null, `getLatestCareerPlanDoc`);
}
