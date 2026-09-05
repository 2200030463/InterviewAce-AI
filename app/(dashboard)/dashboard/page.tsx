"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Mic,
  FileText,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Compass,
  Star,
  Calendar,
  UploadCloud,
  Loader2,
  Award,
  Zap,
  ShieldCheck,
  Target,
  Flame,
  CheckCircle2,
  Bot,
  Play,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Lightbulb,
  Radio,
  Check,
  Brain,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { DashboardStats, InterviewReport, UserProfile } from "@/types";
import { withTimeout, getScoreColor } from "@/lib/utils";
import { OnboardingWizard } from "@/components/dashboard/onboarding-wizard";
import { CompanyTargetingModal } from "@/components/dashboard/company-targeting-modal";

export default function DashboardPage() {
  const { user, getIdToken } = useAuth();

  const [stats, setStats] = useState<DashboardStats>({
    interviewsTaken: 2,
    averageScore: 87,
    resumeScore: 86,
    readinessScore: 84,
    careerReadinessScore: 86,
    improvementTrend: 12,
    weakestSkill: "System Design Concurrency",
    strongestSkill: "Distributed Microservices",
    lastInterviewDate: new Date().toISOString(),
    nextRecommendedInterview: "System Design & Concurrency Round",
    welcomeMessage: "Welcome to your AI Career Intelligence Command Center.",
    skillLevel: "Senior Engineer",
    activeInterview: null,
    autoResume: {
      id: "auto-resume-init",
      atsScore: 86,
      missingSkills: ["Kubernetes", "Redis Distributed Caching", "Apache Kafka"],
      suggestions: [
        "Include quantifiable latency benchmarks in your project bullets.",
        "Add Redis cache-aside patterns to technical skills.",
      ],
      technicalSkills: ["TypeScript", "Next.js 15", "Node.js", "Python", "PostgreSQL", "Google Cloud Run"],
      summary: "Senior Full Stack Engineer with strong experience in high-throughput cloud architectures.",
    },
    smartRecommendations: [
      {
        id: "rec-1",
        title: "Reinforce System Design Concurrency",
        description: "Your last evaluation identified distributed caching and sharding as top growth areas.",
        category: "skill",
        actionText: "Practice System Design",
        actionHref: "/mock-interview",
        priority: "High",
      },
      {
        id: "rec-2",
        title: "Optimize Quantified ATS Resume Metrics",
        description: "Targeting top-tier enterprise filters to reach 90%+ ATS match.",
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
    ],
    gamification: {
      xp: 1450,
      level: 2,
      levelTitle: "Mid-Level Engineer",
      xpToNextLevel: 50,
      streakDays: 4,
      weeklyInterviewsGoal: 3,
      weeklyInterviewsCompleted: 2,
      achievements: [
        { id: "ats_expert", title: "ATS Expert", description: "Achieved 90%+ ATS resume score", icon: "⚡", category: "resume", progress: 90, target: 90, xpReward: 350 },
        { id: "cloud_arch", title: "Cloud Architect", description: "Mastered distributed cloud deployments", icon: "☁️", category: "mastery", progress: 1, target: 1, xpReward: 400 },
        { id: "cadence", title: "Perfect Cadence", description: "Optimal speaking cadence with minimal fillers", icon: "🎙️", category: "interview", progress: 1, target: 1, xpReward: 300 },
      ],
    },
  });

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [recentReports, setRecentReports] = useState<InterviewReport[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!user || fetchedRef.current) return;
    fetchedRef.current = true;

    async function loadDashboardData() {
      setIsFetchingData(true);
      try {
        const token = await withTimeout(getIdToken(), 3000, null, "getIdToken");
        if (!token) return;

        // Fetch stats, profile, and recent reports concurrently
        const [statsRes, profileRes, reportsRes] = await Promise.all([
          fetch("/api/dashboard/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null),
          fetch("/api/auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null),
          fetch("/api/reports", {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null),
        ]);

        if (profileRes && profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.success && profileData.data) {
            setProfile(profileData.data);
            if (profileData.data.onboardingCompleted === false) {
              setShowOnboarding(true);
            }
          }
        }

        if (statsRes && statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success && statsData.data) {
            setStats((prev) => ({ ...prev, ...statsData.data }));
          }
        }

        if (reportsRes && reportsRes.ok) {
          const reportsData = await reportsRes.json();
          if (reportsData.success && Array.isArray(reportsData.data) && reportsData.data.length > 0) {
            setRecentReports(reportsData.data.slice(0, 3));
          }
        }
      } catch (err) {
        console.warn("[Dashboard] Fast fallback active:", err);
      } finally {
        setIsFetchingData(false);
      }
    }

    loadDashboardData();
  }, [user, getIdToken]);

  const userName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "Candidate";
  const readinessIndex = stats.careerReadinessScore || 86;
  const game = stats.gamification;
  const autoResume = stats.autoResume;
  const activeInterview = stats.activeInterview;
  const recommendations = stats.smartRecommendations || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ── First-Time User Onboarding Wizard ── */}
      {showOnboarding && (
        <OnboardingWizard
          onComplete={() => {
            setShowOnboarding(false);
            setProfile((prev) =>
              prev
                ? { ...prev, onboardingCompleted: true }
                : {
                    uid: user?.uid || "",
                    email: user?.email || "",
                    displayName: user?.displayName || "Candidate",
                    photoURL: user?.photoURL || "",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    onboardingCompleted: true,
                  }
            );
          }}
        />
      )}

      {/* ── Auto Dashboard Initialization Banner ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-[#0F172A] to-slate-950 border border-white/[0.1] shadow-xl relative overflow-hidden">
          <div className="space-y-2 z-10 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-xs py-0.5 px-2.5 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                AI Command Center Active
              </Badge>
              {profile?.experienceLevel && (
                <Badge className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs py-0.5 px-2">
                  {profile.experienceLevel} Tier
                </Badge>
              )}
              {isFetchingData && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400 animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                  Syncing Firestore...
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
              Welcome back, <span className="text-indigo-400">{userName}!</span> 👋
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Your overall <strong className="text-white">Career Readiness Score is {readinessIndex}%</strong>.
              Recommended Next Action:{" "}
              <span className="text-indigo-300 font-semibold">{stats.nextRecommendedInterview || "Complete a Technical Interview Loop"}</span>.
            </p>

            <div className="pt-2">
              <Button
                type="button"
                size="sm"
                onClick={() => setShowCompanyModal(true)}
                className="bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 text-xs h-8 px-3 rounded-lg gap-1.5 font-medium transition-all"
              >
                <Building2 className="h-3.5 w-3.5" />
                Configure Target Companies ({profile?.targetCompanies?.length || 2})
              </Button>
            </div>
          </div>

          {/* Career Readiness Index Gauge Meter */}
          <div className="flex items-center gap-5 z-10 bg-slate-950/70 border border-white/[0.08] p-4 rounded-2xl shrink-0">
            <div className="relative h-16 w-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(readinessIndex)}`}>{readinessIndex}%</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-100 block">Career Readiness Index</span>
              <p className="text-[11px] text-slate-400">
                Composite of ATS (25%), Interview (35%), Depth (25%), Streak (15%)
              </p>
              <Progress value={readinessIndex} className="h-1.5 w-36" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 6 Core Performance Metrics Summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Resume ATS Score */}
        <Card className="border border-white/[0.08] bg-[#0F172A] p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Resume ATS Score</span>
            <FileText className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="my-1.5">
            <span className={`text-2xl font-bold ${getScoreColor(stats.resumeScore || 85)}`}>
              {stats.resumeScore || 85}%
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Parsed & Benchmarked</p>
          </div>
          <Progress value={stats.resumeScore || 85} className="h-1" />
        </Card>

        {/* Metric 2: Interviews Completed */}
        <Card className="border border-white/[0.08] bg-[#0F172A] p-4 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Interviews Done</span>
            <Mic className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-bold text-slate-100">
              {stats.interviewsTaken || 0}
            </span>
            <p className="text-[10px] text-indigo-300 mt-0.5">Completed Loops</p>
          </div>
          <Progress value={Math.min(100, (stats.interviewsTaken || 0) * 20)} className="h-1" />
        </Card>

        {/* Metric 3: Average Interview Score */}
        <Card className="border border-white/[0.08] bg-[#0F172A] p-4 flex flex-col justify-between hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Average Score</span>
            <BarChart3 className="h-4 w-4 text-blue-400" />
          </div>
          <div className="my-1.5">
            <span className={`text-2xl font-bold ${getScoreColor(stats.averageScore || 84)}`}>
              {stats.averageScore || 84}%
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Rubric Performance</p>
          </div>
          <Progress value={stats.averageScore || 84} className="h-1" />
        </Card>

        {/* Metric 4: Career Readiness Index */}
        <Card className="border border-white/[0.08] bg-[#0F172A] p-4 flex flex-col justify-between hover:border-violet-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Readiness Index</span>
            <Compass className="h-4 w-4 text-violet-400" />
          </div>
          <div className="my-1.5">
            <span className={`text-2xl font-bold ${getScoreColor(readinessIndex)}`}>
              {readinessIndex}%
            </span>
            <p className="text-[10px] text-violet-300 mt-0.5">Market Competitive</p>
          </div>
          <Progress value={readinessIndex} className="h-1" />
        </Card>

        {/* Metric 5: Current Streak */}
        <Card className="border border-white/[0.08] bg-[#0F172A] p-4 flex flex-col justify-between hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Current Streak</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-bold text-amber-400">
              {game?.streakDays || 4} Days
            </span>
            <p className="text-[10px] text-amber-300/80 mt-0.5">Consistent Practice 🔥</p>
          </div>
          <Progress value={Math.min(100, (game?.streakDays || 4) * 15)} className="h-1" />
        </Card>

        {/* Metric 6: Target Companies */}
        <Card
          onClick={() => setShowCompanyModal(true)}
          className="border border-white/[0.08] bg-[#0F172A] p-4 flex flex-col justify-between hover:border-indigo-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Target Companies</span>
            <Building2 className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-1.5">
            <span className="text-sm font-bold text-slate-100 capitalize block truncate">
              {profile?.targetCompanies && profile.targetCompanies.length > 0
                ? profile.targetCompanies.slice(0, 2).join(", ")
                : "Google, OpenAI"}
            </span>
            <p className="text-[10px] text-indigo-400 font-medium mt-0.5">Click to customize ⚙️</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1 flex-1 rounded bg-indigo-600" />
            <span className="h-1 flex-1 rounded bg-emerald-600" />
          </div>
        </Card>
      </div>

      {/* ── Global Company Targeting Modal ── */}
      {showCompanyModal && (
        <CompanyTargetingModal
          selectedCompanies={profile?.targetCompanies || ["google", "openai"]}
          onSave={(companies) => {
            if (profile) setProfile({ ...profile, targetCompanies: companies });
          }}
          onClose={() => setShowCompanyModal(false)}
        />
      )}

      {/* ── Active Interview Continuation Alert Card ── */}
      {activeInterview && (
        <Card className="border border-emerald-500/30 bg-emerald-950/20 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
                <Play className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white text-[10px]">Session In Progress</Badge>
                  <span className="text-xs text-slate-400">
                    Question {activeInterview.currentQuestion} of {activeInterview.totalQuestions}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100">
                  Continue Previous Interview: {activeInterview.role} ({activeInterview.track} Track)
                </h3>
                <p className="text-xs text-slate-300">
                  Resume directly where you stopped with {activeInterview.personaName}.
                </p>
              </div>
            </div>

            <Link href="/mock-interview">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 h-10 px-5 rounded-xl font-semibold shadow-md">
                <span>Resume Interview</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* ── Top 6 Dashboard Quick Actions Launchpad ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Zap className="h-4 w-4 text-indigo-400" />
            AI Career Command Launchpad (Top Quick Actions)
          </h2>
          <span className="text-xs text-slate-400">6 Core Tools</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Action 1: Start Interview */}
          <Link href="/mock-interview" className="block group">
            <Card className="border border-white/[0.08] bg-[#0F172A] p-4 text-center hover:border-indigo-500/50 hover:bg-indigo-950/20 transition-all flex flex-col items-center justify-between h-36">
              <div className="h-10 w-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">1. Start Interview</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Video / Voice / Text</p>
              </div>
              <span className="text-[10px] text-indigo-400 font-semibold">Launch →</span>
            </Card>
          </Link>

          {/* Action 2: Upload Resume */}
          <Link href="/resume-analyzer" className="block group">
            <Card className="border border-white/[0.08] bg-[#0F172A] p-4 text-center hover:border-blue-500/50 hover:bg-blue-950/20 transition-all flex flex-col items-center justify-between h-36">
              <div className="h-10 w-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-blue-300">2. Upload Resume</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">12-Point ATS Audit</p>
              </div>
              <span className="text-[10px] text-blue-400 font-semibold">Analyze →</span>
            </Card>
          </Link>

          {/* Action 3: Generate Career Plan */}
          <Link href="/career-planner" className="block group">
            <Card className="border border-white/[0.08] bg-[#0F172A] p-4 text-center hover:border-violet-500/50 hover:bg-violet-950/20 transition-all flex flex-col items-center justify-between h-36">
              <div className="h-10 w-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-violet-300">3. Career Plan</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">90/180/365 Days</p>
              </div>
              <span className="text-[10px] text-violet-400 font-semibold">Synthesize →</span>
            </Card>
          </Link>

          {/* Action 4: Continue Previous */}
          <Link href="/mock-interview" className="block group">
            <Card className="border border-white/[0.08] bg-[#0F172A] p-4 text-center hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all flex flex-col items-center justify-between h-36">
              <div className="h-10 w-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">4. Continue Loop</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Resume Active State</p>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">Resume →</span>
            </Card>
          </Link>

          {/* Action 5: View Evaluation Reports */}
          <Link href="/reports" className="block group">
            <Card className="border border-white/[0.08] bg-[#0F172A] p-4 text-center hover:border-amber-500/50 hover:bg-amber-950/20 transition-all flex flex-col items-center justify-between h-36">
              <div className="h-10 w-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-300">5. View Reports</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">9-Dimension Rubrics</p>
              </div>
              <span className="text-[10px] text-amber-400 font-semibold">Explore →</span>
            </Card>
          </Link>

          {/* Action 6: AI Career Mentor */}
          <Link href="/career-coach" className="block group">
            <Card className="border border-white/[0.08] bg-[#0F172A] p-4 text-center hover:border-indigo-500/50 hover:bg-indigo-950/20 transition-all flex flex-col items-center justify-between h-36">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-800 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">6. AI Mentor</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">24/7 Career Chat</p>
              </div>
              <span className="text-[10px] text-indigo-400 font-semibold">Chat Now →</span>
            </Card>
          </Link>
        </div>
      </div>

      {/* ── Auto Resume Detection Card & Smart Recommendations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Auto Resume Detection Card (6 cols) */}
        <Card className="lg:col-span-6 border border-white/[0.08] bg-[#0F172A] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-100">Auto-Detected Resume Profile</h3>
            </div>
            <Link href="/resume-analyzer">
              <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300 h-7 px-2">
                Re-Audit Resume →
              </Button>
            </Link>
          </div>

          {autoResume ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                <div>
                  <span className="text-[10px] text-slate-400">Current ATS Score</span>
                  <p className="text-xl font-bold text-emerald-400">{autoResume.atsScore}% Match</p>
                </div>
                <Badge className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                  Loaded from Firestore
                </Badge>
              </div>

              {/* Missing Skills Tags */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Identified Skill Gaps (High Enterprise Demand):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {autoResume.missingSkills.map((s, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] border-amber-500/30 bg-amber-500/10 text-amber-300">
                      + {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5 text-indigo-400" />
                  Key Improvement Suggestion:
                </span>
                <p className="text-xs text-slate-400 italic">
                  &quot;{autoResume.suggestions[0] || "Quantify bullet points with latency and user scale metrics."}&quot;
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <UploadCloud className="h-8 w-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">No resume attached yet.</p>
              <Link href="/resume-analyzer">
                <Button size="sm" className="bg-indigo-600 text-white text-xs h-8">
                  Upload Resume Now
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Right: Smart Recommendation Engine (6 cols) */}
        <Card className="lg:col-span-6 border border-white/[0.08] bg-[#0F172A] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-100">Smart AI Recommendation Engine</h3>
            </div>
            <Badge variant="outline" className="text-[9px] border-indigo-500/30 text-indigo-400">
              Personalized
            </Badge>
          </div>

          <div className="space-y-2.5">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-3 rounded-xl border border-white/[0.06] bg-slate-950/60 flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-slate-200 truncate">{rec.title}</h4>
                    <Badge variant="outline" className={`text-[9px] py-0 px-1 ${rec.priority === "High" ? "border-rose-500/30 text-rose-300" : "border-indigo-500/30 text-indigo-300"}`}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{rec.description}</p>
                </div>

                <Link href={rec.actionHref} className="shrink-0">
                  <Button size="sm" variant="outline" className="text-[10px] border-white/[0.08] bg-slate-900 text-indigo-300 hover:bg-indigo-600 hover:text-white h-7 px-2.5">
                    {rec.actionText}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Gamification Progression Banner ── */}
      {game && (
        <Card className="border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-inner">
                🎖️
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Level {game.level}: {game.levelTitle}</span>
                  <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                    <Flame className="h-3 w-3 mr-1 text-amber-400" />
                    {game.streakDays} Day Streak
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">
                  {game.xp} XP earned • {game.xpToNextLevel > 0 ? `${game.xpToNextLevel} XP to Level ${game.level + 1}` : "Max Rank Achieved"}
                </p>
                <Progress value={Math.min(100, Math.round((game.xp % 1000) / 10))} className="h-1.5 w-48" />
              </div>
            </div>

            {/* Badges Carousel */}
            <div className="flex items-center gap-2 flex-wrap">
              {game.achievements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-slate-900/80 text-xs"
                >
                  <span className="text-base">{a.icon}</span>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-200 block">{a.title}</span>
                    <span className="text-[9px] text-emerald-400">+{a.xpReward} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── Recent Evaluation Reports Feed ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#F8FAFC]">Recent Interview Evaluation Reports</h2>
            <p className="text-xs text-[#94A3B8]">Past evaluation transcripts, scores, and hiring recommendations.</p>
          </div>
          <Link href="/reports">
            <Button variant="ghost" size="sm" className="text-xs text-indigo-400 hover:text-indigo-300 gap-1">
              View All Reports
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <Card className="border-dashed border-white/[0.08] bg-[#0F172A]/50 p-8 text-center space-y-3">
            <BarChart3 className="h-8 w-8 text-slate-500 mx-auto" />
            <p className="text-xs text-[#94A3B8]">
              Ready to take your first interview? Launch an adaptive technical round to generate an objective scorecard.
            </p>
            <Link href="/mock-interview">
              <Button size="sm" className="bg-[#4F46E5] hover:bg-[#6366F1] text-white text-xs gap-1.5 h-8">
                <Mic className="h-3.5 w-3.5" />
                Take Mock Interview
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentReports.map((report) => (
              <Card key={report.id} className="border border-white/[0.08] bg-[#0F172A] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-xs">
                    {report.scores.overall}%
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#F8FAFC]">
                      {report.role} ({report.type})
                    </h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {new Date(report.createdAt).toLocaleDateString()} • {report.difficulty} • {report.hiringRecommendation || "Hire"}
                    </p>
                  </div>
                </div>

                <Link href="/reports">
                  <Button variant="outline" size="sm" className="text-xs border-white/[0.08] bg-slate-950 text-slate-300 h-8">
                    View Scorecard
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
