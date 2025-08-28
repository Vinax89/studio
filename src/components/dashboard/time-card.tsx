"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"

export default function TimeCard() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{now.toLocaleTimeString()}</div>
      </CardContent>
    </Card>
  )
}
