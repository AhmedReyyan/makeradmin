"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { ChevronLeft, Save } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { PATH_COUNTS, type OnboardingPath, useQuestions } from "@/lib/questions"
import type { QuestionType } from "@/components/badges"
import { formatTypeLabel } from "@/components/badges"
import { OptionEditor } from "@/components/option-editor"
import { FlowPreview } from "@/components/flow-preview"
import { useToast } from "@/hooks/use-toast"

type DraftState = {
  text: string
  type: QuestionType
  paths: OnboardingPath[]
  required: boolean
  helpText: string
  options: string[]
  order: number
}

export default function CreateQuestionPage() {
  const router = useRouter()
  const { addBlank, update, questions } = useQuestions()
  const { toast } = useToast()

  const defaultOrder = useMemo(() => questions.reduce((m, q) => Math.max(m, q.order), 0) + 1, [questions])

  const [state, setState] = useState<DraftState>({
    text: "",
    type: "text",
    paths: ["New Business"],
    required: false,
    helpText: "This helps us understand your business foundation and tailor recommendations.",
    options: [],
    order: defaultOrder,
  })

  const [autoPreview, setAutoPreview] = useState(true)
  const [saving, setSaving] = useState(false)

  const togglePath = (p: OnboardingPath) => {
    setState((s) => {
      const has = s.paths.includes(p)
      const next = has ? s.paths.filter((x) => x !== p) : [...s.paths, p]
      return { ...s, paths: next }
    })
  }

  const onTypeChange = (t: QuestionType) => {
    setState((s) => {
      const ensureOptions =
        (t === "single_select" || t === "multi_select") && (!s.options || s.options.length === 0)
          ? ["Option 1", "Option 2"]
          : s.options
      return { ...s, type: t, options: ensureOptions }
    })
  }

  const save = async () => {
    try {
      setSaving(true)
      const q = await addBlank()
      await update(q.id, { ...state, status: "draft" })
      toast({ title: "Question created", description: "Your question has been saved." })
      router.replace(`/questions/${q.id}/edit`)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create question",
        // variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell
      title="Edit Question"
      subtitle="ID: Draft"
      right={<div className="text-xs text-muted-foreground">Not saved yet</div>}
      beforeTitle={
        <Link
          href="/questions"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 size-4" />
          Back
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                onChange={(e) => setState((s) => ({ ...s, text: e.target.value }))}
                placeholder="What is your primary business idea or concept?"
                className="min-h-[96px]"
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground text-right">{state.text.length}/500 characters</div>
            </div>

            <div className="grid gap-2">
              <Label>Question Type</Label>
              <Select value={state.type} onValueChange={onTypeChange as any}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {(["text", "single_select", "multi_select", "date"] as QuestionType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {formatTypeLabel(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(state.type === "single_select" || state.type === "multi_select") && (
              <OptionEditor options={state.options} onChange={(opts) => setState((s) => ({ ...s, options: opts }))} />
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
                      <Label htmlFor={`path-${i}`} className="text-sm font-normal">
                        {p}
                      </Label>
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
                onCheckedChange={(v) => setState((s) => ({ ...s, required: !!v }))}
                aria-label="Required question"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="help">Help Text</Label>
              <Input
                id="help"
                value={state.helpText}
                onChange={(e) => setState((s) => ({ ...s, helpText: e.target.value }))}
                placeholder="This helps us understand your business foundation and tailor recommendations."
              />
              <div className="text-xs text-muted-foreground">
                Appears below the question to provide additional context
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                min={1}
                value={state.order}
                onChange={(e) => setState((s) => ({ ...s, order: Math.max(1, Number(e.target.value) || 1) }))}
              />
              <div className="text-xs text-muted-foreground">
                Lower numbers appear earlier. You can also reorder later in Questions Management.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => history.back()}>
                Cancel
              </Button>
              <Button size="sm" onClick={save} disabled={saving}>
                <Save className="mr-2 size-4" />
                {saving ? "Creating..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <FlowPreview
                startId="draft"
                inject={{
                  id: "draft",
                  data: {
                    text: state.text,
                    type: state.type,
                    helpText: state.helpText,
                    required: state.required,
                    options: state.options,
                    order: state.order,
                    paths: state.paths,
                  },
                }}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Switch checked={autoPreview} onCheckedChange={(v) => setAutoPreview(!!v)} id="auto" />
                <label htmlFor="auto" className="text-sm">
                  Preview updates automatically as you edit
                </label>
              </div>
              <div className="text-xs text-muted-foreground">Not saved yet</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
