"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  FileText,
  Building2,
  Brain,
  ShieldCheck,
  Target,
  Briefcase,
  Zap,
  TrendingUp,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";

interface OnboardingWizardProps {
  onComplete: () => void;
}

const CAREER_GOALS = [
  { id: "Frontend Developer", label: "Frontend Developer", icon: "🎨", desc: "React, Next.js, Web Architecture" },
  { id: "Backend Developer", label: "Backend Developer", icon: "⚙️", desc: "Node.js, Python, Microservices, DBs" },
  { id: "Full Stack Developer", label: "Full Stack Developer", icon: "🌐", desc: "End-to-End Enterprise Applications" },
  { id: "Cloud Engineer", label: "Cloud Engineer", icon: "☁️", desc: "GCP, AWS, Kubernetes, Cloud Run" },
  { id: "DevOps Engineer", label: "DevOps Engineer", icon: "🚀", desc: "CI/CD, Observability, Infrastructure" },
  { id: "Data Engineer", label: "Data Engineer", icon: "📊", desc: "Pipelines, Spark, Warehousing, BigQuery" },
  { id: "AI Engineer", label: "AI Engineer", icon: "🧠", desc: "LLMs, PyTorch, Agentic AI, RAG" },
  { id: "Software Engineer", label: "Software Engineer", icon: "💻", desc: "Core Algorithms, Systems, Design" },
  { id: "System Architect", label: "System Architect", icon: "🏛️", desc: "High-Scale Distributed Systems" },
];

const EXPERIENCE_LEVELS = [
  { id: "Fresher", label: "Fresher (0 Years)", desc: "Graduates, campus placements & entry roles" },
  { id: "Junior", label: "Junior (1-2 Years)", desc: "Building fundamentals and shipping features" },
  { id: "Mid-Level", label: "Mid-Level (3-5 Years)", desc: "Independent execution & service ownership" },
  { id: "Senior", label: "Senior (5-8 Years)", desc: "Architectural leadership & mentorship" },
  { id: "Lead", label: "Lead / Staff (8+ Years)", desc: "Org-wide RFCs, strategy & high scale" },
];

