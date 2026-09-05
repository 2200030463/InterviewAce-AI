/**
 * lib/storage.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Firebase Storage Upload Helper Service.
 */

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase";

/**
 * Upload resume file to Firebase Storage under `resumes/{userId}/{timestamp}_{fileName}`
 */
export async function uploadResumeFile(userId: string, file: File): Promise<string> {
  const storage = getFirebaseStorage();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `resumes/${userId}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, filePath);

  await uploadBytes(storageRef, file, {
    contentType: file.type || "application/pdf",
  });

  return await getDownloadURL(storageRef);
}
