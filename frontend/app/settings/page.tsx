"use client"

import { useState } from "react"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, RefreshCw, Shield, Bell, Database, Cpu } from "lucide-react"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    reviewRequired: true,
    modelUpdates: false,
    weeklyReports: true,
  })

  const [modelSettings, setModelSettings] = useState({
    threshold: "0.5",
    autoApprove: false,
    autoDecline: true,
  })

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-xl font-mono font-medium">Settings</h1>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              Configure system preferences and integrations
            </p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="font-mono">
              <TabsTrigger value="general" className="text-xs">
                GENERAL
              </TabsTrigger>
              <TabsTrigger value="model" className="text-xs">
                MODEL
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs">
                NOTIFICATIONS
              </TabsTrigger>
              <TabsTrigger value="integrations" className="text-xs">
                INTEGRATIONS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security Settings
                  </CardTitle>
                  <CardDescription className="text-xs font-mono">Manage security and access controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-mono">Two-Factor Authentication</Label>
                      <p className="text-[10px] font-mono text-muted-foreground">Require 2FA for all users</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-mono">Session Timeout</Label>
                      <p className="text-[10px] font-mono text-muted-foreground">Auto-logout after inactivity</p>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-32 font-mono text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15" className="font-mono text-xs">
                          15 minutes
                        </SelectItem>
                        <SelectItem value="30" className="font-mono text-xs">
                          30 minutes
                        </SelectItem>
                        <SelectItem value="60" className="font-mono text-xs">
                          1 hour
                        </SelectItem>
                        <SelectItem value="120" className="font-mono text-xs">
                          2 hours
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-mono">Audit Logging</Label>
                      <p className="text-[10px] font-mono text-muted-foreground">Log all user actions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="model" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    Model Configuration
                  </CardTitle>
                  <CardDescription className="text-xs font-mono">Configure risk model parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-mono">Decision Threshold</Label>
                    <Select
                      value={modelSettings.threshold}
                      onValueChange={(value) => setModelSettings({ ...modelSettings, threshold: value })}
                    >
                      <SelectTrigger className="font-mono text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.3" className="font-mono text-xs">
                          0.3 (Aggressive)
                        </SelectItem>
                        <SelectItem value="0.5" className="font-mono text-xs">
                          0.5 (Balanced)
                        </SelectItem>
                        <SelectItem value="0.7" className="font-mono text-xs">
                          0.7 (Conservative)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      Probability threshold for triggering manual review
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-mono">Auto-Approve Low Risk</Label>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        Automatically approve applications with score &gt; 850
                      </p>
                    </div>
                    <Switch
                      checked={modelSettings.autoApprove}
                      onCheckedChange={(checked) => setModelSettings({ ...modelSettings, autoApprove: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-mono">Auto-Decline High Risk</Label>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        Automatically decline applications with score &lt; 400
                      </p>
                    </div>
                    <Switch
                      checked={modelSettings.autoDecline}
                      onCheckedChange={(checked) => setModelSettings({ ...modelSettings, autoDecline: checked })}
                    />
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono">Current Model Version</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="font-mono text-[10px]">
                            XGBoost v2.3.1
                          </Badge>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            Last trained: Jan 10, 2024
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="font-mono text-xs bg-transparent">
                        <RefreshCw className="h-3 w-3 mr-1.5" />
                        RETRAIN
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className="text-xs font-mono">Configure how you receive alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-mono">Email Alerts</Label>
                      <p className="text-[10px] font-mono text-muted-foreground">Receive alerts via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-mono">Review Required</Label>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        Alert when applications need manual review
                      </p>
                    </div>
                    <Switch
                      checked={notifications.reviewRequired}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, reviewRequired: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-mono">Model Updates</Label>
                      <p className="text-[10px] font-mono text-muted-foreground">Notify when model is retrained</p>
                    </div>
                    <Switch
                      checked={notifications.modelUpdates}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, modelUpdates: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-mono">Weekly Reports</Label>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        Receive weekly performance summaries
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Data Integrations
                  </CardTitle>
                  <CardDescription className="text-xs font-mono">Connect to external data sources</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Equifax", status: "connected", lastSync: "5 min ago" },
                    { name: "TransUnion", status: "connected", lastSync: "5 min ago" },
                    { name: "Experian", status: "pending", lastSync: "—" },
                    { name: "Plaid", status: "connected", lastSync: "12 min ago" },
                  ].map((integration) => (
                    <div
                      key={integration.name}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            integration.status === "connected" ? "bg-green-500" : "bg-yellow-500"
                          }`}
                        />
                        <div>
                          <span className="text-sm font-mono">{integration.name}</span>
                          <p className="text-[10px] font-mono text-muted-foreground">
                            Last sync: {integration.lastSync}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`font-mono text-[10px] ${
                          integration.status === "connected"
                            ? "border-green-600 text-green-600"
                            : "border-yellow-600 text-yellow-600"
                        }`}
                      >
                        {integration.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="font-mono text-xs bg-transparent">
                      + ADD INTEGRATION
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-mono">API Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-mono">API KEY</Label>
                    <div className="flex gap-2">
                      <Input value="cr_live_••••••••••••••••" readOnly className="font-mono text-xs" />
                      <Button variant="outline" size="sm" className="font-mono text-xs bg-transparent">
                        REVEAL
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-mono">WEBHOOK URL</Label>
                    <Input placeholder="https://your-app.com/webhook" className="font-mono text-xs" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button className="font-mono text-xs">
              <Save className="h-3 w-3 mr-1.5" />
              SAVE CHANGES
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
