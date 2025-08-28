"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Target,
  Wallet,
  Sparkles,
  Landmark,
  Settings,
} from "lucide-react"

export const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/debts", icon: CreditCard, label: "Debts" },
  { href: "/goals", icon: Target, label: "Goals" },
  { href: "/cashflow", icon: Wallet, label: "Cashflow" },
  { href: "/insights", icon: Sparkles, label: "AI Insights" },
  { href: "/taxes", icon: Landmark, label: "Tax Estimator" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

interface NavigationProps {
  collapsed?: boolean
  className?: string
  onNavigate?: () => void
}

export function Navigation({
  collapsed = false,
  className,
  onNavigate,
}: NavigationProps) {
  const pathname = usePathname()

  const links = navItems.map((item) => {
    const active = pathname.startsWith(item.href)
    const link = (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-md p-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          collapsed ? "justify-center" : "px-3",
          active && "bg-accent text-accent-foreground"
        )}
        aria-current={active ? "page" : undefined}
      >
        <item.icon className="h-5 w-5" aria-hidden="true" />
        <span className={collapsed ? "sr-only" : ""}>{item.label}</span>
      </Link>
    )
    if (collapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      )
    }
    return link
  })

  const content = (
    <nav aria-label="Main" className={cn("flex flex-col gap-2", className)}>
      {links}
    </nav>
  )

  return collapsed ? <TooltipProvider>{content}</TooltipProvider> : content
}

