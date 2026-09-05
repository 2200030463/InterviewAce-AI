"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  signInWithGoogle as authSignInWithGoogle,
  signInWithEmail as authSignInWithEmail,
  registerUser as authRegisterUser,
  logout as authLogout,
  resetPassword as authResetPassword,
  getIdToken as authGetIdToken,
  syncUserProfile,
} from "@/lib/auth";
import { formatFirebaseAuthError, getFirebaseAuth } from "@/lib/firebase";

// ── Types ────────────────────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerUser: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

// ── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  registerUser: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  getIdToken: async () => null,
});

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const initialized = useRef(false);

  // ── Firebase Auth State Listener ────────────────────────────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let unsubscribe: (() => void) | null = null;

    const boot = async () => {
      try {
        const auth = getFirebaseAuth();
        if (!auth) {
          setLoading(false);
          return;
        }

        const { onAuthStateChanged } = await import("firebase/auth");

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
          setUser(firebaseUser);
          if (firebaseUser) {
            document.cookie = `session=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
            await syncUserProfile(firebaseUser);
          } else {
            document.cookie = "session=; path=/; max-age=0; SameSite=Lax";
          }
          setLoading(false);
        });
      } catch (err) {
        console.error("[AuthProvider] Auth listener init error:", err);
        setLoading(false);
      }
    };

    boot();
    return () => {
      unsubscribe?.();
    };
  }, []);

  // ── 1. Sign In with Google ───────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const authUser = await authSignInWithGoogle();
      setUser(authUser);
      toast.success(`Welcome, ${authUser.displayName?.split(" ")[0] || "there"}!`);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("[AuthProvider] Google Sign-In error:", err);
      const formatted = formatFirebaseAuthError(err);
      const errObj = err as { code?: string };
      if (errObj?.code !== "auth/popup-closed-by-user" && errObj?.code !== "auth/cancelled-popup-request") {
        toast.error(formatted, { duration: 5000 });
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  // ── 2. Sign In with Email & Password ─────────────────────────────────────────
  const signInWithEmail = useCallback(async (email: string, pass: string) => {
    setLoading(true);
    try {
      const authUser = await authSignInWithEmail(email, pass);
      setUser(authUser);
      toast.success(`Welcome back, ${authUser.displayName?.split(" ")[0] || "User"}!`);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("[AuthProvider] Email Sign-In error:", err);
      const formatted = formatFirebaseAuthError(err);
      toast.error(formatted, { duration: 5000 });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  // ── 3. Register New User ─────────────────────────────────────────────────────
  const registerUser = useCallback(async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
      const authUser = await authRegisterUser(name, email, pass);
      setUser(authUser);
      toast.success(`Account created successfully! Welcome to InterviewAce.`);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("[AuthProvider] Registration error:", err);
      const formatted = formatFirebaseAuthError(err);
      toast.error(formatted, { duration: 5000 });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  // ── 4. Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authLogout();
      setUser(null);
      toast.success("Signed out successfully.");
      router.push("/login");
    } catch (err) {
      console.error("[AuthProvider] Logout error:", err);
      toast.error("Failed to sign out.");
    }
  }, [router]);

  // ── 5. Reset Password ────────────────────────────────────────────────────────
  const resetPassword = useCallback(async (email: string) => {
    try {
      await authResetPassword(email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err) {
      console.error("[AuthProvider] Reset password error:", err);
      const formatted = formatFirebaseAuthError(err);
      toast.error(formatted);
      throw err;
    }
  }, []);

  // ── 6. Get ID Token ──────────────────────────────────────────────────────────
  const getIdToken = useCallback(async (): Promise<string | null> => {
    return await authGetIdToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        registerUser,
        logout,
        resetPassword,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
