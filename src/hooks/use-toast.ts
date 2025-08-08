"use client"

import { useState, useCallback } from "react"

export type ToastType = "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  title?: string
  description?: string
  type?: ToastType
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (toast: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

let toastCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((newToast: Omit<Toast, "id">) => {
    const id = `toast-${++toastCounter}`
    const toastWithId = { id, ...newToast }
    
    setToasts(prev => [...prev, toastWithId])
    
    // Auto dismiss after duration (default 5 seconds)
    const duration = newToast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }

    // For now, just log to console since we don't have a UI toast component
    console.log(`Toast: ${newToast.title || 'Notification'}${newToast.description ? ` - ${newToast.description}` : ''}`)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toast, toasts, dismiss }
}
