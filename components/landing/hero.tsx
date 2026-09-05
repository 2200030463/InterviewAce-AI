"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Sparkles,
  Shield,
  X,
  FileText,
  Bot,
  Compass,
  TrendingUp,
  Activity,
  Award,
} from "lucide-react";
import Link from "next/link";

const perks = [
  "Free Starter Tier",
  "No Credit Card Required",
  "Powered by Google Gemini 1.5 Pro",
  "Cloud Firestore Real-time Sync",
];

export function HeroSection() {
  const { user, signInWithGoogle } = useAuth();
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <>
      <section className="relative min-h-[95vh] flex flex-col justify-center items-center overflow-hidden pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle Ambient Background */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-indigo-600/[0.08] blur-[150px] rounded-full" />
          <div className="absolute top-1/3 left-1/4 w-[450px] h-[350px] bg-violet-600/[0.05] blur-[120px] rounded-full" />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          {/* Ideathon Badge */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0F172A]/90 backdrop-blur-md px-4 py-1.5 text-xs sm:text-sm text-[#F8FAFC] mb-8 shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-medium">Google Cloud Ideathon Finalist</span>
            <span className="text-slate-600">|</span>
            <span className="text-indigo-400 font-medium flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Gemini 1.5 Pro
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F8FAFC] mb-6 leading-[1.1]"
          >
            Master Every Interview
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
              With AI
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-xl text-[#94A3B8] max-w-2xl mx-auto mb-8 leading-relaxed font-normal"
          >
            Practice interviews, analyze resumes, identify skill gaps, and accelerate
            your career growth with Gemini AI.
          </motion.p>

          {/* Trust Value Points */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-10 text-xs sm:text-sm text-[#94A3B8]"
          >
            {perks.map((perk) => (
              <span key={perk} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                {perk}
              </span>
            ))}
          </motion.div>

          {/* Primary Call to Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            {user ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  size="xl"
                  className="w-full sm:w-auto bg-[#4F46E5] hover:bg-[#6366F1] text-white font-medium px-8 h-12 rounded-xl shadow-lg shadow-indigo-950/40 gap-2"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button
                size="xl"
                onClick={signInWithGoogle}
                className="w-full sm:w-auto bg-[#4F46E5] hover:bg-[#6366F1] text-white font-medium px-8 h-12 rounded-xl shadow-lg shadow-indigo-950/40 gap-2.5"
                id="hero-cta-start-google"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Start Free With Google
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}

            <Button
              size="xl"
              variant="outline"
              onClick={() => setDemoOpen(true)}
              className="w-full sm:w-auto border-white/[0.12] bg-[#0F172A]/80 hover:bg-[#111827] text-[#F8FAFC] px-7 h-12 rounded-xl gap-2 text-sm"
              id="hero-cta-watch-demo"
            >
              <Play className="h-3.5 w-3.5 fill-current text-indigo-400" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Floating UI Mockup Section (Stripe / Linear style) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative mx-auto max-w-4xl rounded-2xl border border-white/[0.08] bg-[#0F172A]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {/* ATS Score Card Preview */}
              <div className="p-4 rounded-xl border border-white/[0.06] bg-[#111827]/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">ATS Resume Match</span>
                  <FileText className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-emerald-400">92%</span>
                  <span className="text-[11px] text-slate-400">Top 5% candidate</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Keywords verified for Cloud & Full Stack architectures.
                </p>
              </div>

              {/* Live Interview Waveform Preview */}
              <div className="p-4 rounded-xl border border-white/[0.06] bg-[#111827]/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">AI Adaptive Round</span>
                  <Bot className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-indigo-300">Q5 / 10</span>
                  <span className="text-[11px] text-slate-400">Technical Deep-Dive</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Gemini 1.5 Pro evaluating system scalability response.
                </p>
              </div>

              {/* Career Readiness Meter Preview */}
              <div className="p-4 rounded-xl border border-white/[0.06] bg-[#111827]/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Job Readiness Score</span>
                  <Compass className="h-4 w-4 text-violet-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-violet-400">86%</span>
                  <span className="text-[11px] text-slate-400">Estimated 3 Weeks</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Target certifications & portfolio projects generated.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Walkthrough / Demo Modal */}
      <AnimatePresence>
        {demoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl rounded-2xl bg-[#0F172A] border border-white/[0.1] p-6 shadow-2xl space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#F8FAFC]">InterviewAce AI — Interactive Overview</h3>
                    <p className="text-xs text-[#94A3B8]">Production-ready AI interview platform architecture</p>
                  </div>
                </div>
                <button
                  onClick={() => setDemoOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#111827]/80 border border-white/[0.06] space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-[#F8FAFC]">1. ATS Resume Parser</h4>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Multimodal PDF text extraction with Gemini 1.5 Pro keyword matching and skill audits.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#111827]/80 border border-white/[0.06] space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-[#F8FAFC]">2. AI Mock Interview</h4>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    10-turn adaptive questioning with dynamic follow-ups across 8 tech role tracks.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#111827]/80 border border-white/[0.06] space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                    <Compass className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-[#F8FAFC]">3. Career Intelligence</h4>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Personalized readiness scores, project blueprints, and high-impact certification plans.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDemoOpen(false)}
                  className="border-white/[0.1] text-slate-300 text-xs"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setDemoOpen(false);
                    signInWithGoogle();
                  }}
                  className="bg-[#4F46E5] hover:bg-[#6366F1] text-white text-xs gap-2"
                >
                  Get Started with Google
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
