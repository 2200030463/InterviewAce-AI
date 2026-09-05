"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Bot,
  BarChart3,
  Compass,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  {
    icon: FileText,
    title: "Resume Analyzer",
    description:
      "Gemini 1.5 Pro analyzes your resume against industry standards, calculating ATS scores, technical skills, and actionable keyword optimizations.",
    href: "/resume-analyzer",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    cta: "Analyze Resume",
    badge: "ATS Parser",
  },
  {
    icon: Bot,
    title: "AI Mock Interview",
    description:
      "Engage in dynamic, 10-turn adaptive technical and behavioral interviews with real-time follow-ups tailored to your exact tech stack.",
    href: "/mock-interview",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    cta: "Start Interview",
    badge: "Adaptive Multi-turn",
  },
  {
    icon: BarChart3,
    title: "Evaluation Reports",
    description:
      "Get detailed 5-dimensional rubric scorecards covering Technical Knowledge, Communication, Problem Solving, Confidence, and Industry Readiness.",
    href: "/reports",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    cta: "View Reports",
    badge: "5-Dimension Rubric",
  },
  {
    icon: Compass,
    title: "Career Intelligence Planner",
    description:
      "Synthesize your interview weaknesses and ATS skill gaps into structured milestone roadmaps, high-yield certifications, and portfolio project blueprints.",
    href: "/career-planner",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    cta: "Explore Planner",
    badge: "Personalized Roadmap",
  },
  {
    icon: LayoutDashboard,
    title: "Analytics Dashboard",
    description:
      "Track your score trajectory over time, monitor career readiness progression, and manage your complete interview preparation journey in one place.",
    href: "/dashboard",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    cta: "Open Dashboard",
    badge: "Unified Metrics",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          Comprehensive Interview Suite
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC]">
          End-to-End Interview Preparation
        </h2>
        <p className="text-sm sm:text-base text-[#94A3B8] max-w-2xl mx-auto">
          Every tool you need to transform from interview anxiety to top-tier candidate offers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`rounded-2xl border border-white/[0.08] bg-[#0F172A] p-6 flex flex-col justify-between hover:border-white/[0.18] hover:bg-[#111827] transition-all group ${
                i === 4 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`h-11 w-11 rounded-xl ${feature.bg} flex items-center justify-center ${feature.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 border border-white/[0.08] bg-slate-950 px-2.5 py-1 rounded-full">
                    {feature.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[#F8FAFC] group-hover:text-indigo-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/[0.04] mt-6">
                <Link href={feature.href} className="w-full block">
                  <Button
                    variant="outline"
                    className="w-full justify-between text-xs border-white/[0.08] bg-slate-950 hover:bg-[#4F46E5] hover:text-white hover:border-[#4F46E5] text-slate-200 group-hover:border-white/[0.15] transition-all h-9 rounded-lg"
                  >
                    <span>{feature.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
