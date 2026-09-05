"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Core tools for candidate self-preparation",
    badge: null,
    highlight: false,
    features: [
      "3 AI Mock Interviews / month",
      "Full 10-turn adaptive questioning",
      "1 Comprehensive Resume ATS Analysis",
      "5-dimensional score reports",
      "Community support",
    ],
    cta: "Get Started Free",
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For active job seekers targeting tier-1 tech roles",
    badge: "Most Popular",
    highlight: true,
    features: [
      "Unlimited AI Mock Interviews",
      "Unlimited Resume ATS Audits & Revisions",
      "Career Intelligence Planner with Custom Roadmaps",
      "Detailed Gemini 1.5 Pro feedback transcripts",
      "Role & Difficulty Customization (All 8 tech tracks)",
      "Priority API speed & cloud storage",
    ],
    cta: "Start 14-Day Free Trial",
  },
  {
    name: "Team & Bootcamps",
    price: "$49",
    period: "per seat / mo",
    description: "For university cohorts, bootcamps, and hiring teams",
    badge: null,
    highlight: false,
    features: [
      "Everything in Pro",
      "Admin Cohort Analytics Dashboard",
      "Custom Question Banks & Interview Scenarios",
      "Candidate benchmark exports (PDF & CSV)",
      "Dedicated account manager",
      "Custom SLA & SSO",
    ],
    cta: "Contact Enterprise",
  },
];

export function PricingSection() {
  const { user, signInWithGoogle } = useAuth();

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30 border-y border-white/[0.06]" id="pricing">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 block">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-100 mb-4">
            Invest in your career advancement
          </h2>
          <p className="text-slate-400 max-w-md mx-auto text-base">
            Start completely free. Upgrade anytime for unlimited AI practice.
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`relative rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 ${
                plan.highlight
                  ? "border-2 border-indigo-500/50 bg-slate-900 shadow-xl shadow-indigo-950/20"
                  : "border border-white/[0.08] bg-slate-900/50 hover:border-white/[0.14]"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                    <Sparkles className="h-3 w-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-100">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-4">
                    <span className="text-4xl font-bold text-slate-100 tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-400">{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-white/[0.06]">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Included Features:
                  </p>
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className={`h-4 w-4 shrink-0 mt-0.5 ${plan.highlight ? "text-indigo-400" : "text-emerald-400"}`} />
                      <span className="leading-relaxed">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                {user ? (
                  <Link href="/dashboard" className="w-full block">
                    <Button
                      className={`w-full h-11 rounded-xl font-medium text-xs sm:text-sm ${
                        plan.highlight
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/[0.06]"
                      }`}
                    >
                      {plan.highlight ? "Current Plan: Active" : "Access Dashboard"}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={signInWithGoogle}
                    className={`w-full h-11 rounded-xl font-medium text-xs sm:text-sm ${
                      plan.highlight
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/[0.06]"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
