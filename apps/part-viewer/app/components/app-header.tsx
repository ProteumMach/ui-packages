import type { ReactNode } from 'react'
import { classNames } from '../shared/class-names'

export const AppHeader = ({
  children,
  actions,
  className = '',
}: {
  children: ReactNode
  actions?: ReactNode
  className?: string
}) => (
  <header className={classNames('flex flex-wrap items-center justify-between gap-3', className)}>
    <div>{children}</div>
    {actions ? <div className="shrink-0">{actions}</div> : null}
  </header>
)
