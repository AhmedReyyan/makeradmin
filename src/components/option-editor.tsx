"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus } from "lucide-react"

export function OptionEditor({
  options,
  onChange,
  typeLabel = "Option",
}: {
  options: string[]
  onChange: (next: string[]) => void
  typeLabel?: string
}) {
  const [local, setLocal] = useState(options.length ? options : ["Option 1", "Option 2"])

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

  return (
    <div className="grid gap-2">
      <Label>Options</Label>
      <div className="rounded-md border divide-y">
        {local.map((opt, i) => (
          <div key={i} className="flex items-center gap-2 p-2">
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
      <p className="text-xs text-muted-foreground">Use for Single Select (radios) and Multi Select (checkboxes).</p>
    </div>
  )
}
