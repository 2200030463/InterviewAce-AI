import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  successResponse,
  errorResponse,
} from "@/lib/auth/server";
import { getUserReports } from "@/lib/firestore/operations";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return unauthorizedResponse();

    const reports = await getUserReports(user.uid);
    return successResponse(reports);
  } catch (err) {
    console.error("Get reports error:", err);
    return errorResponse("Failed to fetch reports");
  }
}
