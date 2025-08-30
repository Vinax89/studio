import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FeedbackPair {
  description: string;
  category: string;
}

class NaiveBayesClassifier {
  private vocab = new Set<string>();
  private categoryCounts: Record<string, number> = {};
  private tokenCounts: Record<string, Record<string, number>> = {};
  private totalDocs = 0;

  train(pairs: FeedbackPair[]): void {
    this.vocab.clear();
    this.categoryCounts = {};
    this.tokenCounts = {};
    this.totalDocs = pairs.length;

    for (const { description, category } of pairs) {
      const tokens = this.tokenize(description);
      this.categoryCounts[category] = (this.categoryCounts[category] || 0) + 1;
      if (!this.tokenCounts[category]) this.tokenCounts[category] = {};
      for (const token of tokens) {
        this.vocab.add(token);
        this.tokenCounts[category][token] =
          (this.tokenCounts[category][token] || 0) + 1;
      }
    }
  }

  predict(text: string): string | null {
    if (this.totalDocs < 1) return null;
    const tokens = this.tokenize(text);
    let bestCategory: string | null = null;
    let bestScore = -Infinity;
    const vocabSize = this.vocab.size || 1;

    for (const category of Object.keys(this.categoryCounts)) {
      const logPrior = Math.log(this.categoryCounts[category] / this.totalDocs);
      const tokenCounts = this.tokenCounts[category];
      const totalTokens = Object.values(tokenCounts).reduce((a, b) => a + b, 0);
      let logLikelihood = 0;
      for (const token of tokens) {
        const count = tokenCounts[token] || 0;
        // Laplace smoothing
        const prob = (count + 1) / (totalTokens + vocabSize);
        logLikelihood += Math.log(prob);
      }
      const score = logPrior + logLikelihood;
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }

    return bestCategory;
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().match(/[a-z0-9]+/g) || [];
  }
}

let classifier: NaiveBayesClassifier | null = null;
let unsubscribe: (() => void) | null = null;
let intervalId: NodeJS.Timeout | null = null;

async function fetchPairs(): Promise<FeedbackPair[]> {
  const snap = await getDocs(collection(db, "categoryFeedback"));
  return snap.docs.map((d) => d.data() as FeedbackPair);
}

export async function trainCategoryModel(): Promise<void> {
  const pairs = await fetchPairs();
  classifier = new NaiveBayesClassifier();
  classifier.train(pairs);
}

export function classifyCategory(description: string): string | null {
  if (!classifier) return null;
  return classifier.predict(description);
}

export async function initCategoryModel(): Promise<void> {
  await trainCategoryModel();
  unsubscribe = onSnapshot(collection(db, "categoryFeedback"), () => {
    trainCategoryModel();
  });
  intervalId = setInterval(() => {
    trainCategoryModel();
  }, 60 * 60 * 1000);
}

export function teardownCategoryModel(): void {
  unsubscribe?.();
  unsubscribe = null;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
