"use client"

import { useEffect, useRef } from "react"
import { syncQueuedTransactions } from "@/lib/sync-queued-transactions"
import { initFirebase } from "@/lib/firebase"
import { logger } from "@/lib/logger"

export function ServiceWorker() {
  const debounceId = useRef<ReturnType<typeof setTimeout> | null>(null)
  const syncCleanup = useRef<(() => void) | null>(null)

  useEffect(() => {
    const { auth } = initFirebase()

    const handleOnline = () => {
      syncCleanup.current?.()
      if (debounceId.current) clearTimeout(debounceId.current)
      debounceId.current = setTimeout(() => {
        syncCleanup.current = syncQueuedTransactions(auth)
      }, 1000)
    }

    const registerAndListen = async () => {
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/sw.js", { type: "module" })
          logger.info("Service worker registered")
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
      syncCleanup.current?.()
    }
  }, [])

  return null
}
