"use client"

import type React from "react"

import { ResponsesProvider } from "@/lib/responses"

export default function ResponsesLayout({ children }: { children: React.ReactNode }) {
  return <ResponsesProvider>{children}</ResponsesProvider>
}
