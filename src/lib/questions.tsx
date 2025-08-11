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
import { newQuestionId } from "./id"
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
  options?: string[] // for single_select and multi_select
  order: number // display order (1-based)
  createdAt: string // ISO
  updatedAt: string // ISO
}

const STORAGE_KEY = "questions-v2" // bumped to v2 to include order/options

const SEED: Question[] = [
  {
    id: "Q-1234",
    text: "What is your primary business idea or concept?",
    type: "text",
    paths: ["New Business"],
    required: true,
    helpText: "This helps us understand your business foundation and tailor recommendations.",
    status: "active",
    options: [],
    order: 1,
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
    options: ["Technology", "Retail", "Healthcare", "Other"],
    order: 2,
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
    options: ["Subscriptions", "One-time Sales", "Ads", "Services"],
    order: 3,
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
    options: [],
    order: 4,
    createdAt: "2025-01-12T08:45:00.000Z",
    updatedAt: "2025-01-12T12:05:00.000Z",
  },
]

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

// This function will be used when we transition to MongoDB
async function loadFromDb(): Promise<Question[]> {
  if (typeof window === "undefined") return SEED
  
  try {
    const response = await fetch('/api/questions');
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    const data = await response.json();
    return data.questions;
  } catch (error) {
    console.error('Error loading questions from DB:', error);
    // Fallback to localStorage
    return loadInitial();
  }
}

function nextOrder(list: Question[]) {
  return list.reduce((m, q) => Math.max(m, q.order), 0) + 1
}

type QuestionsContextValue = {
  questions: Question[]
  addBlank(): Question
  duplicate(id: string): Question | undefined
  update(id: string, patch: Partial<Question>): void
  remove(id: string): void
  bulkUpdate(ids: string[], patch: Partial<Question>): void
  reorderQuestions(newOrderIds: string[]): void
  getById(id: string): Question | undefined
  refreshQuestions(): Promise<void>
}

const QuestionsContext = createContext<QuestionsContextValue | null>(null)

export function QuestionsProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>(loadInitial)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load questions initially from localStorage, then try to fetch from API
  useEffect(() => {
    const fetchFromApi = async () => {
      try {
        const apiQuestions = await loadFromDb();
        setQuestions(apiQuestions);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load questions from API:', error);
        // Already loaded from localStorage in useState initialization
        setIsInitialized(true);
      }
    };

    fetchFromApi();
  }, []);

  // Sync to localStorage for backward compatibility
  useEffect(() => {
    if (isInitialized) {
      saveAll(questions);
    }
  }, [questions, isInitialized]);

  const refreshQuestions = useCallback(async () => {
    try {
      const apiQuestions = await loadFromDb();
      setQuestions(apiQuestions);
    } catch (error) {
      console.error('Failed to refresh questions:', error);
    }
  }, []);

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
      options: [],
      order: nextOrder(questions),
      createdAt: now,
      updatedAt: now,
    }
    setQuestions((prev) => [q, ...prev])
    
    // Create in database in background
    fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(q),
    }).catch(err => console.error('Failed to create question in DB:', err));
    
    return q
  }, [questions])

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
        order: nextOrder(questions),
      }
      setQuestions((prev) => [copy, ...prev])
      
      // Create in database in background
      fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copy),
      }).catch(err => console.error('Failed to duplicate question in DB:', err));
      
      return copy
    },
    [questions],
  )

  const update = useCallback((id: string, patch: Partial<Question>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch, updatedAt: new Date().toISOString() } : q)))
    
    // Update in database in background
    fetch(`/api/questions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }).catch(err => console.error(`Failed to update question ${id} in DB:`, err));
  }, [])

  const remove = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
    
    // Delete from database in background
    fetch(`/api/questions/${id}`, {
      method: 'DELETE',
    }).catch(err => console.error(`Failed to delete question ${id} from DB:`, err));
  }, [])

  const bulkUpdate = useCallback((ids: string[], patch: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (ids.includes(q.id) ? { ...q, ...patch, updatedAt: new Date().toISOString() } : q)),
    )
    
    // Bulk update in database in background
    fetch('/api/questions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, patch }),
    }).catch(err => console.error('Failed to bulk update questions in DB:', err));
  }, [])

  const reorderQuestions = useCallback((newOrderIds: string[]) => {
    setQuestions((prev) => {
      const byId = new Map(prev.map((q) => [q.id, q]))
      const ordered: Question[] = []
      let n = 1
      for (const id of newOrderIds) {
        const q = byId.get(id)
        if (!q) continue
        ordered.push({ ...q, order: n, updatedAt: new Date().toISOString() })
        byId.delete(id)
        n++
      }
      const rest = Array.from(byId.values()).sort((a, b) => a.order - b.order)
      for (const q of rest) {
        ordered.push({ ...q, order: n, updatedAt: new Date().toISOString() })
        n++
      }
      return ordered
    })
    
    // Update order in database in background
    const orderMap = newOrderIds.map((id, index) => ({ id, order: index + 1 }));
    fetch('/api/questions/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderMap }),
    }).catch(err => console.error('Failed to reorder questions in DB:', err));
  }, [])

  const getById = useCallback((id: string) => questions.find((q) => q.id === id), [questions])

  const value = useMemo<QuestionsContextValue>(
    () => ({ 
      questions, 
      addBlank, 
      duplicate, 
      update, 
      remove, 
      bulkUpdate, 
      reorderQuestions, 
      getById,
      refreshQuestions 
    }),
    [questions, addBlank, duplicate, update, remove, bulkUpdate, reorderQuestions, getById, refreshQuestions],
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
