"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { useTranslation } from "@/lib/i18n"
import { signOut } from "firebase/auth"
import {
  CircleUser,
  Menu,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { NurseFinAILogo } from "@/components/icons"
import { useToast } from "@/hooks/use-toast"
import { ThemeSwitcher } from "./theme-switcher"

export default function AppHeader() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
      toast({
        title: t("logout.successTitle"),
        description: t("logout.successDesc"),
      })
    } catch (error) {
      console.error("Logout failed:", error)
      toast({
        title: t("logout.failTitle"),
        description: t("logout.failDesc"),
        variant: "destructive",
      })
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">{t("menu.toggle")}</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <NurseFinAILogo className="h-6 w-6 transition-all group-hover:scale-110" />
              <span className="sr-only">{t("app.name")}</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              {t("nav.dashboard")}
            </Link>
            <Link
              href="/transactions"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              {t("nav.transactions")}
            </Link>
            <Link
              href="/debts"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              {t("nav.debts")}
            </Link>
            <Link
              href="/goals"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              {t("nav.goals")}
            </Link>
            <Link
              href="/cashflow"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              {t("nav.cashflow")}
            </Link>
            <Link
              href="/insights"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              {t("nav.insights")}
            </Link>
            <Link
              href="/taxes"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              {t("nav.tax")}
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t("search.placeholder")}
          className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>
      <ThemeSwitcher />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <CircleUser className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t("account.my")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{t("account.settings")}</DropdownMenuItem>
          <DropdownMenuItem>{t("account.support")}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            {t("account.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
