"use client"

import { useEffect, useRef } from "react"
import { getQueuedTransactions, clearQueuedTransactions } from "@/lib/offline"
import { auth } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

export function ServiceWorker() {
  const retryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const MAX_RETRIES = 5
    const BASE_DELAY = 1000

    const attemptSync = async (attempt = 0): Promise<void> => {
      const queued = await getQueuedTransactions()
      if (!queued.length) return
      try {
        const user = auth.currentUser
        const token = user ? await user.getIdToken() : null
        if (!token) {
          console.error("Cannot sync queued transactions without auth")
          return
        }
        const response = await fetch("/api/transactions/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ transactions: queued }),
        })
        if (!response.ok) {
          throw new Error(await response.text())
        }
        await clearQueuedTransactions()
      } catch (error) {
        console.error("Failed to sync queued transactions", error)
        if (attempt >= MAX_RETRIES - 1) {
          toast({
            title: "Sync failed",
            description:
              "Unable to sync offline transactions. We'll keep them queued.",
            variant: "destructive",
          })
          return
        }
        const delay = Math.pow(2, attempt) * BASE_DELAY
        retryTimeout.current = setTimeout(
          () => attemptSync(attempt + 1),
          delay
        )
      }
    }

    const handleOnline = () => {
      if (retryTimeout.current) clearTimeout(retryTimeout.current)
      attemptSync()
    }

    const registerAndListen = async () => {
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/sw.js")
        } catch (error) {
          console.error(error)
        }
      }

      window.addEventListener("online", handleOnline)
      if (navigator.onLine) handleOnline()
    }

    registerAndListen()

    return () => {
      window.removeEventListener("online", handleOnline)
      if (retryTimeout.current) clearTimeout(retryTimeout.current)
    }
  }, [toast])

  return null
}
