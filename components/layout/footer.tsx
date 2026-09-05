import Link from "next/link";
import { Sparkles, Globe, Code2, Briefcase, Mail, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Capabilities: [
    { label: "Resume Analyzer", href: "/resume-analyzer" },
    { label: "AI Mock Interviews", href: "/mock-interview" },
    { label: "Candidate Reports", href: "/reports" },
    { label: "Career Planner", href: "/career-planner" },
  ],
  Platform: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing Tiers", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  Stack: [
    { label: "Google Gemini 1.5 Pro", href: "https://ai.google.dev" },
    { label: "Firebase Auth & Firestore", href: "https://firebase.google.com" },
    { label: "Google Cloud Run", href: "https://cloud.google.com/run" },
    { label: "Cloud Secret Manager", href: "https://cloud.google.com/security/products/secret-manager" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-slate-950/90 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-slate-100">
                InterviewAce AI
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Enterprise-grade AI interview preparation, ATS resume auditing, and personalized career intelligence powered by Google Cloud & Gemini 1.5 Pro.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-white/[0.08] text-[11px] font-medium text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Google Cloud Ideathon Submission
              </span>
            </div>
          </div>

          {/* Nav Categories */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
                {category}
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-indigo-300 transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-slate-400 hover:text-indigo-300 transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10 bg-white/[0.06]" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} InterviewAce AI. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400 font-medium">All Cloud & AI Systems Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
