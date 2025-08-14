"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, Trash2, Loader2 } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { useResponses, type ResponseSession, formatRelative } from "@/lib/responses"
import { QuestionsProvider, useQuestions } from "@/lib/questions"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"





export  function ResponseDetailContent() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { getById, remove } = useResponses()
  const { questions } = useQuestions()
  const { toast } = useToast()

  const [response, setResponse] = useState<ResponseSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        const data = await getById(params.id)
        setResponse(data)
      } catch (error) {
        console.error("Failed to fetch response:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchResponse()
  }, [params.id, getById])

  const handleDelete = async () => {
    if (!response) return
    if (!confirm("Delete this response? This action cannot be undone.")) return

    try {
      await remove(response.id)
      toast({ title: "Response deleted" })
      router.push("/responses")
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
      <PageShell title="Response Details">
        <Card className="shadow-sm">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="size-6 animate-spin mr-2" />
            <span>Loading response...</span>
          </CardContent>
        </Card>
      </PageShell>
    )
  }

  if (!response) {
    return (
        
      <PageShell title="Response Details">
        <div className="mb-3">
          <Link
            href="/responses"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 size-4" />
            Back to Responses
          </Link>
        </div>
        <Card className="shadow-sm">
          <CardContent className="p-8 text-center text-muted-foreground">Response not found.</CardContent>
        </Card>
      </PageShell>
    )
  }

  // Create a map of questions for easy lookup
  const questionMap = new Map(questions.map((q) => [q.id, q]))

  return (
    <PageShell title="Response Details" subtitle={`Session: ${response.sessionId}`}>
      <div className="mb-3">
        <Link
          href="/responses"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 size-4" />
          Back to Responses
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Session Info */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Session Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Session ID</div>
              <div className="font-mono text-sm">{response.sessionId}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Business Path</div>
              <Badge variant="outline" className="bg-slate-50">
                {response.businessPath}
              </Badge>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Status</div>
              <Badge
                variant={response.completed ? "default" : "secondary"}
                className={response.completed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}
              >
                {response.completed ? "Completed" : "Incomplete"}
              </Badge>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Responses</div>
              <div className="text-sm">{response.responses.length} answers</div>
            </div>

            <Separator />

            <div>
              <div className="text-xs text-muted-foreground mb-1">Submitted</div>
              <div className="text-sm">{formatRelative(response.createdAt)}</div>
              <div className="text-xs text-muted-foreground">{new Date(response.createdAt).toLocaleString()}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">User Info</div>
              <div className="text-xs">
                <div>IP: {response.userInfo.ip || "Unknown"}</div>
                <div className="break-all mt-1">Agent: {response.userInfo.userAgent || "Unknown"}</div>
              </div>
            </div>

            <Separator />

            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 size-4" />
              Delete Response
            </Button>
          </CardContent>
        </Card>

        {/* Responses */}
        <div className="lg:col-span-2 space-y-3">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">User Answers</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {response.responses.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No answers recorded for this session.</div>
              ) : (
                <div className="space-y-4">
                  {response.responses.map((resp, index) => {
                    const question = questionMap.get(resp.questionId)
                    return (
                      <div key={resp.questionId || index} className="border rounded-lg p-4">
                        <div className="mb-2">
                          <div className="text-sm font-medium">{question?.text || `Question ${resp.questionId}`}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {resp.questionId}
                            {question && (
                              <>
                                {" • "}
                                Type: {question.type.replace("_", " ")}
                                {question.required && " • Required"}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="bg-muted/50 rounded p-3">
                          <div className="text-sm font-medium text-foreground">{resp.answer}</div>
                        </div>

                        {question?.helpText && (
                          <div className="mt-2 text-xs text-muted-foreground">Help: {question.helpText}</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}