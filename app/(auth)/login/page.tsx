"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Shield, ArrowRight, Mail, Lock, KeyRound, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail, resetPassword } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      setLoginSuccess(true);
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      setLoginSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch {
      // Error handled in auth provider toast
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      setLoginSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch {
      // Error handled in provider
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error("Please enter your account email address.");
      return;
    }

    setResetting(true);
    try {
      await resetPassword(resetEmail);
      setForgotPasswordOpen(false);
      setResetEmail("");
    } catch {
      // Error handled in auth provider toast
    } finally {
      setResetting(false);
    }
  };

  if (loading || loginSuccess) {
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
            <h3 className="text-base font-bold text-slate-100">Authentication Verified</h3>
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
            Master Every Interview With AI
          </h1>
          <p className="text-sm text-[#94A3B8] leading-relaxed font-normal">
            Adaptive 10-turn AI interviews, comprehensive resume ATS audits, and customized career roadmaps with Gemini 1.5 Pro.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-500 flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            Firebase Authentication & Firestore Database
          </span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm space-y-6"
        >
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
              Sign in to InterviewAce
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8]">
              Enter your credentials or continue with Google.
            </p>
          </div>

          {/* Primary Google Auth */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-11 bg-white hover:bg-slate-100 text-slate-900 font-medium text-xs sm:text-sm rounded-xl gap-2.5 shadow-sm transition-all"
            id="google-signin-btn"
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
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-slate-500">
              <span className="bg-[#030712] px-3">Or sign in with email</span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-3.5">
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#94A3B8]">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-[11px] text-indigo-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-10 bg-[#111827] border-white/[0.08] text-xs text-[#F8FAFC] focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-10 bg-[#4F46E5] hover:bg-[#6366F1] text-white font-medium text-xs sm:text-sm rounded-xl mt-2 shadow-sm"
              id="email-signin-btn"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="text-center text-xs text-[#94A3B8] pt-2">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-400 font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#0F172A] border border-white/[0.1] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <KeyRound className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-[#F8FAFC]">Reset Password</h3>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Enter your email address and we&apos;ll send you a password reset link.
            </p>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <Input
                type="email"
                placeholder="name@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="h-10 bg-[#111827] border-white/[0.08] text-xs text-[#F8FAFC]"
                required
              />
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForgotPasswordOpen(false)}
                  className="border-white/[0.1] text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={resetting}
                  className="bg-[#4F46E5] hover:bg-[#6366F1] text-white text-xs"
                >
                  {resetting ? "Sending..." : "Send Reset Email"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
