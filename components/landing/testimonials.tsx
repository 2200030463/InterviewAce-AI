"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Alex Rivera",
    role: "Senior Full Stack Engineer at Fintech Startup",
    avatar: "AR",
    rating: 5,
    quote:
      "The 10-turn adaptive interview mode accurately mirrored the depth of actual system design and technical rounds. The ATS analyzer identified missing architecture keywords that immediate boosted recruiter responses.",
  },
  {
    name: "Devon Chen",
    role: "Cloud Architect at Enterprise SaaS",
    avatar: "DC",
    rating: 5,
    quote:
      "InterviewAce AI's Career Intelligence Planner gave me a realistic readiness timeline and identified gaps in my Kubernetes & GCP Terraform knowledge. The Gemini evaluation was remarkably accurate.",
  },
  {
    name: "Maya Patel",
    role: "DevOps Engineer at Cloud Platform",
    avatar: "MP",
    rating: 5,
    quote:
      "I practiced mock HR and technical scenarios for 2 weeks. The instant 5-dimension rubric scores helped me tighten my behavioral STAR method storytelling and technical explanations.",
  },
  {
    name: "Lucas Vance",
    role: "Data & ML Engineer",
    avatar: "LV",
    rating: 5,
    quote:
      "The Gemini multimodal resume audit gave specific, bullet-by-bullet quantifiable recommendations that took my ATS score from 54 to 88. Outstanding tool for serious candidates.",
  },
  {
    name: "Sophia Martinez",
    role: "Frontend Engineer at Scaleup",
    avatar: "SM",
    rating: 5,
    quote:
      "Being able to review past evaluation reports and track my average score increase over time provided immense confidence before walking into real interviews.",
  },
  {
    name: "David Zhang",
    role: "AI / Backend Engineer",
    avatar: "DZ",
    rating: 5,
    quote:
      "The structured project recommendations in the Career Planner were gold standard. Built two of the suggested portfolio apps and discussed them directly in my final round offer.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950" id="testimonials">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 block">
            Candidate Feedback
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-100 mb-4">
            Proven results from active job seekers
          </h2>
          <p className="text-slate-400 max-w-md mx-auto text-base">
            Engineers using AI to prepare with precision and confidence.
          </p>
        </motion.div>

        {/* 3 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 flex flex-col justify-between hover:border-white/[0.14] transition-all"
            >
              <div>
                {/* Star rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.04]">
                <div className="h-9 w-9 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{t.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
