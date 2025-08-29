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
  } catch (error: unknown) {
    logger.error("Failed to record category feedback", error);
    return false;
  }
}
