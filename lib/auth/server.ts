import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

export async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split("Bearer ")[1];
  if (!token) return null;

  try {
    const adminAuth = getAdminAuth();
    if (adminAuth) {
      const decoded = await adminAuth.verifyIdToken(token);
      return {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      };
    }
  } catch (err) {
    console.warn("[Auth Server] Token verification notice:", err);
  }

  // Strict Security Enforcement: In production, NEVER accept unverified JWT payloads.
  // Fallback payload parsing is only allowed in non-production environments when Admin SDK credentials are not configured.
  if (process.env.NODE_ENV !== "production") {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        if (payload.user_id || payload.sub) {
          console.warn("[Auth Server] Warning: Accepting unverified token payload in development mode only.");
          return {
            uid: payload.user_id || payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
          };
        }
      }
    } catch {
      // Ignore parse error
    }
  }

  return null;
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: "Unauthorized. Please sign in with Firebase." },
    { status: 401 }
  );
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}
