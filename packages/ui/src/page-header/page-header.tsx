import type { ReactNode } from 'react'

export interface PageHeaderProps {
  title: string
  children?: ReactNode
}

/** The standard heading row for a Toolpath application page. */
export const PageHeader = ({ title, children }: PageHeaderProps) => (
  <div className="mb-4 flex items-center justify-between">
    <h1 className="text-base font-bold text-gray-900 dark:text-white">{title}</h1>
    {children}
  </div>
)
