"use client";

import { motion } from "framer-motion";
import { Cloud, Flame, Sparkles, Server, Shield, Cpu } from "lucide-react";

const techBadges = [
  { name: "Google Cloud", icon: Cloud, label: "Infrastructure" },
  { name: "Firebase", icon: Flame, label: "Auth & Firestore" },
  { name: "Gemini 1.5 Pro", icon: Sparkles, label: "Multimodal AI" },
  { name: "Cloud Run", icon: Server, label: "Serverless Container" },
  { name: "Secret Manager", icon: Shield, label: "Security & KMS" },
  { name: "Next.js 15", icon: Cpu, label: "App Router & SSR" },
];

export function TrustedBySection() {
  return (
    <section className="py-12 border-y border-white/[0.06] bg-slate-950/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs font-medium uppercase tracking-wider text-slate-500 mb-8"
        >
          Engineered on Enterprise Google Cloud & AI Stack
        </motion.p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {techBadges.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/[0.04] bg-slate-900/40 hover:bg-slate-900/80 hover:border-white/[0.08] transition-all text-center group"
            >
              <item.icon className="h-5 w-5 text-indigo-400/80 group-hover:text-indigo-400 group-hover:scale-105 transition-all mb-2" />
              <span className="text-xs font-semibold text-slate-200">{item.name}</span>
              <span className="text-[10px] text-slate-500">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
