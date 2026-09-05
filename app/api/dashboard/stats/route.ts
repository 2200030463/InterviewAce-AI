import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  successResponse,
  errorResponse,
} from "@/lib/auth/server";
import { getDashboardStats } from "@/lib/firestore/operations";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return unauthorizedResponse();

    const stats = await getDashboardStats(user.uid);
    return successResponse(stats);
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return errorResponse("Failed to fetch dashboard stats");
  }
}
