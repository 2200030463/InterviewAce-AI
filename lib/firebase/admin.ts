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
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
}

function getAdminApp(): App | null {
  if (_app) return _app;

  if (getApps().length) {
    _app = getApp();
    return _app;
  }

  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n"
    );

    if (isFirebaseAdminConfigured()) {
      _app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      console.warn("Firebase Admin credentials missing");
      return null;
    }

    return _app;
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    return null;
  }
}

export function getAdminDb(): Firestore {
  if (!_db) {
    const app = getAdminApp();
    if (!app) throw new Error("Firebase Admin not initialized");
    _db = getFirestore(app);
  }
  return _db;
}

export function getAdminAuth(): Auth {
  if (!_auth) {
    const app = getAdminApp();
    if (!app) throw new Error("Firebase Admin not initialized");
    _auth = getAuth(app);
  }
  return _auth;
}

export function getAdminStorage(): Storage {
  if (!_storage) {
    const app = getAdminApp();
    if (!app) throw new Error("Firebase Admin not initialized");
    _storage = getStorage(app);
  }
  return _storage;
}

export { getAdminApp };