"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

type PreviewType = "text" | "single_select" | "multi_select" | "date"

export function QuestionPreview({
  question,
  currentPath = "New Business",
}: {
  question: {
    text: string
    type: PreviewType
    helpText?: string
    required: boolean
    options?: string[]
  }
  currentPath?: "New Business" | "Existing Business" | "Growth Stage"
}) {
  const [answerText, setAnswerText] = useState("")
  const [answerDate, setAnswerDate] = useState("")
  const [single, setSingle] = useState<string>("")
  const [multi, setMulti] = useState<string[]>([])

  const options = question.options && question.options.length ? question.options : ["Option 1", "Option 2"]

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Question 1 of 12</CardTitle>
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {currentPath} Path
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2 text-[15px] font-medium">
          {question.text || "What is your primary business idea or concept?"}
          {question.required ? " *" : ""}
        </div>

        {question.type === "text" && (
          <div className="rounded-md border bg-background">
            <textarea
              placeholder="Describe your business idea in detail..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="h-28 w-full resize-none rounded-md bg-transparent p-3 outline-none"
            />
          </div>
        )}

        {question.type === "date" && (
          <div className="rounded-md border bg-background p-3">
            <input
              type="date"
              className="h-9 w-full bg-transparent outline-none"
              value={answerDate}
              onChange={(e) => setAnswerDate(e.target.value)}
            />
          </div>
        )}

        {question.type === "single_select" && (
          <div className="rounded-md border bg-background p-3">
            <RadioGroup value={single} onValueChange={setSingle}>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center space-x-2 py-1">
                  <RadioGroupItem id={`opt-${i}`} value={opt} />
                  <Label htmlFor={`opt-${i}`} className="text-sm">
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {question.type === "multi_select" && (
          <div className="rounded-md border bg-background p-3">
            <div className="grid gap-2">
              {options.map((opt, i) => {
                const checked = multi.includes(opt)
                return (
                  <div key={i} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mopt-${i}`}
                      checked={checked}
                      onCheckedChange={() =>
                        setMulti((prev) => (checked ? prev.filter((x) => x !== opt) : [...prev, opt]))
                      }
                    />
                    <Label htmlFor={`mopt-${i}`} className="text-sm">
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
          <span>
            {question.helpText || "This helps us understand your business foundation and tailor recommendations."}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <div className="flex items-center gap-1" aria-label="Progress indicators">
            <span className="size-1.5 rounded-full bg-muted-foreground/40" />
            <span className="size-1.5 rounded-full bg-muted-foreground/40" />
            <span className="size-1.5 rounded-full bg-muted-foreground/90" />
            <span className="size-1.5 rounded-full bg-muted-foreground/40" />
            <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          </div>
          <Button size="sm">Next</Button>
        </div>
      </CardContent>
    </Card>
  )
}
