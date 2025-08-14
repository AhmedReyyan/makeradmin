import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Activity, AlertTriangle, CheckCircle2, CircleHelp, Database, FileText, Inbox, ListChecks, MessageSquare, SettingsIcon, Shield, SlidersHorizontal, User, UserCheck2, Users } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

// Reusable Types
type Stat = {
  id: string
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  tone?: "default" | "success" | "warning" | "info"
}

type HealthItem = {
  id: string
  label: string
  status: "High" | "Medium" | "Good" | "Degraded"
  icon: React.ComponentType<{ className?: string }>
}

type QuickItem = {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

// Page data (replace with real data wiring later)
const STATS: Stat[] = [
  { id: "total-users", label: "Total Users", value: "2,847", icon: Users, tone: "info" },
  { id: "onboarded", label: "Completed Onboarding", value: "1,923", icon: CheckCircle2, tone: "success" },
  { id: "active", label: "Active Users", value: "1,247", icon: Activity, tone: "info" },
  { id: "questions", label: "Questions", value: "156", icon: MessageSquare, tone: "default" },
  { id: "pending", label: "Pending Approvals", value: "8", icon: CircleHelp, tone: "warning" },
  { id: "alerts", label: "Service Alerts", value: "3", icon: AlertTriangle, tone: "warning" },
]

const QUICK_ACCESS: QuickItem[] = [
  { id: "questions", label: "Questions", href: "/questions", icon: MessageSquare },
  { id: "responses", label: "User Responses", href: "/responses", icon: Inbox },
  { id: "users", label: "Users", href: "#", icon: Users },
  { id: "reports", label: "Business Profile", href: "#", icon: FileText },
  { id: "settings", label: "Settings", href: "#", icon: SettingsIcon },
  { id: "security", label: "Security", href: "#", icon: Shield },
  { id: "workflows", label: "Workflows", href: "#", icon: ListChecks },
]

const HEALTH: HealthItem[] = [
  { id: "db", label: "Database Warning", status: "High", icon: Database },
  { id: "maintenance", label: "Maintenance Scheduled", status: "Medium", icon: SlidersHorizontal },
  { id: "api", label: "API Systems Operational", status: "Good", icon: CheckCircle2 },
]

// Utility UI primitives (highly reusable)
function PageShell(props: { title: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-muted/50">
      <main className="mx-auto max-w-[1200px] px-4 md:px-6 py-6">
        <header className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{props.title}</h1>
          {props.actions}
        </header>
        {props.children}
      </main>
    </div>
  )
}

function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
       
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">{stat.label}</div>
          <div className="text-lg font-semibold leading-tight">{stat.value}</div>
        </div>
         <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full border",
            stat.tone === "success" && "bg-emerald-50 text-emerald-700 border-emerald-100",
            stat.tone === "warning" && "bg-amber-50 text-amber-700 border-amber-100",
            stat.tone === "info" && "bg-sky-50 text-sky-700 border-sky-100",
            (!stat.tone || stat.tone === "default") && "bg-muted text-muted-foreground"
          )}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </div>
        {/* Decorative ring to mimic small progress dot from the mock */}
        {/* <div className="relative">
          <span className="block size-8 rounded-full border border-muted-foreground/20" aria-hidden="true" />
          <span className="absolute right-0 top-1/2 -translate-y-1/2 block size-1.5 rounded-full bg-muted-foreground/70" />
        </div> */}
      </CardContent>
    </Card>
  )
}

function QuickTile({ item }: { item: QuickItem }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className="flex items-center gap-2 rounded-md border bg-card p-3 text-sm shadow-sm transition-colors hover:bg-accent"
    >
      <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <span className="font-medium">{item.label}</span>
    </Link>
  )
}

