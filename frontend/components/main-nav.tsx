"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, Settings, LogOut, Plus } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "DASHBOARD", icon: LayoutDashboard },
  { href: "/applications", label: "APPLICATIONS", icon: FileText },
  { href: "/settings", label: "SETTINGS", icon: Settings },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 border border-foreground flex items-center justify-center">
              <span className="text-xs font-mono font-bold">CR</span>
            </div>
            <span className="text-sm font-mono font-medium tracking-wide">CREDIT RISK</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname?.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-xs font-mono transition-colors",
                    isActive
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="font-mono text-xs h-8">
            <Link href="/apply">
              <Plus className="h-3 w-3 mr-1.5" />
              NEW APPLICATION
            </Link>
          </Button>
          <div className="h-6 w-px bg-border mx-2" />
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/login">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
