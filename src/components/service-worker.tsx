"use client"

import { useEffect, useRef } from "react"
import { getQueuedTransactions, clearQueuedTransactions } from "@/lib/offline"
import { IDB_VERSION, IDB_SRI } from "@/lib/idb-info"

export function ServiceWorker() {
  const debounceId = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleOnline = () => {
      if (debounceId.current) clearTimeout(debounceId.current)

      debounceId.current = setTimeout(async () => {
        const queued = await getQueuedTransactions()
        if (queued.length) {
          try {
            const response = await fetch("/api/transactions/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transactions: queued }),
            })
            if (!response.ok) {
              console.error(
                "Failed to sync queued transactions",
                await response.text()
              )
              return
            }
            await clearQueuedTransactions()
          } catch (error) {
            console.error("Failed to sync queued transactions", error)
          }
        }
      }, 1000)
    }

    const registerAndListen = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const verifyIdb = async () => {
            try {
              const res = await fetch(`/vendor/idb-${IDB_VERSION}.min.js`)
              const buf = await res.arrayBuffer()
              const hashBuf = await crypto.subtle.digest("SHA-384", buf)
              const hashArr = Array.from(new Uint8Array(hashBuf))
              const hashBase64 = btoa(String.fromCharCode(...hashArr))
              return `sha384-${hashBase64}` === IDB_SRI
            } catch {
              return false
            }
          }

          if (!(await verifyIdb())) {
            console.error("idb checksum verification failed")
            return
          }

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
