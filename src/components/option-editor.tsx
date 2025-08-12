"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GripVertical, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function OptionEditor({
  options,
  onChange,
  typeLabel = "Option",
}: {
  options: string[]
  onChange: (next: string[]) => void
  typeLabel?: string
}) {
  const [local, setLocal] = useState<string[]>(options.length ? options : ["Option 1", "Option 2"])
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const sync = (next: string[]) => {
    setLocal(next)
    onChange(next)
  }

  const edit = (i: number, v: string) => {
    const next = [...local]
    next[i] = v
    sync(next)
  }

  const add = () => {
    const next = [...local, `${typeLabel} ${local.length + 1}`]
    sync(next)
  }

  const remove = (i: number) => {
    const next = local.filter((_, idx) => idx !== i)
    sync(next.length ? next : ["Option 1"])
  }

  const onDragStart = (i: number) => setDragIndex(i)
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault()
  const onDrop = (i: number) => {
    if (dragIndex === null || dragIndex === i) return
    const next = [...local]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(i, 0, moved)
    setDragIndex(null)
    sync(next)
  }

  return (
    <div className="grid gap-2">
      <Label>Options</Label>
      <div className="rounded-md border divide-y">
        {local.map((opt, i) => (
          <div
            key={i}
            className={cn("flex items-center gap-2 p-2", dragIndex === i && "bg-muted/50")}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(i)}
          >
            <GripVertical className="size-4 text-muted-foreground" />
            <div className="text-xs w-12 text-muted-foreground">#{i + 1}</div>
            <Input
              value={opt}
              onChange={(e) => edit(i, e.target.value)}
              className="flex-1"
              placeholder={`${typeLabel} ${i + 1}`}
            />
            <Button type="button" size="icon" variant="ghost" onClick={() => remove(i)} aria-label="Remove option">
              <Trash2 className="size-4 text-rose-600" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={add} className="w-fit bg-transparent">
        <Plus className="mr-2 size-4" />
        Add {typeLabel}
      </Button>
      <p className="text-xs text-muted-foreground">Drag the handle to reorder. Use for Single/Multi Select.</p>
    </div>
  )
}
