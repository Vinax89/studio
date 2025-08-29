import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Persist a (description, category) feedback pair. This is used when a user
 * overrides the AI suggested category so the model can improve over time.
 */
export async function recordCategoryFeedback(description: string, category: string): Promise<void> {
  const colRef = collection(db, "categoryFeedback");
  await addDoc(colRef, {
    description,
    category,
    createdAt: serverTimestamp(),
  });
}
