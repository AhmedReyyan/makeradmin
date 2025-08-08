"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react'
import { useQuestions } from "@/lib/questions"
import { StatusBadge, TypeBadge } from "@/components/badges"
import { QuestionPreview } from "@/components/question-preview"

export default function QuestionDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { getById, remove } = useQuestions()
  const q = getById(params.id)

  if (!q) {
    return (
      <PageShell title="Question Details" subtitle={`ID: ${params.id}`}>
        <p className="text-muted-foreground">Question not found.</p>
      </PageShell>
    )
  }

  const onDelete = () => {
    if (!confirm("Delete this question? This action cannot be undone.")) return
    remove(q.id)
    router.push("/questions")
  }

  return (
    <PageShell title="Question Details" subtitle={`ID: ${q.id}`}>
      <div className="mb-3">
        <Link href="/questions" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-1 size-4" />
          Back to Questions
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Question Text</div>
              <div className="text-sm">{q.text || "(Untitled question)"}</div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Type</div>
                <TypeBadge type={q.type} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Status</div>
                <StatusBadge status={q.status} />
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Paths</div>
              <div className="flex flex-wrap gap-2">
                {q.paths.map(p => (
                  <Badge key={p} variant="outline" className="bg-slate-50">{p}</Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Required</div>
              <div className="text-sm">{q.required ? "Yes" : "No"}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Help Text</div>
              <div className="text-sm text-muted-foreground">{q.helpText || "—"}</div>
            </div>

            <Separator />

            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => router.push(`/questions/${q.id}/edit`)}>
                <Pencil className="mr-2 size-4" />
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={onDelete}>
                <Trash2 className="mr-2 size-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <QuestionPreview
              question={{
                text: q.text,
                type: q.type,
                helpText: q.helpText,
                required: q.required,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
