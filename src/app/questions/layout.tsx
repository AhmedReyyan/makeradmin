"use client"

import { QuestionsProvider } from "@/lib/questions"

export default function QuestionsLayout({ children }: { children: React.ReactNode }) {
  // Provide the questions store to all nested routes under /questions
  return <QuestionsProvider>{children}</QuestionsProvider>
}
