"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "How does the AI Mock Interview system work?",
    a: "InterviewAce AI uses Google Gemini 1.5 Pro to conduct interactive, role-specific interviews. It asks one question at a time across 10 progressive turns, adapting follow-ups dynamically to your answers before delivering a detailed 5-dimensional evaluation.",
  },
  {
    q: "Is my resume and interview data secure and private?",
    a: "Yes. All user data is isolated per account using Firebase Authentication and Firestore Security Rules. User transcripts, resumes, and reports can only be accessed by the authenticated owner.",
  },
  {
    q: "What roles and interview types are supported?",
    a: "We support 8 technical and product roles: Full Stack Developer, Cloud Engineer, DevOps Engineer, Data Analyst, AI Engineer, Frontend Developer, Backend Developer, and Product Manager, with Technical, HR/Behavioral, and Mixed interview modes.",
  },
  {
    q: "How does the Resume Analyzer calculate the ATS score?",
    a: "The parser audits your resume against industry benchmarks across keyword density, quantifiable achievement metrics, structural hierarchy, and technical competency coverage.",
  },
  {
    q: "What is the Career Intelligence Planner?",
    a: "It combines your resume gap analysis and mock interview performance to calculate an overall job readiness score, estimated preparation timeline, high-impact certifications, and targeted portfolio projects.",
  },
  {
    q: "Can I test the platform for free without a credit card?",
    a: "Yes. The Starter plan is 100% free with mock interview turns, ATS resume audits, and performance tracking.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950" id="faq">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 block">
            Common Inquiries
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-100 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-slate-400 max-w-md mx-auto text-base">
            Everything you need to know about the platform and evaluation process.
          </p>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-white/[0.08] bg-slate-900/60 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left gap-4 hover:bg-slate-900 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-slate-200">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-indigo-400" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-4 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/[0.04] pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
