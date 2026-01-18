import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  label: string
  value: string | number
  subValue?: string
  trend?: "up" | "down" | "neutral"
  className?: string
}

export function StatsCard({ label, value, subValue, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("bg-card", className)}>
      <CardContent className="p-4">
        <div className="text-[10px] font-mono tracking-widest text-muted-foreground mb-2">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-mono font-medium">{value}</span>
          {subValue && (
            <span
              className={cn(
                "text-xs font-mono",
                trend === "up" && "text-green-600 dark:text-green-400",
                trend === "down" && "text-red-600 dark:text-red-400",
                trend === "neutral" && "text-muted-foreground",
              )}
            >
              {subValue}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
