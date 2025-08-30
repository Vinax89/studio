"use client"

import { useEffect, useRef } from "react"
import { getQueuedTransactions, clearQueuedTransactions } from "@/lib/offline"
import { auth } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

const BASE_RETRY_DELAY_MS = Number(process.env.NEXT_PUBLIC_SYNC_BASE_DELAY_MS ?? 1000)
const MAX_RETRIES = Number(process.env.NEXT_PUBLIC_SYNC_MAX_RETRIES ?? 5)
const MAX_DELAY_MS = 30000

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
        logger.error("Failed to retrieve queued transactions")
        return
      }
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

        await clearQueuedTransactions()
        retryCount.current = 0
        notified.current = false
      } catch (error) {
        if (controller.signal.aborted && !timedOut) return

        retryCount.current += 1
        const baseDelay = BASE_RETRY_DELAY_MS * 2 ** (retryCount.current - 1)
        const jitter = Math.random() * BASE_RETRY_DELAY_MS
        const delay = Math.min(baseDelay + jitter, MAX_DELAY_MS)

        if (retryCount.current >= MAX_RETRIES && !notified.current) {
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
          await navigator.serviceWorker.register("/sw.js")
        } catch (error) {
          logger.error((error as Error).message, error)
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
