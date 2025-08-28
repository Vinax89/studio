import { getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";

/**
 * Verifies a Firebase ID token from the Authorization header.
 * In test environments, a token value of "test-token" is accepted.
 * @throws Error if the token is missing or invalid.
 */
let app: App | undefined;

export async function verifyFirebaseToken(
  req: Request,
): Promise<DecodedIdToken> {
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
    return { uid: "test-uid" } as unknown as DecodedIdToken;
  }

  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp();
  }

  return getAuth(app).verifyIdToken(token);
}
