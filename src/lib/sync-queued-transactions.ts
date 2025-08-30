import type { Auth } from "firebase/auth";
import { getQueuedTransactions, clearQueuedTransactions } from "./offline";
import { toast } from "@/hooks/use-toast";
import { logger } from "./logger";

/**
 * Sync queued transactions with the backend using exponential backoff.
 * Returns a cleanup function to abort in-flight requests and clear timers.
 */
export function syncQueuedTransactions(auth: Auth): () => void {
  let controller: AbortController | null = null;
  let retryTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let retryCount = 0;
  let notified = false;

  const sync = async (): Promise<void> => {
    const queuedResult = await getQueuedTransactions();
    if (!queuedResult.ok) {
      logger.error("Failed to retrieve queued transactions", queuedResult.error);
      return;
    }
    const queued = queuedResult.value;
    if (!queued.length) return;

    controller?.abort();
    controller = new AbortController();

    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller?.abort();
    }, 10000);

    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : null;
      if (!token) {
        logger.error("Cannot sync queued transactions without auth");
        return;
      }

      const response = await fetch("/api/transactions/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transactions: queued }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const clearResult = await clearQueuedTransactions();
      if (!clearResult.ok) {
        logger.error("Failed to clear queued transactions", clearResult.error);
      }
      retryCount = 0;
      notified = false;
    } catch (error) {
      if (controller?.signal.aborted && !timedOut) return;

      retryCount += 1;
      const delay = Math.min(1000 * 2 ** (retryCount - 1), 30000);

      if (retryCount >= 5 && !notified) {
        toast({
          title: "Sync failed",
          description:
            "Unable to sync offline transactions. We'll keep trying in the background.",
        });
        notified = true;
      }

      logger.error("Failed to sync queued transactions", error);
      logger.info(`Retrying sync in ${delay}ms`);
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      retryTimeoutId = setTimeout(sync, delay);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  sync();

  return () => {
    controller?.abort();
    if (retryTimeoutId) clearTimeout(retryTimeoutId);
  };
}
