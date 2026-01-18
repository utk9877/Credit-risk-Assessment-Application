"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "./theme-provider"
import { Moon, Sun, Monitor } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  // Use a default icon during SSR to avoid hydration mismatch
  const icon = mounted && resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {icon}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="font-mono">
        <DropdownMenuItem onClick={() => setTheme("light")} className="text-xs gap-2">
          <Sun className="h-3 w-3" />
          LIGHT
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="text-xs gap-2">
          <Moon className="h-3 w-3" />
          DARK
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="text-xs gap-2">
          <Monitor className="h-3 w-3" />
          SYSTEM
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
