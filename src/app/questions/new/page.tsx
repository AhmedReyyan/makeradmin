"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuestions } from "@/lib/questions"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function NewQuestionPage() {
  const { addBlank } = useQuestions()
  const router = useRouter()

  useEffect(() => {
    const q = addBlank()
    // Defer to allow paint of the skeleton once before redirect
    const t = setTimeout(() => router.replace(`/questions/${q.id}/edit`), 50)
    return () => clearTimeout(t)
  }, [addBlank, router])

  return (
    <PageShell title="Create Question" subtitle="Preparing a new draft…">
      <Card className="shadow-sm">
        <CardContent className="p-6 grid gap-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    </PageShell>
  )
}
