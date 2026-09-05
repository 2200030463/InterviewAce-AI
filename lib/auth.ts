/**
 * lib/auth.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Firebase Authentication Service.
 * Implements real Google OAuth, Email/Password sign-in, Registration, Password Reset,
 * and automatic Firestore user profile synchronization.
 */

import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from "firebase/auth";
import { getFirebaseAuth, getGoogleProvider, getFirebaseDb } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export interface UserProfileData {
  uid: string;
  name: string;
  email: string;
  photoURL?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
  targetRole?: string;
  resumeScore?: number;
  averageScore?: number;
  readinessScore?: number;
  totalInterviews?: number;
}

/**
 * Synchronize user profile into Firestore collection `users`
 */
export async function syncUserProfile(user: User, additionalData?: Partial<UserProfileData>): Promise<void> {
  if (!user || typeof window === "undefined") return;

  try {
    const db = getFirebaseDb();
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    const payload: Record<string, unknown> = {
      uid: user.uid,
      name: user.displayName || additionalData?.name || "Candidate",
      email: user.email || "",
      photoURL: user.photoURL || null,
      updatedAt: serverTimestamp(),
      ...additionalData,
    };

    if (!snap.exists()) {
      payload.createdAt = serverTimestamp();
      payload.resumeScore = 0;
      payload.averageScore = 0;
      payload.readinessScore = 0;
      payload.totalInterviews = 0;
      payload.targetRole = "Full Stack Developer";
    }

    await setDoc(userRef, payload, { merge: true });

    // Set lightweight session cookie for proxy route authorization
    document.cookie = `session=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } catch (error) {
    console.error("[Auth] Error syncing user profile to Firestore:", error);
  }
}

/**
 * 1. Sign In with Google OAuth (Real Firebase Auth)
 */
export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  const provider = getGoogleProvider();
  const result = await signInWithPopup(auth, provider);
  await syncUserProfile(result.user);
  return result.user;
}

/**
 * 2. Sign In with Email and Password
 */
export async function signInWithEmail(email: string, pass: string): Promise<User> {
  const auth = getFirebaseAuth();
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  await syncUserProfile(result.user);
  return result.user;
}

/**
 * 3. Register a new user with Email, Password & Full Name
 */
export async function registerUser(name: string, email: string, pass: string): Promise<User> {
  const auth = getFirebaseAuth();
  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  
  if (name.trim()) {
    await updateProfile(result.user, { displayName: name.trim() });
  }

  await syncUserProfile(result.user, { name: name.trim() });
  return result.user;
}

/**
 * 4. Sign Out
 */
export async function logout(): Promise<void> {
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
  if (typeof window !== "undefined") {
    document.cookie = "session=; path=/; max-age=0; SameSite=Lax";
  }
}

/**
 * 5. Send Password Reset Email
 */
export async function resetPassword(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Get current ID token for API requests
 */
export async function getIdToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken();
  }
  return null;
}

/**
 * Get current user instance
 */
export function getCurrentUser(): User | null {
  const auth = getFirebaseAuth();
  return auth.currentUser;
}
