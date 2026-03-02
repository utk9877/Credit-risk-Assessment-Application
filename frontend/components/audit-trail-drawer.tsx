"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import type { AuditEvent } from "@/lib/types"
import { History, Search, Filter, Download, Cpu, User, Settings, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AuditTrailDrawerProps {
  events: AuditEvent[]
}

const categoryIcons = {
  system: Settings,
  user: User,
  model: Cpu,
}

const categoryColors = {
  system: "border-muted-foreground",
  user: "border-foreground bg-foreground text-background",
  model: "border-foreground",
}

export function AuditTrailDrawer({ events }: AuditTrailDrawerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(["system", "user", "model"]))

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      searchQuery === "" ||
      event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.actor.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategories.has(event.category)

    return matchesSearch && matchesCategory
  })

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
    }
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const handleExport = () => {
    const data = filteredEvents.map((e) => ({
      timestamp: e.timestamp,
      action: e.action,
      actor: e.actor,
      details: e.details,
      category: e.category,
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "audit-trail.json"
    a.click()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="font-mono text-xs gap-1.5">
          <History className="h-3 w-3" />
          AUDIT
          <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px] font-mono">
            {events.length}
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[500px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-sm font-mono tracking-widest">AUDIT TRAIL</SheetTitle>
          <SheetDescription className="text-xs font-mono text-muted-foreground">
            Complete history of actions and decisions for this application.
          </SheetDescription>
        </SheetHeader>

        {/* Search and Filters */}
        <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-xs font-mono"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 font-mono text-xs bg-transparent">
                <Filter className="h-3 w-3 mr-1" />
                FILTER
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="font-mono">
              <DropdownMenuCheckboxItem
                checked={selectedCategories.has("system")}
                onCheckedChange={() => toggleCategory("system")}
                className="text-xs"
              >
                System Events
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedCategories.has("user")}
                onCheckedChange={() => toggleCategory("user")}
                className="text-xs"
              >
                User Actions
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedCategories.has("model")}
                onCheckedChange={() => toggleCategory("model")}
                className="text-xs"
              >
                Model Events
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExport}>
            <Download className="h-3 w-3" />
            <span className="sr-only">Export audit trail</span>
          </Button>
        </div>

        {/* Results count */}
        <div className="text-[10px] font-mono text-muted-foreground mt-4">
          SHOWING {filteredEvents.length} OF {events.length} EVENTS
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto mt-2 -mx-6 px-6">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            <AnimatePresence>
              {filteredEvents.map((event, index) => {
                const Icon = categoryIcons[event.category]
                const { date, time } = formatTimestamp(event.timestamp)

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.03 }}
                    className="relative flex items-start gap-4 pb-4 group"
                  >
                    {/* Node */}
                    <div
                      className={cn(
                        "relative z-10 flex items-center justify-center w-8 h-8 border bg-background flex-shrink-0",
                        categoryColors[event.category],
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-mono font-medium">{event.action}</span>
                        <div className="text-right flex-shrink-0">
                          <div className="text-[10px] font-mono text-muted-foreground">{time}</div>
                          <div className="text-[10px] font-mono text-muted-foreground opacity-50">{date}</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-1 line-clamp-2">{event.details}</div>
                      <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant="outline" className="font-mono text-[9px] h-4">
                          {event.category.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground">{event.actor}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-border">
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>Application audit log</span>
            <span>Last updated: {formatTimestamp(events[events.length - 1]?.timestamp || "").time}</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
