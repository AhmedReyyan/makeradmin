"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useQuestions, type Question } from "@/lib/questions"

type FlowPreviewProps = {
  startId?: string
  inject?: { id: string; data: Partial<Question> } // replace or add unsaved
}

export function FlowPreview({ startId, inject }: FlowPreviewProps) {
  const { questions } = useQuestions()

  const list = useMemo(() => {
    // ordered by display order ascending
    const ordered = [...questions].sort((a, b) => a.order - b.order)
    if (inject) {
      const idx = ordered.findIndex((q) => q.id === inject.id)
      if (idx >= 0) {
        ordered[idx] = { ...ordered[idx], ...inject.data }
      } else {
        const newQ: Question = {
          id: inject.id,
          text: inject.data.text || "(Untitled question)",
          type: (inject.data.type as any) || "text",
          paths: inject.data.paths || ["New Business"],
          required: !!inject.data.required,
          helpText: inject.data.helpText || "",
          status: "draft",
          options: inject.data.options || [],
          order:
            typeof inject.data.order === "number" ? inject.data.order : (ordered[ordered.length - 1]?.order || 0) + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        ordered.push(newQ)
        ordered.sort((a, b) => a.order - b.order)
      }
    }
    return ordered
  }, [questions, inject])

  const startIndex = Math.max(0, startId ? list.findIndex((q) => q.id === startId) : 0)

  const [index, setIndex] = useState(startIndex)
  const q = list[index]

  // answers state
  const [answersText, setAnswersText] = useState<Record<string, string>>({})
  const [answersDate, setAnswersDate] = useState<Record<string, string>>({})
  const [single, setSingle] = useState<Record<string, string>>({})
  const [multi, setMulti] = useState<Record<string, string[]>>({})
  const [showError, setShowError] = useState(false)

  if (!q) return null

  const options = (q.options && q.options.length ? q.options : ["Option 1", "Option 2"]).map((s) => String(s))

  function isAnswered(qq: Question) {
    if (!qq.required) return true
    switch (qq.type) {
      case "text":
        return (answersText[qq.id] || "").trim().length > 0
      case "date":
        return !!answersDate[qq.id]
      case "single_select":
        return !!single[qq.id]
      case "multi_select":
        return (multi[qq.id] || []).length > 0
      default:
        return true
    }
  }

  function next() {
    if (!isAnswered(q)) {
      setShowError(true)
      return
    }
    setShowError(false)
    setIndex((i) => Math.min(list.length - 1, i + 1))
  }

  function prev() {
    setShowError(false)
    setIndex((i) => Math.max(0, i - 1))
  }

  const progressDots = list.length

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{`Question ${index + 1} of ${list.length}`}</CardTitle>
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {/* Path is illustrative in preview */}
            New Business Path
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2 text-[15px] font-medium">
          {q.text || "(Untitled question)"} {q.required ? "*" : ""}
        </div>

        {q.type === "text" && (
          <div className={`rounded-md border bg-background ${showError && !isAnswered(q) ? "border-rose-400" : ""}`}>
            <textarea
              placeholder="Describe your answer..."
              value={answersText[q.id] || ""}
              onChange={(e) => setAnswersText((m) => ({ ...m, [q.id]: e.target.value }))}
              className="h-28 w-full resize-none rounded-md bg-transparent p-3 outline-none"
            />
          </div>
        )}

        {q.type === "date" && (
          <div
            className={`rounded-md border bg-background p-3 ${showError && !isAnswered(q) ? "border-rose-400" : ""}`}
          >
            <input
              type="date"
              className="h-9 w-full bg-transparent outline-none"
              value={answersDate[q.id] || ""}
              onChange={(e) => setAnswersDate((m) => ({ ...m, [q.id]: e.target.value }))}
            />
          </div>
        )}

        {q.type === "single_select" && (
          <div
            className={`rounded-md border bg-background p-3 ${showError && !isAnswered(q) ? "border-rose-400" : ""}`}
          >
            <RadioGroup value={single[q.id] || ""} onValueChange={(v) => setSingle((m) => ({ ...m, [q.id]: v }))}>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center space-x-2 py-1">
                  <RadioGroupItem id={`opt-${q.id}-${i}`} value={opt} />
                  <Label htmlFor={`opt-${q.id}-${i}`} className="text-sm">
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {q.type === "multi_select" && (
          <div
            className={`rounded-md border bg-background p-3 ${showError && !isAnswered(q) ? "border-rose-400" : ""}`}
          >
            <div className="grid gap-2">
              {options.map((opt, i) => {
                const checked = (multi[q.id] || []).includes(opt)
                return (
                  <div key={i} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mopt-${q.id}-${i}`}
                      checked={checked}
                      onCheckedChange={() =>
                        setMulti((m) => {
                          const curr = m[q.id] || []
                          const next = checked ? curr.filter((x) => x !== opt) : [...curr, opt]
                          return { ...m, [q.id]: next }
                        })
                      }
                    />
                    <Label htmlFor={`mopt-${q.id}-${i}`} className="text-sm">
                      {opt}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4" />
          <span>{q.helpText || "This helps us understand your business and tailor recommendations."}</span>
        </div>

        {showError && !isAnswered(q) && <div className="mt-2 text-xs text-rose-600">This question is required.</div>}

        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={prev} disabled={index === 0}>
            Previous
          </Button>
          <div className="flex items-center gap-1" aria-label="Progress indicators">
            {Array.from({ length: progressDots }).map((_, i) => (
              <span
                key={i}
                className={`size-1.5 rounded-full ${i === index ? "bg-muted-foreground/90" : "bg-muted-foreground/40"}`}
              />
            ))}
          </div>
          <Button size="sm" onClick={next}>
            {index === list.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
