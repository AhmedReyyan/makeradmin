import { type ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type PageShellProps = {
  title: string
  subtitle?: string
  right?: ReactNode
  beforeTitle?: ReactNode // NEW: left of the title (e.g., back button)
  titleExtras?: ReactNode  // NEW: to the right of the title (e.g., ID pill)
  children: ReactNode
}

export function PageShell({ title, subtitle, right, beforeTitle, titleExtras, children }: PageShellProps) {
  return (
    <div className="min-h-dvh bg-muted/50">
      <main className="mx-auto max-w-[1200px] px-4 md:px-6 py-4 md:py-6">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {beforeTitle ? <div className="shrink-0">{beforeTitle}</div> : null}
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h1>
              {titleExtras ? <div className="shrink-0">{titleExtras}</div> : null}
            </div>
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-3">
            {right}
            <Avatar className="size-8 border">
              <AvatarImage src="/admin-avatar.png" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
