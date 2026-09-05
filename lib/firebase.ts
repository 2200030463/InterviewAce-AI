/**
 * lib/firebase.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Firebase Client Singleton for InterviewAce AI.
 * Includes network auto-detect long-polling fallback to prevent offline errors.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore, initializeFirestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "interviewace-ai-c8933.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "interviewace-ai-c8933",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "interviewace-ai-c8933.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "726195636371",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:726195636371:web:d60af9457da07025a62566",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-RY9DPZV66J",
};

// Console Debugging
if (typeof window !== "undefined") {
  console.log("Firebase Config Loaded", {
    apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "interviewace-ai-c8933.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "interviewace-ai-c8933",
  });
}

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  _app = initializeApp(firebaseConfig);
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (!_db) {
    const app = getFirebaseApp();
    try {
      // Use autoDetectLongPolling to eliminate "client is offline" issues on unstable connections
      _db = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
      });
    } catch {
      _db = getFirestore(app);
    }
  }
  return _db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!_storage) {
    _storage = getStorage(getFirebaseApp());
  }
  return _storage;
}

export function getGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

export function formatFirebaseAuthError(error: unknown): string {
  if (!error) return "An unknown authentication error occurred.";
  
  const err = error as { code?: string; message?: string };
  const code = err.code || "";
  const msg = err.message || "";

  switch (code) {
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid":
      return "Firebase API Key is invalid or not found. Please verify NEXT_PUBLIC_FIREBASE_API_KEY in .env.local.";
    case "auth/unauthorized-domain":
      return "Domain unauthorized. Add your current domain (e.g. localhost) in Firebase Console > Authentication > Settings > Authorized domains.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Please allow popups for this site.";
    case "auth/popup-closed-by-user":
      return "Sign-in cancelled (popup window was closed).";
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled due to a newer request.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password. Please check your credentials.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in instead.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Access temporarily disabled due to many failed attempts. Try again later or reset password.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    default:
      return msg || "Authentication failed. Please try again.";
  }
}
