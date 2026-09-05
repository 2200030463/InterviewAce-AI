import { initializeApp, getApps, getApp, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";
import { getStorage, Storage } from "firebase-admin/storage";

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _storage: Storage | null = null;

function formatPrivateKey(key?: string): string | undefined {
  if (!key) return undefined;
  let formatted = key.trim();
  // Strip surrounding quotes if present (e.g. from .env or Vercel dashboard)
  if (
    (formatted.startsWith('"') && formatted.endsWith('"')) ||
    (formatted.startsWith("'") && formatted.endsWith("'"))
  ) {
    formatted = formatted.substring(1, formatted.length - 1).trim();
  }
  // Convert escaped newlines into real newlines
  return formatted.replace(/\\n/g, "\n");
}

export function isFirebaseAdminConfigured(): boolean {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  return Boolean(projectId && clientEmail && privateKey);
}

export function getAdminApp(): App | null {
  if (_app) return _app;

  // Singleton guard: return existing instance if already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    _app = existingApps[0];
    return _app;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "interviewace-ai-c8933";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  const storageBucket =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    (projectId ? `${projectId}.firebasestorage.app` : undefined);

  try {
    if (clientEmail && privateKey) {
      _app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket,
      });
      return _app;
    }

    // Fallback: Default initialization (supports GCP Cloud Run ADC or local emulator)
    _app = initializeApp({
      projectId,
      storageBucket,
    });
    return _app;
  } catch (error) {
    console.warn("[Firebase Admin] Initialization warning, attempting fallback:", error);
    try {
      if (getApps().length > 0) {
        _app = getApp();
        return _app;
      }
      _app = initializeApp({ projectId });
      return _app;
    } catch (fallbackError) {
      console.error("[Firebase Admin] Critical initialization error:", fallbackError);
      return null;
    }
  }
}

export function getAdminDb(): Firestore {
  if (!_db) {
    const app = getAdminApp();
    _db = app ? getFirestore(app) : getFirestore();
  }
  return _db;
}

export function getAdminAuth(): Auth | null {
  try {
    if (!_auth) {
      const app = getAdminApp();
      _auth = app ? getAuth(app) : getAuth();
    }
    return _auth;
  } catch (err) {
    console.warn("[Firebase Admin] Auth initialization notice:", err);
    return null;
  }
}

export function getAdminStorage(): Storage {
  if (!_storage) {
    const app = getAdminApp();
    _storage = app ? getStorage(app) : getStorage();
  }
  return _storage;
}

// ── Backward-compatible proxy exports ─────────────────────────────────────────
export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    const db = getAdminDb();
    const val = (db as any)[prop];
    return typeof val === "function" ? val.bind(db) : val;
  },
});

export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    const auth = getAdminAuth();
    if (!auth) return undefined;
    const val = (auth as any)[prop];
    return typeof val === "function" ? val.bind(auth) : val;
  },
});

export const adminStorage = new Proxy({} as Storage, {
  get(_target, prop) {
    const storage = getAdminStorage();
    const val = (storage as any)[prop];
    return typeof val === "function" ? val.bind(storage) : val;
  },
});