const TARGET_COMPANIES = [
  { id: "Google", name: "Google", icon: "🔍", style: "Distributed Systems & System Design" },
  { id: "Microsoft", name: "Microsoft", icon: "💻", style: "Enterprise Reliability & Azure Scale" },
  { id: "Amazon", name: "Amazon", icon: "📦", style: "16 Leadership Principles & Bar Raiser" },
  { id: "Meta", name: "Meta", icon: "♾️", style: "Rapid Product Engineering & Architecture" },
  { id: "Netflix", name: "Netflix", icon: "🎬", style: "Freedom & High-Density Microservices" },
  { id: "Startup", name: "YC High-Growth Startup", icon: "🚀", style: "0-to-1 Product Velocity & Grit" },
  { id: "Product Company", name: "Tier-1 Product SaaS", icon: "🏢", style: "High-Impact Product Features" },
];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { getIdToken, user } = useAuth();
  const [step, setStep] = useState(1);
  const [careerGoal, setCareerGoal] = useState("Full Stack Developer");
  const [experienceLevel, setExperienceLevel] = useState("Mid-Level");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(["Google", "Startup"]);
  const [resumeText, setResumeText] = useState("");
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const toggleCompany = (comp: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(comp) ? prev.filter((c) => c !== comp) : [...prev, comp]
    );
  };

  const handleNextStep = () => {
    if (step < 5) setStep((s) => s + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleQuickResumeAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.info("Proceeding with tailored role defaults.");
      setStep(5);
      return;
    }

    setAnalyzingResume(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("resumeText", resumeText);

      await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      toast.success("Resume analyzed! Initializing your Career Blueprint.");
      setStep(5);
    } catch {
      toast.info("Continuing to Blueprint generation.");
      setStep(5);
    } finally {
      setAnalyzingResume(false);
    }
  };

  const handleFinishOnboarding = async () => {
    setSavingProfile(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Please sign in");

      // Save user onboarding profile
      await fetch("/api/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          careerGoal,
          targetRole: careerGoal,
          experienceLevel,
          targetCompanies: selectedCompanies,
          onboardingCompleted: true,
        }),
      });

      // Initialize Career Plan in background
      fetch("/api/career/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetRole: careerGoal }),
      }).catch(console.warn);

      toast.success("Welcome to InterviewAce AI! Your personalized workspace is ready. 🚀");
      onComplete();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Initialization failed";
      toast.error(msg);
      onComplete();
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl rounded-3xl bg-[#0F172A] border border-white/[0.12] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden my-auto"
      >
        {/* Top Gradient Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white font-bold text-sm shadow">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F8FAFC]">AI Career Workspace Setup</h2>
              <p className="text-[11px] text-[#94A3B8]">Personalize your hiring rubrics and intelligence dashboard.</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Step {step} of 5</span>
            <Progress value={(step / 5) * 100} className="h-1.5 w-24 mt-1" />
          </div>
        </div>

        {/* ── STEP 1: Select Career Goal ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-400" />
                Select Your Target Career Goal
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                We will configure adaptive question rubrics tailored to this discipline.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {CAREER_GOALS.map((goal) => {
                const isSelected = careerGoal === goal.id;
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => setCareerGoal(goal.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/40 text-white"
                        : "border-white/[0.08] bg-slate-950/60 hover:border-white/[0.2] text-slate-300"
                    }`}
                  >
                    <span className="text-2xl mb-1.5">{goal.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold">{goal.label}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{goal.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 2: Experience Level ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-400" />
                What is your experience level?
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Calibrates the depth, difficulty, and senior trade-off expectations of the AI interviewers.
              </p>
            </div>

            <div className="space-y-2.5">
              {EXPERIENCE_LEVELS.map((lvl) => {
                const isSelected = experienceLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setExperienceLevel(lvl.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500 text-white"
                        : "border-white/[0.08] bg-slate-950/60 hover:border-white/[0.2] text-slate-300"
                    }`}
                  >
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold">{lvl.label}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{lvl.desc}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 3: Target Companies ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-400" />
                Select Your Target Companies
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                We align mock interview rubrics with company hiring loops (Google, Amazon Bar Raiser, etc.).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {TARGET_COMPANIES.map((comp) => {
                const isSelected = selectedCompanies.includes(comp.id);
                return (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => toggleCompany(comp.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500 text-white"
                        : "border-white/[0.08] bg-slate-950/60 hover:border-white/[0.2] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{comp.icon}</span>
                      <div>
                        <h4 className="text-xs font-bold">{comp.name}</h4>
                        <p className="text-[10px] text-slate-400">{comp.style}</p>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 4: Upload Resume ── */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                Attach Resume (Optional & Fast)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste your resume text to immediately calculate your initial ATS match and skill baseline.
              </p>
            </div>

            <Textarea
              placeholder="Paste your resume summary, technical skills, and past work experience here... (Or skip to use defaults)"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={7}
              className="bg-slate-950 border-white/[0.08] text-xs font-mono resize-none focus:ring-indigo-500"
            />

            <p className="text-[11px] text-slate-400">
              💡 You can also upload a PDF resume anytime from the Resume Analyzer page.
            </p>
          </div>
        )}

        {/* ── STEP 5: Generate Career Blueprint ── */}
        {step === 5 && (
          <div className="space-y-5 text-center py-2">
            <div className="h-16 w-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
              <Brain className="h-8 w-8 animate-pulse" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-slate-100">Your AI Career Blueprint is Ready</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We have initialized your customized dashboard for <span className="text-indigo-400 font-semibold">{careerGoal}</span> ({experienceLevel} level).
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center max-w-md mx-auto">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 block">Career Goal</span>
                <p className="text-xs font-bold text-slate-100 mt-0.5 truncate">{careerGoal}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 block">Estimated Readiness</span>
                <p className="text-xs font-bold text-emerald-400 mt-0.5">82% Initial</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 block">Next Action</span>
                <p className="text-xs font-bold text-indigo-400 mt-0.5 truncate">Mock Interview</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevStep}
              className="border-white/[0.1] text-slate-300 text-xs gap-1.5 h-9"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 4 && (
            <Button
              type="button"
              onClick={handleNextStep}
              className="bg-[#4F46E5] hover:bg-[#6366F1] text-white text-xs gap-1.5 h-9 px-4 rounded-xl"
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}

          {step === 4 && (
            <Button
              type="button"
              onClick={handleQuickResumeAnalyze}
              disabled={analyzingResume}
              className="bg-[#4F46E5] hover:bg-[#6366F1] text-white text-xs gap-1.5 h-9 px-4 rounded-xl"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {analyzingResume ? "Analyzing..." : "Generate Blueprint"}
            </Button>
          )}

          {step === 5 && (
            <Button
              type="button"
              onClick={handleFinishOnboarding}
              disabled={savingProfile}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 h-10 px-6 rounded-xl font-semibold shadow-md"
            >
              <CheckCircle2 className="h-4 w-4" />
              {savingProfile ? "Entering Workspace..." : "Launch AI Command Center"}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
