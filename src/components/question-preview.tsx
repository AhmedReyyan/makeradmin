"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info } from 'lucide-react'

export function QuestionPreview({
  question,
  currentPath = "New Business",
}: {
  question: {
    text: string
    type: "text" | "single_select" | "multi_select" | "date"
    helpText?: string
    required: boolean
  }
  currentPath?: "New Business" | "Existing Business" | "Growth Stage"
}) {
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
        <div className="rounded-md border bg-background p-0">
          <textarea
            readOnly
            placeholder="Describe your business idea in detail..."
            className="h-28 w-full resize-none rounded-md bg-transparent p-3 outline-none"
          />
        </div>
        <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4" />
          <span>
            {question.helpText ||
              "This helps us understand your business foundation and tailor recommendations."}
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
