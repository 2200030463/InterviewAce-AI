"use client";

import { motion } from "framer-motion";
import { Upload, Mic, BarChart3, Compass, Check } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload & Audit Resume",
    description:
      "Submit your PDF resume to extract key competencies and generate an instant ATS benchmark score with keyword gap analysis.",
    highlights: ["PDF text parsing", "ATS score calculation", "Missing keywords detection"],
  },
  {
    step: "02",
    icon: Mic,
    title: "Practice AI Mock Interview",
    description:
      "Select your target role and difficulty level. Gemini 1.5 Pro conducts a structured 10-question interview with dynamic follow-ups.",
    highlights: ["Role-specific question bank", "Dynamic follow-ups", "Multi-turn context"],
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Receive Evaluation Report",
    description:
      "Get a 5-dimension scorecard detailing Technical Depth, Communication, Problem Solving, Confidence, and Industry Readiness.",
    highlights: ["Objective score rubric", "Strengths & weaknesses", "Specific coaching advice"],
  },
  {
    step: "04",
    icon: Compass,
    title: "Execute Career Strategy",
    description:
      "Receive a customized career intelligence plan with skill gaps, target certifications, portfolio projects, and readiness timeline.",
    highlights: ["Estimated readiness timeline", "High-yield portfolio projects", "Targeted interview drills"],
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30 border-y border-white/[0.06]" id="how-it-works">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 block">
            Structured Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-100 mb-4">
            How InterviewAce AI prepares you
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto text-base">
            Four sequential steps that take you from skill discovery to interview mastery.
          </p>
        </motion.div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 flex flex-col justify-between hover:border-white/[0.16] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    STEP {item.step}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-slate-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.04] space-y-1.5">
                {item.highlights.map((h, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                    <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
