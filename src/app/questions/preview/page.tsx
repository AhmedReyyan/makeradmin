"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageShell } from "@/components/page-shell"
import { QuestionPreview } from "@/components/question-preview"
import { useQuestions, type OnboardingPath } from "@/lib/questions"

export default function QuestionPreviewPage() {
  const [selectedPath, setSelectedPath] = useState<OnboardingPath>("New Business")
  
  return (
    <PageShell
      title="Question Flow Preview"
      description="Preview the questions in the order they will be presented to users"
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="font-medium">Select Onboarding Path:</div>
              <Select
                value={selectedPath}
                onValueChange={(value) => setSelectedPath(value as OnboardingPath)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a path" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New Business">New Business</SelectItem>
                  <SelectItem value="Existing Business">Existing Business</SelectItem>
                  <SelectItem value="Growth Stage">Growth Stage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <div className="max-w-2xl mx-auto">
          <QuestionPreview 
            question={{
              text: "",
              type: "text",
              helpText: "",
              required: false
            }}
            currentPath={selectedPath}
            standaloneMode={true}
          />
        </div>
      </div>
    </PageShell>
  )
}
