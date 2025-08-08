"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { newQuestionId } from "./id"
import { type QuestionStatus, type QuestionType } from "@/components/badges"

// Domain
export type OnboardingPath = "New Business" | "Existing Business" | "Growth Stage"

export type Question = {
  id: string
  text: string
  type: QuestionType
  paths: OnboardingPath[]
  required: boolean
  helpText?: string
  status: QuestionStatus
  createdAt: string // ISO
  updatedAt: string // ISO
}

const STORAGE_KEY = "questions-v1"

const SEED: Question[] = [
  {
    id: "Q-1234",
    text: "What is your primary business idea or concept?",
    type: "text",
    paths: ["New Business"],
    required: true,
    helpText:
      "This helps us understand your business foundation and tailor recommendations.",
    status: "active",
    createdAt: "2025-01-10T10:00:00.000Z",
    updatedAt: "2025-01-15T14:56:00.000Z",
  },
  {
    id: "Q-2235",
    text: "Which industry best describes your business?",
    type: "single_select",
    paths: ["New Business", "Existing Business", "Growth Stage"],
    required: true,
    helpText: "",
    status: "active",
    createdAt: "2025-01-11T09:30:00.000Z",
    updatedAt: "2025-01-14T16:10:00.000Z",
  },
  {
    id: "Q-3236",
    text: "What are your primary revenue streams?",
    type: "multi_select",
    paths: ["Existing Business"],
    required: false,
    helpText: "",
    status: "draft",
    createdAt: "2025-01-12T08:45:00.000Z",
    updatedAt: "2025-01-13T13:35:00.000Z",
  },
  {
    id: "Q-4237",
    text: "When did you start your business?",
    type: "date",
    paths: ["Existing Business"],
    required: false,
    helpText: "",
    status: "inactive",
    createdAt: "2025-01-12T08:45:00.000Z",
    updatedAt: "2025-01-12T12:05:00.000Z",
  },
]

// Local storage helpers
function loadInitial(): Question[] {
  if (typeof window === "undefined") return SEED
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED))
    return SEED
  }
  try {
    const parsed = JSON.parse(raw) as Question[]
    return Array.isArray(parsed) ? parsed : SEED
  } catch {
    return SEED
  }
}

function saveAll(list: Question[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

// Context
type QuestionsContextValue = {
  questions: Question[]
  addBlank(): Question
  duplicate(id: string): Question | undefined
  update(id: string, patch: Partial<Question>): void
  remove(id: string): void
  bulkUpdate(ids: string[], patch: Partial<Question>): void
  getById(id: string): Question | undefined
}

const QuestionsContext = createContext<QuestionsContextValue | null>(null)

export function QuestionsProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>(loadInitial)

  // keep storage in sync
  useEffect(() => {
    saveAll(questions)
  }, [questions])

  const addBlank = useCallback((): Question => {
    const now = new Date().toISOString()
    const q: Question = {
      id: newQuestionId(),
      text: "",
      type: "text",
      paths: ["New Business"],
      required: false,
      helpText: "",
      status: "draft",
      createdAt: now,
      updatedAt: now,
    }
    setQuestions((prev) => [q, ...prev])
    return q
  }, [])

  const duplicate = useCallback(
    (id: string) => {
      const source = questions.find((q) => q.id === id)
      if (!source) return
      const now = new Date().toISOString()
      const copy: Question = {
        ...source,
        id: newQuestionId(),
        status: "draft",
        createdAt: now,
        updatedAt: now,
        text: source.text ? `${source.text} (Copy)` : "(Copy)",
      }
      setQuestions((prev) => [copy, ...prev])
      return copy
    },
    [questions],
  )

  const update = useCallback((id: string, patch: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, ...patch, updatedAt: new Date().toISOString() } : q,
      ),
    )
  }, [])

  const remove = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }, [])

  const bulkUpdate = useCallback((ids: string[], patch: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) =>
        ids.includes(q.id)
          ? { ...q, ...patch, updatedAt: new Date().toISOString() }
          : q,
      ),
    )
  }, [])

  const getById = useCallback(
    (id: string) => questions.find((q) => q.id === id),
    [questions],
  )

  const value = useMemo<QuestionsContextValue>(
    () => ({ questions, addBlank, duplicate, update, remove, bulkUpdate, getById }),
    [questions, addBlank, duplicate, update, remove, bulkUpdate, getById],
  )

  return <QuestionsContext.Provider value={value}>{children}</QuestionsContext.Provider>
}

export function useQuestions() {
  const ctx = useContext(QuestionsContext)
  if (!ctx) throw new Error("useQuestions must be used within <QuestionsProvider>")
  return ctx
}

// Utilities
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
