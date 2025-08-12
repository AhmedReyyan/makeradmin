"use client"

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { QuestionStatus, QuestionType } from "@/components/badges"

export type OnboardingPath = "New Business" | "Existing Business" | "Growth Stage"

export type Question = {
  id: string
  text: string
  type: QuestionType
  paths: OnboardingPath[]
  required: boolean
  helpText?: string
  status: QuestionStatus
  options?: string[]
  order: number
  createdAt: string
  updatedAt: string
}

type QuestionsContextValue = {
  questions: Question[]
  loading: boolean
  error: string | null
  addBlank(): Promise<Question>
  duplicate(id: string): Promise<Question | undefined>
  update(id: string, patch: Partial<Question>): Promise<void>
  remove(id: string): Promise<void>
  bulkUpdate(ids: string[], patch: Partial<Question>): Promise<void>
  reorderQuestions(newOrderIds: string[]): Promise<void>
  getById(id: string): Question | undefined
  refetch(): Promise<void>
}

const QuestionsContext = createContext<QuestionsContextValue | null>(null)

export function QuestionsProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/questions")
      if (!response.ok) throw new Error("Failed to fetch questions")
      const data = await response.json()
      setQuestions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch questions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const addBlank = useCallback(async (): Promise<Question> => {
    try {
      const maxOrder = questions.reduce((max, q) => Math.max(max, q.order), 0)
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "",
          type: "text",
          paths: ["New Business"],
          required: false,
          helpText: "",
          status: "draft",
          options: [],
          order: maxOrder + 1,
        }),
      })

      if (!response.ok) throw new Error("Failed to create question")
      const newQuestion = await response.json()
      setQuestions((prev) => [newQuestion, ...prev])
      return newQuestion
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to create question")
    }
  }, [questions])

  const duplicate = useCallback(
    async (id: string): Promise<Question | undefined> => {
      try {
        const source = questions.find((q) => q.id === id)
        if (!source) return undefined

        const maxOrder = questions.reduce((max, q) => Math.max(max, q.order), 0)
        const response = await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...source,
            text: source.text ? `${source.text} (Copy)` : "(Copy)",
            status: "draft",
            order: maxOrder + 1,
          }),
        })

        if (!response.ok) throw new Error("Failed to duplicate question")
        const copy = await response.json()
        setQuestions((prev) => [copy, ...prev])
        return copy
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to duplicate question")
      }
    },
    [questions],
  )

  const update = useCallback(async (id: string, patch: Partial<Question>): Promise<void> => {
    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })

      if (!response.ok) throw new Error("Failed to update question")
      const updated = await response.json()
      setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to update question")
    }
  }, [])

  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete question")
      setQuestions((prev) => prev.filter((q) => q.id !== id))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to delete question")
    }
  }, [])

  const bulkUpdate = useCallback(async (ids: string[], patch: Partial<Question>): Promise<void> => {
    try {
      const response = await fetch("/api/questions/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, patch }),
      })

      if (!response.ok) throw new Error("Failed to bulk update questions")

      // Update local state
      setQuestions((prev) =>
        prev.map((q) => (ids.includes(q.id) ? { ...q, ...patch, updatedAt: new Date().toISOString() } : q)),
      )
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to bulk update questions")
    }
  }, [])

  const reorderQuestions = useCallback(
    async (newOrderIds: string[]): Promise<void> => {
      try {
        const response = await fetch("/api/questions/reorder", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds: newOrderIds }),
        })

        if (!response.ok) throw new Error("Failed to reorder questions")

        // Update local state
        const byId = new Map(questions.map((q) => [q.id, q]))
        const reordered: Question[] = []

        newOrderIds.forEach((id, index) => {
          const q = byId.get(id)
          if (q) {
            reordered.push({ ...q, order: index + 1, updatedAt: new Date().toISOString() })
            byId.delete(id)
          }
        })

        // Add any remaining questions
        Array.from(byId.values()).forEach((q, index) => {
          reordered.push({ ...q, order: newOrderIds.length + index + 1, updatedAt: new Date().toISOString() })
        })

        setQuestions(reordered.sort((a, b) => a.order - b.order))
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to reorder questions")
      }
    },
    [questions],
  )

  const getById = useCallback((id: string) => questions.find((q) => q.id === id), [questions])

  const value = useMemo<QuestionsContextValue>(
    () => ({
      questions,
      loading,
      error,
      addBlank,
      duplicate,
      update,
      remove,
      bulkUpdate,
      reorderQuestions,
      getById,
      refetch: fetchQuestions,
    }),
    [
      questions,
      loading,
      error,
      addBlank,
      duplicate,
      update,
      remove,
      bulkUpdate,
      reorderQuestions,
      getById,
      fetchQuestions,
    ],
  )

  return createElement(QuestionsContext.Provider, { value }, children as any)
}

export function useQuestions() {
  const ctx = useContext(QuestionsContext)
  if (!ctx) throw new Error("useQuestions must be used within <QuestionsProvider>")
  return ctx
}

export function formatRelative(iso: string) {
  const ts = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, now - ts)
  const sec = Math.round(diff / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.round(sec / 60)
  if (min < 60) return `${min} min ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr} hr ago`
  const d = Math.round(hr / 24)
  return `${d}d ago`
}

export const PATH_COUNTS: Record<OnboardingPath, number> = {
  "New Business": 245,
  "Existing Business": 189,
  "Growth Stage": 156,
}
