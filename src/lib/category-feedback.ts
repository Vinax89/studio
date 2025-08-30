import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { logger } from "./logger";


/**
 * Persist a (description, category) feedback pair. This is used when a user
 * overrides the AI suggested category so the model can improve over time.
 */
export async function recordCategoryFeedback(
  description: string,
  category: string
): Promise<boolean> {
  const colRef = collection(db, "categoryFeedback");
  try {
    await addDoc(colRef, {
      description,
      category,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : String(err);
    logger.error(`Failed to record category feedback: ${message}`);
    return false;
  }
}
