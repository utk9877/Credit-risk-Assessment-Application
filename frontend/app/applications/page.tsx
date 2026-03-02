import { MainNav } from "@/components/main-nav"
import { ApplicationsTable } from "@/components/applications-table"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Application } from "@/lib/types"

export default async function ApplicationsPage() {
  let applications: Application[] = []
  try {
    applications = await api.getApplications()
  } catch (e) {
    console.error("Failed to load applications", e)
    applications = []
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-xl font-mono font-medium">Applications</h1>
            <p className="text-xs font-mono text-muted-foreground mt-1">View and manage all credit applications</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-mono">All Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplicationsTable applications={applications} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
