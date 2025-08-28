"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { NurseFinAILogo } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Navigation, navItems } from "./navigation"

export default function AppSidebar() {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    navItems.forEach((item) => router.prefetch(item.href))
  }, [router])

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-10 hidden flex-col border-r bg-background dark:border-r dark:bg-background transition-all sm:flex",
        collapsed ? "w-14" : "w-56"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <NurseFinAILogo className="h-6 w-6" />
          {!collapsed && <span className="font-semibold">NurseFinAI</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <Navigation collapsed={collapsed} className="px-2 py-4" />
    </aside>
  )
}

