"use client"

import { useEffect, useRef } from "react"
import { getQueuedTransactions, clearQueuedTransactions } from "@/lib/offline"
import { getAuthInstance } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

const auth = getAuthInstance()

export function ServiceWorker() {
  const debounceId = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCount = useRef(0)
  const notified = useRef(false)
  const abortController = useRef<AbortController | null>(null)

  useEffect(() => {
    const syncQueued = async () => {
      const queuedResult = await getQueuedTransactions()
      if (!queuedResult.ok) {
        logger.error("Failed to retrieve queued transactions", queuedResult.error)
        return
      }
      const queued = queuedResult.value
      if (!queued.length) return

      abortController.current?.abort()
      const controller = new AbortController()
      abortController.current = controller

      let timedOut = false
      const timeoutId = setTimeout(() => {
        timedOut = true
        controller.abort()
      }, 10000)

      try {
        const user = auth.currentUser
        const token = user ? await user.getIdToken() : null
        if (!token) {
          logger.error("Cannot sync queued transactions without auth")
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

        const clearResult = await clearQueuedTransactions()
        if (!clearResult.ok) {
          logger.error("Failed to clear queued transactions", clearResult.error)
        }
        retryCount.current = 0
        notified.current = false
      } catch (error) {
        if (controller.signal.aborted && !timedOut) return

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

        logger.error("Failed to sync queued transactions", error)
        if (retryTimeoutId.current) clearTimeout(retryTimeoutId.current)
        retryTimeoutId.current = setTimeout(syncQueued, delay)
      } finally {
        clearTimeout(timeoutId)
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
          const existing = navigator.serviceWorker.getRegistration
            ? await navigator.serviceWorker.getRegistration()
            : undefined
          if (!navigator.serviceWorker.controller && existing) {
            // Service worker already registered, no need to register again
          } else {
            await navigator.serviceWorker.register("/sw.js", { type: "module" })
          }
        } catch (error) {
          logger.error("Service worker registration failed", error)
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
