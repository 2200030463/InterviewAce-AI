"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Shield, User as UserIcon, Mail, Lock, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const { user, loading, signInWithGoogle, registerUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      setRegisterSuccess(true);
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!email.trim() || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await registerUser(name, email, password);
      setRegisterSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch {
      // Error handled in auth provider toast
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
      setRegisterSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch {
      // Error handled in provider
    }
  };

  if (loading || registerSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712] text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-[#0F172A] border border-white/[0.1] shadow-2xl text-center max-w-sm"
        >
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100">Account Created & Verified</h3>
            <p className="text-xs text-slate-400">Initializing your AI Career Command Center...</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 pt-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Redirecting to Dashboard</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#030712] text-[#F8FAFC]">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-[#0F172A] border-r border-white/[0.08] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-600/[0.08] blur-[120px] rounded-full" />
        </div>

        <Link href="/" className="flex items-center gap-2.5 relative z-10">
          <div className="h-8 w-8 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-base font-bold text-[#F8FAFC] tracking-tight">
            InterviewAce AI
          </span>
        </Link>

        <div className="relative z-10 max-w-md space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Google Cloud Ideathon Finalist
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F8FAFC] leading-tight">
            Create your account to start interview coaching.
          </h1>
          <p className="text-sm text-[#94A3B8] leading-relaxed font-normal">
            Adaptive 10-turn AI mock interviews, comprehensive resume ATS audits, and customized career roadmaps with Gemini 1.5 Pro.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-500 flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            Firebase Authentication & Cloud Firestore
          </span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm space-y-5"
        >
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
              Create an Account
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8]">
              Get started free with Google or email.
            </p>
          </div>

          {/* Google Auth Button */}
          <Button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full h-11 bg-white hover:bg-slate-100 text-slate-900 font-medium text-xs sm:text-sm rounded-xl gap-2.5 shadow-sm transition-all"
            id="register-google-btn"
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
            Sign up with Google
          </Button>

          {/* Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-slate-500">
              <span className="bg-[#030712] px-3">Or with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#94A3B8]">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Alexander Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 h-10 bg-[#111827] border-white/[0.08] text-xs text-[#F8FAFC] focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#94A3B8]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10 bg-[#111827] border-white/[0.08] text-xs text-[#F8FAFC] focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#94A3B8]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-10 bg-[#111827] border-white/[0.08] text-xs text-[#F8FAFC] focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#94A3B8]">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9 h-10 bg-[#111827] border-white/[0.08] text-xs text-[#F8FAFC] focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-10 bg-[#4F46E5] hover:bg-[#6366F1] text-white font-medium text-xs sm:text-sm rounded-xl mt-2 shadow-sm"
              id="register-submit-btn"
            >
              {submitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="text-center text-xs text-[#94A3B8] pt-1">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
