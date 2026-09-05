import { NextResponse } from "next/server";

export interface StandardApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export function apiSuccess<T>(data: T, status = 200): NextResponse<StandardApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export function apiFailure(error: string, status = 400): NextResponse<StandardApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error,
      timestamp: new Date().toISOString(),
    },
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

// Aliases for compatibility
export const success = apiSuccess;
export const failure = apiFailure;
