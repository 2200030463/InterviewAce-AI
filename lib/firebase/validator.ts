/**
 * lib/firebase/validator.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validation utility for Firebase Client & Admin SDK environment variables.
 */

export interface FirebaseConfigValidationResult {
  valid: boolean;
  clientValid: boolean;
  adminValid: boolean;
  missingClientVars: string[];
  missingAdminVars: string[];
  details: Record<string, boolean>;
}

export function validateFirebaseConfig(): FirebaseConfigValidationResult {
  const clientVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: Boolean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: Boolean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: Boolean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    NEXT_PUBLIC_FIREBASE_APP_ID: Boolean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  };

  const adminVars = {
    FIREBASE_PROJECT_ID: Boolean(
      process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    ),
    FIREBASE_CLIENT_EMAIL: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
    FIREBASE_PRIVATE_KEY: Boolean(process.env.FIREBASE_PRIVATE_KEY),
  };

  const missingClientVars = Object.entries(clientVars)
    .filter(([, ok]) => !ok)
    .map(([key]) => key);

  const missingAdminVars = Object.entries(adminVars)
    .filter(([, ok]) => !ok)
    .map(([key]) => key);

  const clientValid = missingClientVars.length === 0;
  const adminValid = missingAdminVars.length === 0;

  return {
    valid: clientValid && adminValid,
    clientValid,
    adminValid,
    missingClientVars,
    missingAdminVars,
    details: {
      ...clientVars,
      ...adminVars,
    },
  };
}
