import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type QuestionStatus = "active" | "draft" | "inactive"

export function StatusBadge({ status }: { status: QuestionStatus }) {
  const styles =
    status === "active"
      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
      : status === "draft"
      ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
      : "bg-slate-200 text-slate-700 hover:bg-slate-200"
  return (
    <Badge className={cn("pointer-events-none", styles)} variant="secondary">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export type QuestionType =
  | "text"
  | "single_select"
  | "multi_select"
  | "date"

export function formatTypeLabel(t: QuestionType) {
  switch (t) {
    case "text":
      return "Text Input"
    case "single_select":
      return "Single Select"
    case "multi_select":
      return "Multi Select"
    case "date":
      return "Date"
  }
}

export function TypeBadge({ type }: { type: QuestionType }) {
  return (
    <Badge variant="outline" className="bg-slate-50 text-slate-700">
      {formatTypeLabel(type)}
    </Badge>
  )
}
