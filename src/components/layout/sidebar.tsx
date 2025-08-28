"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Sparkles,
  Landmark,
  Settings,
  CreditCard,
  Wallet,
} from "lucide-react"
import { NurseFinAILogo } from "@/components/icons"
import { cn } from "@/lib/utils"

export default function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation()

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
    { href: "/transactions", icon: ArrowLeftRight, label: t("nav.transactions") },
    { href: "/debts", icon: CreditCard, label: t("nav.debts") },
    { href: "/goals", icon: Target, label: t("nav.goals") },
    { href: "/cashflow", icon: Wallet, label: t("nav.cashflow") },
    { href: "/insights", icon: Sparkles, label: t("nav.insights") },
    { href: "/taxes", icon: Landmark, label: t("nav.tax") },
  ]

  useEffect(() => {
    navItems.forEach((item) => router.prefetch(item.href))
    router.prefetch("/settings")
  }, [router])

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/dashboard"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <NurseFinAILogo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">{t("app.name")}</span>
          </Link>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname.startsWith(item.href) && "bg-accent text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                aria-label={t("account.settings")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{t("account.settings")}</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  )
}
