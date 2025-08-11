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

// MongoDB is now used for storage, no need for local storage key
// This constant is kept for reference only
// const STORAGE_KEY = "questions-v2" // bumped to v2 to include order/options

// Sample data structure for reference - not used in the actual application
// since all data comes from MongoDB
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

// Remove localStorage functions as we're now using MongoDB exclusively
// Note: SEED data is maintained as a reference but will not be used

// Load questions from database
async function loadFromDb(): Promise<Question[]> {
  if (typeof window === "undefined") return []
  
  try {
    console.log('Fetching questions from MongoDB...');
    const response = await fetch('/api/questions');
    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Questions loaded from MongoDB:', data);
    
    // Check if response has the expected structure
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    return data.questions || [];
  } catch (error) {
    console.error('Error loading questions from DB:', error);
    return [];
  }
}

function nextOrder(list: Question[]) {
  return list.reduce((m, q) => Math.max(m, q.order), 0) + 1
}

type QuestionsContextValue = {
  questions: Question[]
  addBlank(): Promise<Question>
  duplicate(id: string): Promise<Question | undefined>
  update(id: string, patch: Partial<Question>): Promise<void>
  remove(id: string): Promise<void>
  bulkUpdate(ids: string[], patch: Partial<Question>): Promise<void>
  reorderQuestions(newOrderIds: string[]): Promise<void>
  getById(id: string): Question | undefined
  refreshQuestions(): Promise<void>
}

const QuestionsContext = createContext<QuestionsContextValue | null>(null)

export function QuestionsProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load questions from MongoDB on component mount
  useEffect(() => {
    const fetchFromApi = async () => {
      setLoading(true);
      try {
        const apiQuestions = await loadFromDb();
        setQuestions(apiQuestions);
        setError(null);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load questions from MongoDB:', error);
        setError('Failed to load questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFromApi();
  }, []);

  // Sync to localStorage for backward compatibility
  // This useEffect is now removed since we're using MongoDB exclusively

  const refreshQuestions = useCallback(async () => {
    try {
      const apiQuestions = await loadFromDb();
      setQuestions(apiQuestions);
    } catch (error) {
      console.error('Failed to refresh questions:', error);
    }
  }, []);

  const addBlank = useCallback(async (): Promise<Question> => {
    const now = new Date().toISOString()
    const q: Question = {
      id: newQuestionId(),
      text: "New Question", // Default text to pass validation
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
    
    try {
      // Create in database
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(q),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create question: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success && data.question) {
        // Use the question returned from the database
        setQuestions((prev) => [data.question, ...prev]);
        return data.question;
      } else {
        // Fallback to the locally created question if API doesn't return one
        setQuestions((prev) => [q, ...prev]);
        return q;
      }
    } catch (err) {
      console.error('Failed to create question in DB:', err);
      // Still update the UI optimistically
      setQuestions((prev) => [q, ...prev]);
      return q;
    }
  }, [questions])

  const duplicate = useCallback(
    async (id: string): Promise<Question | undefined> => {
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
      
      try {
        // Create in database
        const response = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(copy),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to duplicate question: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.success && data.question) {
          // Use the question returned from the database
          setQuestions((prev) => [data.question, ...prev]);
          return data.question;
        } else {
          // Fallback to the locally created question if API doesn't return one
          setQuestions((prev) => [copy, ...prev]);
          return copy;
        }
      } catch (err) {
        console.error('Failed to duplicate question in DB:', err);
        // Still update the UI optimistically
        setQuestions((prev) => [copy, ...prev]);
        return copy;
      }
    },
    [questions],
  )

  const update = useCallback(async (id: string, patch: Partial<Question>) => {
    // Update optimistically in UI first
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch, updatedAt: new Date().toISOString() } : q)))
    
    try {
      // Update in database
      const response = await fetch(`/api/questions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update question: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success && data.question) {
        // Update with the data from the server if it was returned
        setQuestions((prev) => prev.map((q) => (q.id === id ? data.question : q)));
      }
    } catch (err) {
      console.error(`Failed to update question ${id} in DB:`, err);
      // The optimistic update is already applied, so no need to revert unless there's
      // a specific error handling requirement
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    // Remove optimistically from UI first
    setQuestions((prev) => prev.filter((q) => q.id !== id))
    
    try {
      // Delete from database
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete question: ${response.statusText}`);
        // Could potentially restore the question in the UI here if needed
      }
    } catch (err) {
      console.error(`Failed to delete question ${id} from DB:`, err);
      // The optimistic delete is already applied, could revert here if needed
    }
  }, [])

  const bulkUpdate = useCallback(async (ids: string[], patch: Partial<Question>) => {
    // Update optimistically in UI first
    setQuestions((prev) =>
      prev.map((q) => (ids.includes(q.id) ? { ...q, ...patch, updatedAt: new Date().toISOString() } : q)),
    )
    
    try {
      // Bulk update in database
      const response = await fetch('/api/questions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, patch }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to bulk update questions: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Failed to bulk update questions in DB:', err);
      // The optimistic update is already applied, could revert here if needed
    }
  }, [])

  const reorderQuestions = useCallback(async (newOrderIds: string[]) => {
    // Update optimistically in UI first
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
    
    try {
      // Update order in database
      const orderMap = newOrderIds.map((id, index) => ({ id, order: index + 1 }));
      const response = await fetch('/api/questions/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderMap }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reorder questions: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Failed to reorder questions in DB:', err);
      // The optimistic update is already applied, could revert here if needed
    }
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
