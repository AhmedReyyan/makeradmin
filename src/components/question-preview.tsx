"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, Info, Calendar } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useQuestions } from "@/lib/questions"

export function QuestionPreview({
  question,
  currentPath = "New Business",
  standaloneMode = false,
}: {
  question: {
    text: string
    type: "text" | "single_select" | "multi_select" | "date"
    helpText?: string
    required: boolean
    options?: string[]
  }
  currentPath?: "New Business" | "Existing Business" | "Growth Stage"
  standaloneMode?: boolean
}) {
  // Use actual questions from context when in standalone mode
  const { questions } = standaloneMode ? useQuestions() : { questions: [] }
  const filteredQuestions = standaloneMode 
    ? questions.filter(q => q.paths.includes(currentPath) && q.status === "active")
    : []
    
  const totalQuestions = standaloneMode ? filteredQuestions.length : 5
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [validationError, setValidationError] = useState("")
  
  // Current question to display (either from filtered list or the prop)
  const currentQuestion = standaloneMode && filteredQuestions.length > 0
    ? filteredQuestions[currentQuestionIndex]
    : question
  
  
  // State for responses
  const [inputValue, setInputValue] = useState("")
  const [dateValue, setDateValue] = useState("")
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  
  // Reset form values when question changes
  useEffect(() => {
    setInputValue("")
    setSelectedOption("")
    setSelectedOptions([])
    setDateValue("")
    setValidationError("")
  }, [currentQuestionIndex, currentQuestion])
  
  // Check if current response is valid
  const isCurrentResponseValid = () => {
    if (!currentQuestion.required) return true
    
    switch(currentQuestion.type) {
      case "text":
        return !!inputValue.trim()
      case "single_select":
        return !!selectedOption
      case "multi_select":
        return selectedOptions.length > 0
      case "date":
        return !!dateValue
      default:
        return true
    }
  }
  
  // Handle next button click with validation
  const handleNext = () => {
    // Validate response if required
    if (!isCurrentResponseValid()) {
      setValidationError("This question requires an answer")
      return
    }
    
    // Save response
    if (standaloneMode && filteredQuestions.length > 0) {
      const questionId = filteredQuestions[currentQuestionIndex].id
      const response = currentQuestion.type === "text" ? inputValue :
                      currentQuestion.type === "single_select" ? selectedOption :
                      currentQuestion.type === "multi_select" ? selectedOptions :
                      dateValue
      
      setResponses(prev => ({
        ...prev,
        [questionId]: response
      }))
    }
    
    // Move to next question
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }
  
  // Handle previous button click
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }
  
  // Toggle option for multi-select
  const toggleOption = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option) 
        : [...prev, option]
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </CardTitle>
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {currentPath} Path
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2 text-[15px] font-medium">
          {currentQuestion.text || "What is your primary business idea or concept?"}
          {currentQuestion.required ? " *" : ""}
        </div>
        
        {/* Validation error message */}
        {validationError && (
          <div className="mb-2 flex items-center text-sm text-red-500">
            <AlertCircle className="mr-2 h-4 w-4" />
            {validationError}
          </div>
        )}
        
        {/* Different input types based on question type */}
        {currentQuestion.type === "text" && (
          <div className="rounded-md border bg-background p-0">
            <textarea
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                if (validationError) setValidationError("")
              }}
              placeholder="Describe your business idea in detail..."
              className="h-28 w-full resize-none rounded-md bg-transparent p-3 outline-none"
            />
          </div>
        )}
        
        {currentQuestion.type === "single_select" && currentQuestion.options && currentQuestion.options.length > 0 && (
          <div className="rounded-md border bg-background p-3 space-y-2">
            <RadioGroup 
              value={selectedOption} 
              onValueChange={(value) => {
                setSelectedOption(value)
                if (validationError) setValidationError("")
              }}
            >
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
        
        {currentQuestion.type === "multi_select" && currentQuestion.options && currentQuestion.options.length > 0 && (
          <div className="rounded-md border bg-background p-3 space-y-2">
            {currentQuestion.options.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Checkbox 
                  id={`option-multi-${idx}`} 
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={() => {
                    toggleOption(option)
                    if (validationError) setValidationError("")
                  }}
                />
                <Label htmlFor={`option-multi-${idx}`}>{option}</Label>
              </div>
            ))}
          </div>
        )}
        
        {currentQuestion.type === "date" && (
          <div className="rounded-md border bg-background p-3">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 opacity-70" />
              <input
                type="date"
                value={dateValue}
                onChange={(e) => {
                  setDateValue(e.target.value)
                  if (validationError) setValidationError("")
                }}
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>
        )}
        
        <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4" />
          <span>
            {currentQuestion.helpText ||
              "This helps us understand your business foundation and tailor recommendations."}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1" aria-label="Progress indicators">
            {Array.from({ length: totalQuestions }).map((_, idx) => (
              <span 
                key={idx}
                className={`size-1.5 rounded-full ${
                  idx === currentQuestionIndex 
                    ? "bg-muted-foreground/90" 
                    : idx < currentQuestionIndex && responses[standaloneMode ? filteredQuestions[idx]?.id : '']
                      ? "bg-muted-foreground/70"
                      : "bg-muted-foreground/40"
                }`} 
              />
            ))}
          </div>
          <Button 
            size="sm"
            onClick={handleNext}
            disabled={currentQuestionIndex === totalQuestions - 1}
          >
            {currentQuestionIndex === totalQuestions - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
