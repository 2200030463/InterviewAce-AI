import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  successResponse,
  errorResponse,
} from "@/lib/auth/server";
import { createOrUpdateUserProfile, getUserProfile } from "@/lib/firestore/operations";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return unauthorizedResponse();

    const profile = await getUserProfile(user.uid);
    return successResponse(
      profile || {
        uid: user.uid,
        email: user.email,
        displayName: user.name || "Candidate",
        targetRole: "Full Stack Developer",
        careerGoal: "Full Stack Developer",
        experienceLevel: "Mid-Level",
        targetCompanies: ["Google", "Startup"],
        onboardingCompleted: false,
      }
    );
  } catch (err) {
    console.error("Profile fetch error:", err);
    return errorResponse("Failed to fetch profile");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return unauthorizedResponse();

    const body = await req.json().catch(() => ({}));

    const updatePayload: any = {
      uid: user.uid,
      email: body.email || user.email || "",
      displayName: body.displayName || user.name || "Candidate",
      photoURL: body.photoURL || user.picture || "",
      targetRole: body.targetRole || body.careerGoal || "Full Stack Developer",
      careerGoal: body.careerGoal || body.targetRole || "Full Stack Developer",
      experienceLevel: body.experienceLevel || "Mid-Level",
      preferredRole: body.preferredRole || body.targetRole || body.careerGoal || "Full Stack Developer",
      targetCompanies: Array.isArray(body.targetCompanies) ? body.targetCompanies : ["Google", "Startup"],
      onboardingCompleted: body.onboardingCompleted !== undefined ? Boolean(body.onboardingCompleted) : true,
      updatedAt: new Date(),
    };

    if (body.onboardingCompleted === true) {
      updatePayload.onboardingCompletedAt = new Date();
    }

    await createOrUpdateUserProfile(updatePayload);

    return successResponse({
      message: "Profile updated successfully",
      data: updatePayload,
    });
  } catch (err) {
    console.error("Profile sync error:", err);
    return errorResponse("Failed to sync profile");
  }
}

