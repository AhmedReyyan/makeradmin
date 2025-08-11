"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Copy, Eye, GripVertical, Pencil, Trash2 } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { StatusBadge, TypeBadge } from "@/components/badges"
import { useQuestions, type OnboardingPath } from "@/lib/questions"
import type { QuestionStatus, QuestionType } from "@/components/badges"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const PAGE_SIZE = 10

export default function QuestionsManagementPage() {
  return (
    <PageShell title="Questions Management" right={<AddQuestionButton />}>
      <QuestionsTable />
    </PageShell>
  )
}

function AddQuestionButton() {
  return (
    <Button size="sm" asChild>
      <a href="/questions/create">Add Question</a>
    </Button>
  )
}

function QuestionsTable() {
  const { questions, duplicate, remove, bulkUpdate, reorderQuestions } = useQuestions()
  const router = useRouter()
  const { toast } = useToast()

  const [query, setQuery] = useState("")
  const [pathFilter, setPathFilter] = useState<"all" | OnboardingPath>("all")
  const [typeFilter, setTypeFilter] = useState<"all" | QuestionType>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | QuestionStatus>("all")
  const [sort, setSort] = useState<"modified-desc" | "modified-asc" | "display-asc">("modified-desc")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const [reorderMode, setReorderMode] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)

  useEffect(() => setPage(1), [query, pathFilter, typeFilter, statusFilter, sort])

  const baseSorted = useMemo(() => {
    if (reorderMode || sort === "display-asc") {
      return [...questions].sort((a, b) => a.order - b.order)
    }
    const rows = [...questions]
    rows.sort((a, b) => {
      const da = new Date(a.updatedAt).getTime()
      const db = new Date(b.updatedAt).getTime()
      return sort === "modified-desc" ? db - da : da - db
    })
    return rows
  }, [questions, sort, reorderMode])

  const filtered = useMemo(() => {
    let rows = baseSorted
    if (!reorderMode) {
      if (query.trim()) {
        const q = query.trim().toLowerCase()
        rows = rows.filter((r) => r.text.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
      }
      if (pathFilter !== "all") rows = rows.filter((r) => r.paths.includes(pathFilter))
      if (typeFilter !== "all") rows = rows.filter((r) => r.type === typeFilter)
      if (statusFilter !== "all") rows = rows.filter((r) => r.status === statusFilter)
    }
    return rows
  }, [baseSorted, pathFilter, typeFilter, statusFilter, query, reorderMode])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = reorderMode ? filtered : filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Drag and drop handlers for reorder mode (works across full list)
  const onDragStart = (id: string) => setDragId(id)
  const onDragOver = (e: React.DragEvent<HTMLTableRowElement>) => e.preventDefault()
  const onDrop = async (overId: string) => {
    if (!dragId || dragId === overId) return
    const ids = filtered.map((r) => r.id)
    const from = ids.indexOf(dragId)
    const to = ids.indexOf(overId)
    if (from < 0 || to < 0) return
    const next = [...ids]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    
    try {
      await reorderQuestions(next); // persists order
      setDragId(null);
    } catch (error) {
      console.error("Failed to reorder questions:", error);
      toast({ 
        title: "Error", 
        description: "Failed to reorder questions. Please try again.", 
        variant: "destructive" 
      });
    }
  }

  const allSelectedOnPage = !reorderMode && pageRows.length > 0 && pageRows.every((r) => selected.includes(r.id))
  const toggleAllOnPage = (checked: boolean) => {
    const ids = pageRows.map((r) => r.id)
    setSelected((prev) => {
      if (checked) return Array.from(new Set([...prev, ...ids]))
      return prev.filter((id) => !ids.includes(id))
    })
  }

  const bulk = {
    activate: async () => {
      if (!selected.length) return
      try {
        await bulkUpdate(selected, { status: "active" });
        toast({ title: "Activated", description: `${selected.length} question(s) activated.` });
        setSelected([]);
      } catch (error) {
        console.error("Failed to activate questions:", error);
        toast({ 
          title: "Error", 
          description: "Failed to activate questions. Please try again.", 
          variant: "destructive" 
        });
      }
    },
    deactivate: async () => {
      if (!selected.length) return
      try {
        await bulkUpdate(selected, { status: "inactive" });
        toast({ title: "Deactivated", description: `${selected.length} question(s) deactivated.` });
        setSelected([]);
      } catch (error) {
        console.error("Failed to deactivate questions:", error);
        toast({ 
          title: "Error", 
          description: "Failed to deactivate questions. Please try again.", 
          variant: "destructive" 
        });
      }
    },
    delete: async () => {
      if (!selected.length) return
      if (!confirm(`Delete ${selected.length} question(s)?`)) return
      
      try {
        // Process deletes sequentially to avoid overloading the server
        for (const id of selected) {
          await remove(id);
        }
        
        toast({ title: "Deleted", description: `${selected.length} question(s) deleted.` });
        setSelected([]);
      } catch (error) {
        console.error("Failed to delete questions:", error);
        toast({ 
          title: "Error", 
          description: "Failed to delete questions. Please try again.", 
          variant: "destructive" 
        });
      }
    },
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="grid gap-3 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 md:flex-1">
            {!reorderMode && (
              <Input
                placeholder="Search questions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full md:max-w-md"
              />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={reorderMode ? "default" : "outline"} size="sm" onClick={() => setReorderMode((v) => !v)}>
              {reorderMode ? "Done Reordering" : "Reorder Mode"}
            </Button>
            {!reorderMode && (
              <>
                <Select value={pathFilter} onValueChange={(v: any) => setPathFilter(v)}>
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
                <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="text">Text Input</SelectItem>
                    <SelectItem value="single_select">Single Select</SelectItem>
                    <SelectItem value="multi_select">Multi Select</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sort} onValueChange={(v: any) => setSort(v)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modified-desc">Date Modified (newest)</SelectItem>
                    <SelectItem value="modified-asc">Date Modified (oldest)</SelectItem>
                    <SelectItem value="display-asc">Display Order</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>

        {!reorderMode && (
          <div className="flex flex-wrap items-center gap-2">
            <Checkbox checked={allSelectedOnPage} onCheckedChange={(v) => toggleAllOnPage(!!v)} id="selectAll" />
            <Label htmlFor="selectAll" className="text-sm text-muted-foreground">
              Select All ({filtered.length} questions)
            </Label>
            <Button variant="outline" size="sm" onClick={bulk.activate}>
              Activate
            </Button>
            <Button variant="outline" size="sm" onClick={bulk.deactivate}>
              Deactivate
            </Button>
            <Button variant="destructive" size="sm" onClick={bulk.delete}>
              Delete
            </Button>
          </div>
        )}

        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">{reorderMode ? "#" : ""}</TableHead>
                <TableHead className="w-8"></TableHead>
                <TableHead>Question</TableHead>
                <TableHead className="w-36">Type</TableHead>
                <TableHead className="w-32">Order</TableHead>
                <TableHead className="w-44">Path</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-36">Modified</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((row, idx) => {
                const checked = selected.includes(row.id)
                return (
                  <TableRow
                    key={row.id}
                    className={reorderMode ? "cursor-move" : ""}
                    draggable={reorderMode}
                    onDragStart={() => onDragStart(row.id)}
                    onDragOver={onDragOver}
                    onDrop={() => onDrop(row.id)}
                  >
                    <TableCell className="pt-4">
                      {reorderMode ? (
                        <GripVertical className="size-4 text-muted-foreground" />
                      ) : (
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) =>
                            setSelected((prev) => (v ? [...prev, row.id] : prev.filter((x) => x !== row.id)))
                          }
                          aria-label={`Select ${row.id}`}
                        />
                      )}
                    </TableCell>
                    <TableCell className="pt-4 text-muted-foreground">
                      <GripVertical className="size-4" aria-hidden="true" />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{row.text || "(Untitled question)"}</div>
                      <div className="text-xs text-muted-foreground">ID: {row.id}</div>
                    </TableCell>
                    <TableCell className="pt-4">
                      <TypeBadge type={row.type} />
                    </TableCell>
                    <TableCell className="pt-4">{row.order}</TableCell>
                    <TableCell className="pt-4">
                      {row.paths.length === 3 ? "All Paths" : row.paths.join(", ")}
                    </TableCell>
                    <TableCell className="pt-4">
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="pt-4 text-sm text-muted-foreground">
                      {new Date(row.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="pt-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/questions/${row.id}`)}>
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/questions/${row.id}/edit`)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            try {
                              const copy = await duplicate(row.id);
                              if (copy) router.push(`/questions/${copy.id}/edit`);
                            } catch (error) {
                              console.error("Failed to duplicate question:", error);
                              toast({ 
                                title: "Error", 
                                description: "Failed to duplicate question. Please try again.", 
                                variant: "destructive" 
                              });
                            }
                          }}
                        >
                          <Copy className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            if (!confirm("Delete this question?")) return
                            try {
                              await remove(row.id);
                              toast({ 
                                title: "Question Deleted", 
                                description: "The question has been deleted successfully." 
                              });
                            } catch (error) {
                              console.error("Failed to delete question:", error);
                              toast({ 
                                title: "Error", 
                                description: "Failed to delete question. Please try again.", 
                                variant: "destructive" 
                              });
                            }
                          }}
                        >
                          <Trash2 className="size-4 text-rose-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                    No questions match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {!reorderMode && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} questions
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
        )}

        {reorderMode && (
          <div className="text-xs text-muted-foreground">
            Drag rows to set the display order. Changes save automatically.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
