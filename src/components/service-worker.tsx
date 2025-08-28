"use client"

import { useEffect, useRef } from "react"
import { getQueuedTransactions, clearQueuedTransactions } from "@/lib/offline"
import { useToast } from "@/hooks/use-toast"

export function ServiceWorker() {
  const debounceId = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const handleOnline = () => {
      if (debounceId.current) clearTimeout(debounceId.current)

      let attempt = 0

      const sync = async () => {
        const queued = await getQueuedTransactions()
        if (!queued.length) return
        try {
          const response = await fetch("/api/transactions/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactions: queued }),
          })
          if (!response.ok) {
            throw new Error(await response.text())
          }
          await clearQueuedTransactions()
          toast({
            title: "Transactions synced",
            description: "Queued transactions have been synced.",
          })
        } catch (error) {
          toast({
            title: "Sync failed",
            description: "Failed to sync queued transactions.",
            variant: "destructive",
          })
          attempt += 1
          const delay = Math.min(1000 * 2 ** attempt, 30000)
          debounceId.current = setTimeout(sync, delay)
        }
      }

      debounceId.current = setTimeout(sync, 1000)
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
    }
  }, [])

  return null
}
