"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Mock authentication
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (email === "admin@credit.io" && password === "password") {
      router.push("/dashboard")
    } else {
      setError("Invalid credentials. Try admin@credit.io / password")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 border border-foreground flex items-center justify-center">
            <span className="text-xs font-mono font-bold">CR</span>
          </div>
          <span className="text-sm font-mono font-medium tracking-wide">CREDIT RISK</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-lg font-mono">Sign In</CardTitle>
            <CardDescription className="text-xs font-mono">Access the credit risk assessment dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-mono">
                  EMAIL
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@credit.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="font-mono text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-mono">
                  PASSWORD
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="font-mono text-sm pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">{showPassword ? "Hide" : "Show"} password</span>
                  </Button>
                </div>
              </div>

              {error && (
                <div className="text-xs font-mono text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full font-mono text-xs" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    SIGNING IN...
                  </>
                ) : (
                  "SIGN IN"
                )}
              </Button>

              <div className="text-center">
                <p className="text-[10px] font-mono text-muted-foreground">
                  Demo credentials: admin@credit.io / password
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-border py-4 px-6">
        <p className="text-[10px] font-mono text-muted-foreground text-center">Credit Risk Assessment MVP</p>
      </footer>
    </div>
  )
}
