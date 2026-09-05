"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function CtaSection() {
  const { user, signInWithGoogle } = useAuth();

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-gradient-to-b from-[#0F172A] to-[#030712] p-8 sm:p-14 text-center shadow-2xl"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/[0.1] blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-600/10 border border-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            Accelerate Your Tech Career
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F8FAFC]">
            Ready to Master Your Next Technical Interview?
          </h2>

          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed font-normal">
            Join candidates worldwide preparing with Gemini 1.5 Pro, real-time rubric feedback, and automated ATS resume optimization.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {user ? (
              <Link href="/dashboard">
                <Button
                  size="xl"
                  className="bg-[#4F46E5] hover:bg-[#6366F1] text-white font-medium px-8 h-12 rounded-xl shadow-lg shadow-indigo-950/50 gap-2"
                >
                  Enter Workspace Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button
                size="xl"
                onClick={signInWithGoogle}
                className="bg-[#4F46E5] hover:bg-[#6366F1] text-white font-medium px-8 h-12 rounded-xl shadow-lg shadow-indigo-950/50 gap-2.5"
                id="cta-start-google"
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
                Start Free with Google
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
