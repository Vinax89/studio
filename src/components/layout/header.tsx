"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { Icon } from "@/components/ui/icon"

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
import { ThemeToggle } from "@/components/ThemeToggle"

export default function AppHeader() {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      console.error("Logout failed:", error)
       toast({
        title: "Logout Failed",
        description: "Could not log you out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 dark:bg-background sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Icon name="menu" size={20} />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <NurseFinAILogo className="h-6 w-6 transition-all group-hover:scale-110" />
              <span className="sr-only">NurseFinAI</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/transactions"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              Transactions
            </Link>
            <Link
              href="/debts"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              Debts
            </Link>
            <Link
              href="/goals"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              Goals
            </Link>
            <Link
              href="/cashflow"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              Cashflow
            </Link>
            <Link
              href="/insights"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              AI Insights
            </Link>
            <Link
              href="/taxes"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              Tax Estimator
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Icon
          name="search"
          size={16}
          className="absolute left-2.5 top-2.5 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[336px] dark:bg-secondary"
        />
      </div>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Icon name="circleUser" size={24} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
