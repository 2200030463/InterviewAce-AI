"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  LogOut,
  Sparkles,
  Briefcase,
  CheckCircle2,
  Building2,
  RotateCcw,
  Target,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { InterviewRole } from "@/types";
import { withTimeout } from "@/lib/utils";

const ALL_ROLES: InterviewRole[] = [
  "Full Stack Developer",
  "Cloud Engineer",
  "DevOps Engineer",
  "Data Analyst",
  "AI Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Product Manager",
];

const EXPERIENCE_OPTIONS = [
  "Fresher (0 Years)",
  "Junior (1-2 Years)",
  "Mid-Level (3-5 Years)",
  "Senior (5-8 Years)",
  "Lead / Staff (8+ Years)",
];

const COMPANY_OPTIONS = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Netflix",
  "Startup",
  "Product Company",
];

export default function ProfilePage() {
  const { user, logout, getIdToken } = useAuth();
  const [careerGoal, setCareerGoal] = useState<InterviewRole>("Full Stack Developer");
  const [experienceLevel, setExperienceLevel] = useState<string>("Mid-Level");
  const [targetCompanies, setTargetCompanies] = useState<string[]>(["Google", "Startup"]);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = await withTimeout(getIdToken(), 3000, null, "getIdToken");
        if (!token) return;
        const res = await withTimeout(
          fetch("/api/auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          4000,
          null,
          "loadProfile"
        );
        if (res && res.ok) {
          const data = await res.json();
          if (data.data) {
            const p = data.data;
            if (p.careerGoal || p.targetRole) {
              setCareerGoal(p.careerGoal || p.targetRole);
            }
            if (p.experienceLevel) {
              setExperienceLevel(p.experienceLevel);
            }
            if (Array.isArray(p.targetCompanies) && p.targetCompanies.length > 0) {
              setTargetCompanies(p.targetCompanies);
            }
            if (p.onboardingCompleted !== undefined) {
              setOnboardingCompleted(p.onboardingCompleted);
            }
          }
        }
      } catch (err) {
        console.warn("[Profile] Failed to load preferences:", err);
      }
    }
    loadProfile();
  }, [getIdToken]);

  const toggleCompany = (comp: string) => {
    setTargetCompanies((prev) =>
      prev.includes(comp) ? prev.filter((c) => c !== comp) : [...prev, comp]
    );
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: user?.uid,
          careerGoal,
          targetRole: careerGoal,
          experienceLevel,
          targetCompanies,
          onboardingCompleted: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to save profile");
      toast.success("Career preferences updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleResetOnboarding = async () => {
    setResetting(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: user?.uid,
          onboardingCompleted: false,
        }),
      });

      if (!res.ok) throw new Error("Failed to reset onboarding");
      setOnboardingCompleted(false);
      toast.success(
        "Onboarding wizard reset! It will appear next time you open the dashboard."
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Reset failed";
      toast.error(msg);
    } finally {
      setResetting(false);
    }
  };

  if (!user) return null;

  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
          Candidate Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Manage your account credentials, target companies, and AI career preferences.
        </p>
      </div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border border-white/[0.08] bg-[#0F172A]">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 text-xl border border-white/[0.1]">
                  <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                  <AvatarFallback className="bg-indigo-600/30 text-indigo-300 font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-bold text-[#F8FAFC]">{user.displayName || "Candidate"}</h2>
                  <p className="text-xs text-[#94A3B8]">{user.email || ""}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      <Shield className="h-3 w-3 mr-1" />
                      Firebase Verified
                    </Badge>
                    <Badge className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-[10px]">
                      {onboardingCompleted ? "Onboarding Completed" : "Onboarding Pending"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-white/[0.08] bg-slate-950 text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 text-xs gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Career Preferences Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border border-white/[0.08] bg-[#0F172A]">
          <CardHeader>
            <CardTitle className="text-base text-[#F8FAFC] flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-400" />
              Career Preferences & Target Companies
            </CardTitle>
            <CardDescription className="text-xs text-[#94A3B8]">
              Customize the AI interview persona, evaluation rubrics, and intelligence dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Career Goal / Target Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                Edit Career Goal / Target Role
              </label>
              <select
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value as InterviewRole)}
                className="w-full h-10 rounded-lg border border-white/[0.08] bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                Edit Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full h-10 rounded-lg border border-white/[0.08] bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {EXPERIENCE_OPTIONS.map((exp) => (
                  <option key={exp} value={exp.split(" ")[0]}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Companies */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                Edit Target Companies
              </label>
              <div className="flex flex-wrap gap-2">
                {COMPANY_OPTIONS.map((comp) => {
                  const isSelected = targetCompanies.includes(comp);
                  return (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => toggleCompany(comp)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-950/60 text-indigo-300 ring-1 ring-indigo-500"
                          : "border-white/[0.08] bg-slate-950 text-slate-400 hover:border-white/[0.2]"
                      }`}
                    >
                      {comp} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
              <Button
                onClick={handleSavePreferences}
                disabled={saving}
                className="bg-[#4F46E5] hover:bg-[#6366F1] text-white text-xs sm:text-sm h-9 px-5 rounded-lg font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                {saving ? "Saving Preferences..." : "Save Preferences"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleResetOnboarding}
                disabled={resetting}
                className="border-rose-500/30 bg-rose-950/20 text-rose-300 hover:bg-rose-600 hover:text-white text-xs h-9 px-4 rounded-lg gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {resetting ? "Resetting..." : "Reset Onboarding"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cloud Security Info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border border-white/[0.08] bg-[#0F172A]">
          <CardHeader>
            <CardTitle className="text-base text-[#F8FAFC] flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              Cloud Architecture & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-[#94A3B8]">Firebase User ID</span>
              <span className="font-mono text-slate-300 text-[11px]">{user.uid}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-[#94A3B8]">Database Isolation</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Cloud Firestore Security Rules Enforced
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#94A3B8]">AI Model</span>
              <span className="text-indigo-400 font-medium">Google Gemini Flash & Pro</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

