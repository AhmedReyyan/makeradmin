"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Eye, Save, Trash2 } from 'lucide-react'
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { OnboardingPath, Question } from "@/lib/questions"
import { PATH_COUNTS, useQuestions } from "@/lib/questions"
import type { QuestionType } from "@/components/badges"
import { formatTypeLabel } from "@/components/badges"

type EditState = {
  text: string
  type: QuestionType
  paths: OnboardingPath[]
  required: boolean
  helpText: string
  options: string[]
}

export function QuestionForm({
  id,
  onSaved,
}: {
  id: string
  onSaved?: () => void
}) {
  const { getById, update, remove } = useQuestions()
  const router = useRouter()
  const { toast } = useToast()
  const source = getById(id)

  const [state, setState] = useState<EditState>(() => ({
    text: source?.text ?? "",
    type: source?.type ?? "text",
    paths: source?.paths ?? ["New Business"],
    required: source?.required ?? false,
    helpText: source?.helpText ?? "",
    options: source?.options ?? [],
  }))

  const [autoPreview, setAutoPreview] = useState(true)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const debounceRef = useRef<number | null>(null)

  // Autosave on changes with small debounce
  useEffect(() => {
    if (!autoPreview) return
    if (!source) return
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      update(source.id, { ...source, ...state })
      setLastSavedAt(new Date().toISOString())
    }, 500)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [state, autoPreview, source, update])

  if (!source) {
    return <p className="text-muted-foreground">Question not found.</p>
  }

  const togglePath = (p: OnboardingPath) => {
    setState(s => {
      const has = s.paths.includes(p)
      const next = has ? s.paths.filter(x => x !== p) : [...s.paths, p]
      return { ...s, paths: next }
    })
  }

  const save = () => {
    update(source.id, { ...source, ...state })
    setLastSavedAt(new Date().toISOString())
    toast({ title: "Saved", description: "Changes have been saved." })
    onSaved?.()
  }

  const del = () => {
    if (!confirm("Delete this question? This action cannot be undone.")) return
    remove(source.id)
    toast({ title: "Question deleted" })
    router.push("/questions")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left: Form */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Question Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-4">
          <div className="grid gap-2">
            <Label htmlFor="qtext">Question Text *</Label>
            <Textarea
              id="qtext"
              value={state.text}
              onChange={(e) => setState(s => ({ ...s, text: e.target.value }))}
              placeholder="What is your primary business idea or concept?"
              className="min-h-[96px]"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">{state.text.length}/500 characters</div>
          </div>

          <div className="grid gap-2">
            <Label>Question Type</Label>
            <Select
              value={state.type}
              onValueChange={(v: QuestionType) => {
                setState(s => ({
                  ...s,
                  type: v,
                  options: v === "single_select" || v === "multi_select" 
                    ? s.options.length ? s.options : ["Option 1"] 
                    : []
                }))
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {(["text", "single_select", "multi_select", "date"] as QuestionType[]).map(t => (
                  <SelectItem key={t} value={t}>{formatTypeLabel(t)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Options input for single_select and multi_select */}
          {(state.type === "single_select" || state.type === "multi_select") && (
            <div className="grid gap-2 mt-4">
              <Label>Options</Label>
              <div className="flex flex-col gap-2">
                {state.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      value={opt}
                      onChange={e => {
                        const val = e.target.value
                        setState(s => {
                          const options = [...s.options]
                          options[idx] = val
                          return { ...s, options }
                        })
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="w-full"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setState(s => ({
                          ...s,
                          options: s.options.filter((_, i) => i !== idx)
                        }))
                      }}
                      aria-label="Remove option"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState(s => ({ ...s, options: [...s.options, `Option ${s.options.length + 1}`] }))}
                >
                  Add Option
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">Options users can select from</div>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Onboarding Paths</Label>
            <div className="rounded-md border">
              {(["New Business", "Existing Business", "Growth Stage"] as OnboardingPath[]).map((p, i) => (
                <div key={p} className="flex items-center justify-between gap-3 p-3 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`path-${i}`}
                      checked={state.paths.includes(p)}
                      onCheckedChange={() => togglePath(p)}
                    />
                    <Label htmlFor={`path-${i}`} className="text-sm font-normal">{p}</Label>
                  </div>
                  <span className="text-xs text-muted-foreground">{PATH_COUNTS[p]} users</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="text-sm font-medium">Required Question</div>
              <div className="text-xs text-muted-foreground">Users must answer to continue</div>
            </div>
            <Switch
              checked={state.required}
              onCheckedChange={(v) => setState(s => ({ ...s, required: !!v }))}
              aria-label="Required question"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="help">Help Text</Label>
            <Input
              id="help"
              value={state.helpText}
              onChange={(e) => setState(s => ({ ...s, helpText: e.target.value }))}
              placeholder="This helps us understand your business foundation and tailor recommendations."
            />
            <div className="text-xs text-muted-foreground">
              Appears below the question to provide additional context
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button variant="destructive" size="sm" onClick={del}>
              <Trash2 className="mr-2 size-4" />
              Delete Question
            </Button>
            <div className="ms-auto" />
            <Button variant="outline" size="sm" onClick={() => history.back()}>
              Cancel
            </Button>
            <Button size="sm" onClick={save}>
              <Save className="mr-2 size-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Right: Live preview */}
      <div className="space-y-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <QuestionPreview
              question={{
                text: state.text,
                type: state.type,
                helpText: state.helpText,
                required: state.required,
                options: state.options
              }}
              currentPath={state.paths[0]}
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Switch checked={autoPreview} onCheckedChange={(v) => setAutoPreview(!!v)} id="auto" />
              <label htmlFor="auto" className="text-sm">Preview updates automatically as you edit</label>
            </div>
            {lastSavedAt ? (
              <div className="text-xs text-muted-foreground">Auto-saved just now</div>
            ) : (
              <div className="text-xs text-muted-foreground">Enable to autosave</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Inline import to avoid circular dependency
function QuestionPreview({
  question,
  currentPath,
}: {
  question: Pick<Question, "text" | "type" | "helpText" | "required" | "options">
  currentPath?: OnboardingPath
}) {
  const { useState, useEffect } = require("react")
  const { Card, CardContent, CardHeader, CardTitle } = require("@/components/ui/card")
  const { Badge } = require("@/components/ui/badge")
  const { Button } = require("@/components/ui/button")
  const { Info, Calendar, AlertCircle } = require("lucide-react")
  const { Checkbox } = require("@/components/ui/checkbox")
  const { RadioGroup, RadioGroupItem } = require("@/components/ui/radio-group")
  const { Label } = require("@/components/ui/label")
  
  const [selectedOption, setSelectedOption] = useState("")
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")
  const [dateValue, setDateValue] = useState("")
  const [validationError, setValidationError] = useState("")
  
  // Reset form values when question changes
  useEffect(() => {
    setInputValue("")
    setSelectedOption("")
    setSelectedOptions([])
    setDateValue("")
    setValidationError("")
  }, [question])
  
  // Check if current response is valid
  const isCurrentResponseValid = () => {
    if (!question.required) return true
    
    switch(question.type) {
      case "text":
        return !!inputValue.trim()
      case "single_select":
        return !!selectedOption
      case "multi_select":
        return selectedOptions.length > 0
      case "date":
        return !!dateValue
      default:
        return true
    }
  }
  
  const handleNext = () => {
    if (!isCurrentResponseValid()) {
      setValidationError("This question requires an answer")
      return
    }
    // In real implementation, this would navigate to the next question
  }
  
  const toggleOption = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option) 
        : [...prev, option]
    )
  }
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Question 1 of 12</CardTitle>
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {currentPath ?? "New Business"} Path
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2 text-[15px] font-medium">
          {question.text || "What is your primary business idea or concept?"}
          {question.required ? " *" : ""}
        </div>
        
        {/* Different input types based on question type */}
        {question.type === "text" && (
          <div className="rounded-md border bg-background p-0">
            <textarea
              placeholder="Describe your business idea in detail..."
              className="h-28 w-full resize-none rounded-md bg-transparent p-3 outline-none"
            />
          </div>
        )}
        
        {question.type === "single_select" && question.options && question.options.length > 0 && (
          <div className="rounded-md border bg-background p-3 space-y-2">
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {question.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
        
        {question.type === "multi_select" && question.options && question.options.length > 0 && (
          <div className="rounded-md border bg-background p-3 space-y-2">
            {question.options.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Checkbox 
                  id={`option-multi-${idx}`} 
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={() => toggleOption(option)}
                />
                <Label htmlFor={`option-multi-${idx}`}>{option}</Label>
              </div>
            ))}
          </div>
        )}
        
        {question.type === "date" && (
          <div className="rounded-md border bg-background p-3">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 opacity-70" />
              <input
                type="date"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>
        )}
        {question.helpText ? (
          <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4" />
            <span>{question.helpText}</span>
          </div>
        ) : (
          <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4" />
            <span>This helps us understand your business foundation and tailor recommendations.</span>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" size="sm">Previous</Button>
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
