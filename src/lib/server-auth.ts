import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

/**
 * Verifies a Firebase ID token from the Authorization header.
 * In test environments, a token value of "test-token" is accepted.
 * @throws Error if the token is missing or invalid.
 */
export async function verifyFirebaseToken(req: Request): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing Authorization header");
  }
  const token = authHeader.slice("Bearer ".length);

  // Allow a fixed token during tests so we don't need real Firebase tokens.
  if (process.env.NODE_ENV === "test") {
    if (token !== "test-token") {
      throw new Error("Invalid token");
    }
    return "test-uid";
  }

  if (!getApps().length) {
    initializeApp();
  }

  const decoded = await getAuth().verifyIdToken(token);
  return decoded.uid;
}
