import type { ReactNode } from 'react'

export interface FieldProps {
  title: string
  description?: string
  content?: ReactNode
  children?: ReactNode
}

/** A labelled settings row with an optional right-aligned control. */
export const Field = ({ title, description, content, children }: FieldProps) => (
  <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5 last:border-0 dark:border-zinc-800">
    <div className="flex-1">
      <div className="font-semibold text-gray-900 dark:text-white">{title}</div>
      {description ? (
        <div className="mt-1 text-sm text-gray-400 dark:text-zinc-400">{description}</div>
      ) : null}
      {content}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
)
