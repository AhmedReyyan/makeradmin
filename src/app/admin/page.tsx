"use client"

import { useMemo } from "react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, AlertTriangle, CheckCircle2, Database, MessageSquare, Users, UserCheck2 } from 'lucide-react'
import Link from "next/link"
import { QuestionsProvider, useQuestions } from "@/lib/questions"

type Stat = { label: string; value: string; icon: any }

function StatCard({ s }: { s: Stat }) {
  const Icon = s.icon
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 items-center justify-center rounded-full border bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">{s.label}</div>
          <div className="text-lg font-semibold leading-tight">{s.value}</div>
        </div>
        <div className="relative">
          <span className="block size-8 rounded-full border border-muted-foreground/20" aria-hidden="true" />
          <span className="absolute right-0 top-1/2 -translate-y-1/2 block size-1.5 rounded-full bg-muted-foreground/70" />
        </div>
      </CardContent>
    </Card>
  )
}

// Wrapper route that provides context to the page
export default function AdminDashboardRoute() {
  return (
    <QuestionsProvider>
      <AdminDashboard />
    </QuestionsProvider>
  )
}

// Inner component that consumes the context
function AdminDashboard() {
  const { questions } = useQuestions()
  const stats: Stat[] = useMemo(
    () => [
      { label: "Total Users", value: "2,847", icon: Users },
      { label: "Completed Onboarding", value: "1,923", icon: UserCheck2 },
      { label: "Active Users (7d)", value: "1,247", icon: Activity },
      { label: "Questions Created", value: String(questions.length), icon: MessageSquare },
      { label: "Pending Approvals", value: "8", icon: CheckCircle2 },
      { label: "System Alerts", value: "3", icon: AlertTriangle },
    ],
    [questions.length],
  )

  return (
    <PageShell
      title="Admin Dashboard"
      right={
        <div className="flex items-center gap-2">
          <Button size="sm" asChild>
            <Link href="/questions/create">Add Question</Link>
          </Button>
          <Button size="sm" variant="outline">Manage Users</Button>
        </div>
      }
    >
      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.map((s, i) => <StatCard key={i} s={s} />)}
      </section>

      {/* Chart + Activity */}
      <section className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Onboarding Progress (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="relative flex h-56 w-full items-center justify-center rounded-md border bg-muted/40 text-xs text-muted-foreground">
              <span>Line Chart: Daily Onboarding Completions</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent User Activity</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-4">
            <div className="text-sm">Sarah Johnson registered <span className="text-xs text-muted-foreground">2 minutes ago</span></div>
            <div className="text-sm">Mike Chen completed onboarding <span className="text-xs text-muted-foreground">15 minutes ago</span></div>
            <div className="text-sm">Emma Davis submitted question <span className="text-xs text-muted-foreground">1 hour ago</span></div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Access + Health */}
      <section className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            <Link href="/questions" className="rounded-md border bg-card p-3 shadow-sm hover:bg-accent text-sm">Questions</Link>
            <button className="rounded-md border bg-card p-3 shadow-sm hover:bg-accent text-sm">Users</button>
            <button className="rounded-md border bg-card p-3 shadow-sm hover:bg-accent text-sm">Business Paths</button>
            <button className="rounded-md border bg-card p-3 shadow-sm hover:bg-accent text-sm">Branding</button>
            <button className="rounded-md border bg-card p-3 shadow-sm hover:bg-accent text-sm">Settings</button>
            <button className="rounded-md border bg-card p-3 shadow-sm hover:bg-accent text-sm">Security</button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">System Health</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Database className="size-4" />
                </span>
                <span className="text-sm">Database Warning</span>
              </div>
              <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">High</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Activity className="size-4" />
                </span>
                <span className="text-sm">Maintenance Scheduled</span>
              </div>
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Medium</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <CheckCircle2 className="size-4" />
                </span>
                <span className="text-sm">All Systems Operational</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Good</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="sr-only" aria-hidden="true">
        <img src="/images/admin-dashboard-reference.png" alt="Reference Admin Dashboard" />
      </div>
    </PageShell>
  )
}
