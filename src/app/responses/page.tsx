"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Eye, Trash2, Loader2, Download } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { useResponses, formatRelative } from "@/lib/responses"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const PAGE_SIZE = 10

export default function ResponsesPage() {
  const { responses, stats, loading, error, fetchResponses, remove } = useResponses()
  const router = useRouter()
  const { toast } = useToast()

  const [query, setQuery] = useState("")
  const [pathFilter, setPathFilter] = useState<string>("all")
  const [completedFilter, setCompletedFilter] = useState<string>("all")
  const [page, setPage] = useState(1)

  // Filter responses
  const filtered = useMemo(() => {
    let filtered = responses

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.sessionId.toLowerCase().includes(q) ||
          r.businessPath.toLowerCase().includes(q) ||
          r.responses.some((resp) => resp.answer.toLowerCase().includes(q)),
      )
    }

    if (pathFilter !== "all") {
      filtered = filtered.filter((r) => r.businessPath === pathFilter)
    }

    if (completedFilter !== "all") {
      filtered = filtered.filter((r) => r.completed === (completedFilter === "true"))
    }

    return filtered
  }, [responses, query, pathFilter, completedFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageResponses = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this response? This action cannot be undone.")) return
    try {
      await remove(id)
      toast({ title: "Response deleted" })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete response",
        // variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <PageShell title="User Responses">
        <Card className="shadow-sm">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="size-6 animate-spin mr-2" />
            <span>Loading responses...</span>
          </CardContent>
        </Card>
      </PageShell>
    )
  }

  if (error) {
    return (
      <PageShell title="User Responses">
        <Card className="shadow-sm">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error loading responses</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="User Responses"
      subtitle={`${stats?.totalResponses || 0} total submissions`}
      right={
        <Button size="sm" variant="outline">
          <Download className="mr-2 size-4" />
          Export CSV
        </Button>
      }
    >
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.totalResponses}</div>
              <div className="text-xs text-muted-foreground">Total Responses</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.completedResponses}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-600">{stats.incompleteResponses}</div>
              <div className="text-xs text-muted-foreground">Incomplete</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.recentResponses}</div>
              <div className="text-xs text-muted-foreground">Last 7 Days</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-sm">
        <CardContent className="grid gap-3 p-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 md:flex-1">
              <Input
                placeholder="Search responses..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full md:max-w-md"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={pathFilter} onValueChange={setPathFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Paths" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Paths</SelectItem>
                  <SelectItem value="New Business">New Business</SelectItem>
                  <SelectItem value="Existing Business">Existing Business</SelectItem>
                  <SelectItem value="Growth Stage">Growth Stage</SelectItem>
                </SelectContent>
              </Select>
              <Select value={completedFilter} onValueChange={setCompletedFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Completed</SelectItem>
                  <SelectItem value="false">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Business Path</TableHead>
                  <TableHead>Responses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>User Info</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageResponses.map((response:any) => (
                  <TableRow key={response.id}>
                    <TableCell>
                      <div className="font-mono text-sm">{response.sessionId}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50">
                        {response.businessPath}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {response.responses.length} answer{response.responses.length !== 1 ? "s" : ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={response.completed ? "default" : "secondary"}
                        className={response.completed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}
                      >
                        {response.completed ? "Completed" : "Incomplete"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatRelative(response.createdAt)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div>IP: {response.userInfo.ip || "Unknown"}</div>
                      <div className="truncate max-w-32" title={response.userInfo.userAgent}>
                        {response.userInfo.userAgent?.split(" ")[0] || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/responses/${response.id}`)}>
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(response.id)}>
                          <Trash2 className="size-4 text-rose-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {pageResponses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                      No responses match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} responses
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="mr-1 size-4" /> Previous
              </Button>
              <div className="px-3 text-sm">{page}</div>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
