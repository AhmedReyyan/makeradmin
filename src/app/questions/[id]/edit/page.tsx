"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from 'lucide-react'
import { useQuestions, formatRelative } from "@/lib/questions"
import { QuestionForm } from "@/components/question-form"

export default function EditQuestionPage() {
  const params = useParams<{ id: string }>()
  const { getById } = useQuestions()
  const q = getById(params.id)

  return (
    <PageShell
      title="Edit Question"
      subtitle={`ID: ${params.id}`}
      right={
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {q ? <span>Auto-saved {formatRelative(q.updatedAt)}</span> : null}
        </div>
      }
    >
      <div className="mb-3">
        <Link href="/questions" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-1 size-4" />
          Back to Questions
        </Link>
      </div>
      {q ? <QuestionForm id={q.id} /> : <p className="text-muted-foreground">Question not found.</p>}
    </PageShell>
  )
}