function HealthRow({ item }: { item: HealthItem }) {
  const Icon = item.icon
  const badgeTone =
    item.status === "High"
      ? "bg-rose-100 text-rose-700 hover:bg-rose-100"
      : item.status === "Medium"
      ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
      : item.status === "Degraded"
      ? "bg-orange-100 text-orange-700 hover:bg-orange-100"
      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <span className="text-sm">{item.label}</span>
      </div>
      <Badge className={cn("pointer-events-none", badgeTone)} variant="secondary">
        {item.status}
      </Badge>
    </div>
  )
}

function UserActivityItem(props: {
  name: string
  action: string
  time: string
  avatar?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="size-8 border">
        <AvatarImage
          src={props.avatar ?? `/placeholder.svg?height=64&width=64&query=person%20avatar`}
          alt={props.name}
        />
        <AvatarFallback>{props.name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="text-sm">
          <span className="font-medium">{props.name}</span> {props.action}
        </div>
        <div className="text-xs text-muted-foreground">{props.time}</div>
      </div>
    </div>
  )
}

function TimelineItem(props: { title: string; time: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="relative mt-1.5">
        <span className="block size-2 rounded-full bg-muted-foreground/50" aria-hidden="true" />
      </div>
      <div className="flex-1">
        <div className="text-sm">{props.title}</div>
      </div>
      <div className="text-xs text-muted-foreground whitespace-nowrap">{props.time}</div>
    </div>
  )
}

export default async function Page() {
  return (
    <PageShell
      title="Admin Dashboard"
      actions={
        <div className="flex items-center gap-2">
<Button size="sm" asChild>
            <Link href="/questions/create">Add Question</Link>
          </Button>          <Button size="sm" variant="outline" className="hidden sm:inline-flex">Manage Users</Button>
          <Avatar className="size-8 border">
            <AvatarImage src="/admin-avatar.png" alt="Admin" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      }
    >
      {/* Stats */}
      <section aria-label="Key statistics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {STATS.map((s) => (
          <StatCard key={s.id} stat={s} />
        ))}
      </section>

      {/* Middle Row: Chart + Recent User Activity */}
      <section className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Onboarding Progress (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* Chart placeholder. Swap with your chart lib later */}
            <div className="relative flex h-56 w-full items-center justify-center rounded-md border bg-muted/40 text-xs text-muted-foreground">
              <span>Live Chart: Daily Onboarding Completions</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent User Activity</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-4">
            <UserActivityItem
              name="Sarah Johnson"
              action="logged in"
              time="2 min ago"
              avatar="/sarah-avatar.png"
            />
            <UserActivityItem
              name="James Chen"
              action="completed onboarding"
              time="14 min ago"
              avatar="/generic-male-avatar.png"
            />
            <UserActivityItem
              name="Elena Rossi"
              action="requested password reset"
              time="1 hr ago"
              avatar="/elena-avatar.png"
            />
          </CardContent>
        </Card>
      </section>

      {/* Quick + Health */}
      <section className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {QUICK_ACCESS.map((q) => (
              <QuickTile key={q.id} item={q} />
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">System Health</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="divide-y">
              {HEALTH.map((h) => (
                <HealthRow key={h.id} item={h} />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Activity Log */}
      <section className="mt-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Activity Log</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-4">
            <TimelineItem
              title='Admin John created question "Business Model Canvas".'
              time="Jan 15, 2025 - 2:56 PM"
            />
            <Separator />
            <TimelineItem
              title="User permissions updated for Marketing team."
              time="Jan 15, 2025 - 2:35 PM"
            />
            <Separator />
            <TimelineItem title="System backup completed successfully." time="Jan 15, 2025 - 1:05 PM" />
          </CardContent>
        </Card>
      </section>

      {/* Hidden reference image (not rendered) to keep design parity in repo */}
      <div className="sr-only" aria-hidden="true">
        <Image
          src="/images/admin-dashboard-reference.png"
          alt="Reference design for Admin Dashboard"
          width={479}
          height={475}
          priority
        />
      </div>
    </PageShell>
  )
}
