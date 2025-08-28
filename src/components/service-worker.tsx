"use client";

import { useEffect, useRef } from "react";
import { getQueuedTransactions, clearQueuedTransactions } from "@/lib/offline";
import { auth } from "@/lib/firebase";

export function ServiceWorker() {
  const debounceId = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      if (debounceId.current) clearTimeout(debounceId.current);

      debounceId.current = setTimeout(async () => {
        const queued = await getQueuedTransactions();
        if (queued.length) {
          try {
            const user = auth.currentUser;
            const token = user ? await user.getIdToken() : null;
            if (!token) {
              console.error("Cannot sync queued transactions without auth");
              return;
            }
            const response = await fetch("/api/transactions/sync", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ transactions: queued }),
            });
            if (!response.ok) {
              console.error(
                "Failed to sync queued transactions",
                await response.text(),
              );
              return;
            }
            await clearQueuedTransactions();
          } catch (error) {
            console.error("Failed to sync queued transactions", error);
          }
        }
      }, 1000);
    };

    const registerAndListen = async () => {
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/sw.js");
        } catch (error) {
          console.error(error);
        }
      }

      window.addEventListener("online", handleOnline);
      if (navigator.onLine) handleOnline();
    };

    registerAndListen();

    return () => {
      window.removeEventListener("online", handleOnline);
      if (debounceId.current) clearTimeout(debounceId.current);
    };
  }, []);

  return null;
}
