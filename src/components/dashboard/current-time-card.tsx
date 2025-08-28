"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function CurrentTimeCard() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "full",
        timeStyle: "long",
        timeZoneName: "short",
      }),
    []
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Current Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatter.format(now)}</div>
      </CardContent>
    </Card>
  )
}
