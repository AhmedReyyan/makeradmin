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

export type UserResponse = {
  questionId: string
  answer: string
  _id?: string
}

export type ResponseSession = {
  id: string
  sessionId: string
  responses: UserResponse[]
  completed: boolean
  userInfo: {
    ip?: string
    userAgent?: string
  }
  businessPath: string
  createdAt: string
  updatedAt: string
}

export type ResponseStats = {
  totalResponses: number
  completedResponses: number
  incompleteResponses: number
  recentResponses: number
  pathBreakdown: Array<{ path: string; count: number }>
}

type ResponsesContextValue = {
  responses: ResponseSession[]
  stats: ResponseStats | null
  loading: boolean
  error: string | null
  fetchResponses(filters?: { page?: number; limit?: number; path?: string; completed?: string }): Promise<void>
  fetchStats(): Promise<void>
  getById(id: string): Promise<ResponseSession | null>
  remove(id: string): Promise<void>
  refetch(): Promise<[void , void]>
}

const ResponsesContext = createContext<ResponsesContextValue | null>(null)

export function ResponsesProvider({ children }: { children: ReactNode }) {
  const [responses, setResponses] = useState<ResponseSession[]>([])
  const [stats, setStats] = useState<ResponseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResponses = useCallback(
    async (filters: { page?: number; limit?: number; path?: string; completed?: string } = {}) => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (filters.page) params.set("page", filters.page.toString())
        if (filters.limit) params.set("limit", filters.limit.toString())
        if (filters.path) params.set("path", filters.path)
        if (filters.completed) params.set("completed", filters.completed)

        const response = await fetch(`/api/responses?${params}`)
        if (!response.ok) throw new Error("Failed to fetch responses")

        const data = await response.json()
        setResponses(data.responses)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch responses")
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/responses/stats")
      if (!response.ok) throw new Error("Failed to fetch stats")
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    }
  }, [])

  const getById = useCallback(async (id: string): Promise<ResponseSession | null> => {
    try {
      const response = await fetch(`/api/responses/${id}`)
      if (!response.ok) return null
      return await response.json()
    } catch (err) {
      console.error("Failed to fetch response:", err)
      return null
    }
  }, [])

  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/responses/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete response")
      setResponses((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to delete response")
    }
  }, [])

  const refetch = useCallback(() => {
    return Promise.all([fetchResponses(), fetchStats()])
  }, [fetchResponses, fetchStats])

  useEffect(() => {
    refetch()
  }, [refetch])

  const value = useMemo<ResponsesContextValue>(
    () => ({
      responses,
      stats,
      loading,
      error,
      fetchResponses,
      fetchStats,
      getById,
      remove,
      refetch,
    }),
    [responses, stats, loading, error, fetchResponses, fetchStats, getById, remove, refetch],
  )

  return createElement(ResponsesContext.Provider, { value }, children as any)
}

export function useResponses() {
  const ctx = useContext(ResponsesContext)
  if (!ctx) throw new Error("useResponses must be used within <ResponsesProvider>")
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
