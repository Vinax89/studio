"use client"

import { useEffect, useRef } from "react"
import { getQueuedTransactions, clearQueuedTransactions } from "@/lib/offline"
import { auth } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"

export function ServiceWorker() {
  const debounceId = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCount = useRef(0)
  const notified = useRef(false)
  const abortController = useRef<AbortController | null>(null)

  useEffect(() => {
    const syncQueued = async () => {
      const queued = await getQueuedTransactions()
      if (queued === null) {
        console.error("Failed to retrieve queued transactions")
        return
      }
      if (!queued.length) return

      abortController.current?.abort()
      const controller = new AbortController()
      abortController.current = controller

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
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(await response.text())
        }

        await clearQueuedTransactions()
        retryCount.current = 0
        notified.current = false
      } catch (error) {
        if (controller.signal.aborted) return

        retryCount.current += 1
        const delay = Math.min(1000 * 2 ** (retryCount.current - 1), 30000)

        if (retryCount.current >= 5 && !notified.current) {
          toast({
            title: "Sync failed",
            description:
              "Unable to sync offline transactions. We'll keep trying in the background.",
          })
          notified.current = true
        }

        console.error("Failed to sync queued transactions", error)
        if (retryTimeoutId.current) clearTimeout(retryTimeoutId.current)
        retryTimeoutId.current = setTimeout(syncQueued, delay)
      }
    }

    const handleOnline = () => {
      abortController.current?.abort()
      if (debounceId.current) clearTimeout(debounceId.current)
      if (retryTimeoutId.current) clearTimeout(retryTimeoutId.current)
      retryCount.current = 0
      notified.current = false
      debounceId.current = setTimeout(syncQueued, 1000)
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
      if (debounceId.current) clearTimeout(debounceId.current)
      if (retryTimeoutId.current) clearTimeout(retryTimeoutId.current)
      abortController.current?.abort()
    }
  }, [])

  return null
}
