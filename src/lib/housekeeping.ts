import { getAuth } from "firebase/auth";
import { runFirestoreCleanup } from "../services/housekeeping";

// Executes the Firestore housekeeping routine.
export async function runHousekeeping(): Promise<void> {
  // Ensure auth SDK is initialized to avoid cold-start costs
  getAuth();
  await runFirestoreCleanup();
}
