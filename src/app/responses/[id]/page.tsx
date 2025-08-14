"use client"

import { QuestionsProvider, useQuestions } from "@/lib/questions"

import { ResponseDetailContent } from "@/components/responses/response-content"


export default function ResponseDetailsPage() {
  return (
    <QuestionsProvider>
      <ResponseDetailContent />
    </QuestionsProvider>
  );
}


