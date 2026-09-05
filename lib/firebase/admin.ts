import { initializeApp, getApps, getApp, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";
import { getStorage, Storage } from "firebase-admin/storage";

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _storage: Storage | null = null;

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PROJECT_ID !== "your-project-id" &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_CLIENT_EMAIL !== "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
  );
}

function getAdminApp(): App | null {
  if (_app) return _app;

  const apps = getApps();
  if (apps.length > 0) {
    _app = apps[0];
    return _app;
  }

  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined;

    if (isFirebaseAdminConfigured() && privateKey) {
      _app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      // Try default initialization (e.g. Cloud Run default environment service account)
      _app = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "demo-interviewace",
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }
  } catch (error) {
    console.warn("[Firebase Admin] Init warning (fallback active):", error);
    if (getApps().length > 0) {
      _app = getApp();
    }
  }

  return _app;
}

// Lazy getters — safe to import at build time, only initialize on first call
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
  } catch {
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

// Backward-compatible proxy exports
export const adminDb = new Proxy({} as Firestore, {
  get(_t, prop) {
    return (getAdminDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const adminAuth = new Proxy({} as Auth, {
  get(_t, prop) {
    const a = getAdminAuth();
    if (!a) return undefined;
    return (a as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const adminStorage = new Proxy({} as Storage, {
  get(_t, prop) {
    return (getAdminStorage() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
