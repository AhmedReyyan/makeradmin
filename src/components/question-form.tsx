"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Save, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { OnboardingPath } from "@/lib/questions"
import { PATH_COUNTS, useQuestions } from "@/lib/questions"
import type { QuestionType } from "@/components/badges"
import { formatTypeLabel } from "@/components/badges"
import { OptionEditor } from "@/components/option-editor"
import { FlowPreview } from "@/components/flow-preview"

type EditState = {
  text: string
  type: QuestionType
  paths: OnboardingPath[]
  required: boolean
  helpText: string
  options: string[]
}

export function QuestionForm({ id, onSaved }: { id: string; onSaved?: () => void }) {
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

  useEffect(() => {
    if (!autoPreview || !source) return
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(async () => {
      try {
        await update(source.id, { ...source, ...state })
        setLastSavedAt(new Date().toISOString())
      } catch (error) {
        console.error("Failed to auto-save:", error);
      }
    }, 400)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [state, autoPreview, source, update])

  if (!source) return <p className="text-muted-foreground">Question not found.</p>

  const togglePath = (p: OnboardingPath) => {
    setState((s) => {
      const has = s.paths.includes(p)
      const next = has ? s.paths.filter((x) => x !== p) : [...s.paths, p]
      return { ...s, paths: next }
    })
  }

  const save = async () => {
    try {
      await update(source.id, { ...source, ...state });
      setLastSavedAt(new Date().toISOString());
      toast({ title: "Saved", description: "Changes have been saved." });
      onSaved?.();
    } catch (error) {
      console.error("Failed to save changes:", error);
      toast({ 
        title: "Error", 
        description: "Failed to save changes. Please try again.", 
        variant: "destructive" 
      });
    }
  }

  const del = async () => {
    if (!confirm("Delete this question? This action cannot be undone.")) return
    try {
      await remove(source.id);
      toast({ title: "Question deleted" });
      router.push("/questions");
    } catch (error) {
      console.error("Failed to delete question:", error);
      toast({ 
        title: "Error", 
        description: "Failed to delete question. Please try again.", 
        variant: "destructive" 
      });
    }
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

  return (
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

      <div className="space-y-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <FlowPreview startId={source.id} inject={{ id: source.id, data: { ...state } }} />
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
