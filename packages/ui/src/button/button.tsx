import React, { Dispatch, HTMLAttributes, MouseEvent, ReactNode, Ref } from 'react'
import { cn } from '../helpers'
import { Link } from '../link'
import { AnimatedEllipsis } from './animated-ellipsis'

export type ButtonProps = HTMLAttributes<HTMLButtonElement | HTMLAnchorElement> & {
  children: ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'info' | 'muted' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  shape?: 'default' | 'pill'
  disabled?: boolean
  isLoading?: boolean
  onClick?: Dispatch<MouseEvent>
  type?: 'button' | 'submit' | 'reset'
  className?: string
  asLink?: boolean
  href?: string
  form?: string
  target?: string
  full?: boolean
  ref?: Ref<HTMLButtonElement | HTMLAnchorElement>
}

export const Button = ({
  variant = 'default',
  size = 'md',
  shape = 'default',
  type = 'button',
  className,
  isLoading = false,
  children,
  onClick,
  asLink = false,
  href,
  form,
  full = false,
  disabled,
  ref,
  ...props
}: ButtonProps) => {
  const isMuted = variant === 'muted' && !disabled
  const isPrimary = variant === 'primary' && !disabled
  const isSuccess = variant === 'success' && !disabled
  const isSecondary = variant === 'secondary' && !disabled
  const isInfo = variant === 'info' && !disabled
  const isDanger = variant === 'danger' && !disabled
  const isColoredVariant =
    variant === 'primary' || variant === 'success' || variant === 'info' || variant === 'danger'

  const isPill = shape === 'pill'

  const buttonClasses = cn(
    'flex flex-col items-center group rounded outline-none font-semibold',
    'cursor-pointer select-none transition duration-200 ease-in-out',
    'focus-visible:ring-2 focus-visible:ring-info/75',
    'text-gray dark:text-zinc-50 focus-visible:bg-gray-100 dark:focus-visible:bg-zinc-800',
    {
      'text-white focus-visible:bg-success': isSuccess,
      'text-white focus-visible:bg-primary': isPrimary,
      'text-white focus-visible:bg-info': isInfo,
      'focus-visible:bg-gray-50': isMuted,
      'text-white focus-visible:bg-danger': isDanger,
      'text-gray-400 dark:text-zinc-200 focus-visible:bg-white dark:focus-visible:bg-zinc-800 focus-visible:rounded-md':
        isSecondary,
      'text-gray-300 dark:text-zinc-400 cursor-not-allowed': disabled && !isColoredVariant,
      'text-white/90 dark:text-zinc-100 cursor-not-allowed': disabled && isColoredVariant,
      'text-gray-200 dark:text-zinc-500': variant === 'muted' && disabled,
      'block text-center': asLink,
      'rounded-lg': size === 'lg' && !isPill,
      'rounded-full focus-visible:rounded-full': isPill,
      'w-full': full,
    },
  )

  const clickHandler = (event: React.MouseEvent): void => {
    if (typeof onClick === 'function') {
      if (!asLink) {
        event.preventDefault()
      }

      onClick(event)
    }
  }

  const contentClassName = cn(
    'whitespace-nowrap rounded px-3 py-1 font-body text-xs font-semibold tracking-normal',
    'bg-gray-100 group-hover:bg-gray-200/75 dark:bg-zinc-800 dark:group-hover:bg-zinc-900',
    'transition duration-200 ease-in-out',
    {
      'bg-primary group-hover:bg-primary-darken group-active:bg-primary-darken dark:bg-primary dark:group-hover:bg-primary-darken dark:group-active:bg-primary-darken':
        isPrimary,
      'bg-success group-hover:bg-success-darken group-active:bg-success-darken dark:bg-success dark:group-hover:bg-success-darken dark:group-active:bg-success-darken':
        isSuccess,
      'bg-info group-hover:bg-info group-active:bg-info dark:bg-info dark:group-hover:bg-info dark:group-active:bg-info':
        isInfo,
      'bg-gray-50 group-hover:bg-gray-100 group-active:bg-gray-100 dark:bg-zinc-800 dark:group-hover:bg-zinc-900 dark:group-active:bg-zinc-900':
        isMuted,
      'bg-danger group-hover:bg-danger-darken group-active:bg-danger-darken dark:bg-danger dark:group-hover:bg-danger-darken dark:group-active:bg-danger-darken':
        isDanger,
      'border border-gray-100 bg-white dark:bg-zinc-900 dark:border-zinc-800 group-hover:bg-gray-50 dark:group-hover:bg-zinc-800 group-active:bg-gray-50 dark:group-active:bg-zinc-800 dark:group-hover:border-zinc-800':
        isSecondary,
      'bg-primary/50 dark:bg-primary/45': disabled && variant === 'primary',
      'bg-success/50 dark:bg-success/45': disabled && variant === 'success',
      'bg-info/50 dark:bg-info/45': disabled && variant === 'info',
      'bg-danger/50 dark:bg-danger/45': disabled && variant === 'danger',
      'dark:bg-zinc-900 group-hover:bg-gray-100 dark:group-hover:bg-zinc-900 dark:group-active:bg-zinc-900':
        disabled && !isColoredVariant,
      'group-active:scale-95': !disabled,
      'px-1.5 py-px text-2xs': size === 'sm',
      'px-4 py-2 text-base': size === 'lg',
      'rounded-lg': size === 'lg' && !isPill,
      'rounded-full': isPill,
      'px-8': isPill && size === 'lg',
      'w-full': full,
    },
    className,
  )

  const content = (
    <div className={contentClassName}>
      {!isLoading ? (
        children
      ) : (
        <AnimatedEllipsis
          className={cn({
            'h-2 w-1': size === 'sm',
            'h-2 w-1.5': size === 'md',
            'h-3 w-2': size === 'lg',
          })}
        />
      )}
    </div>
  )

  if (asLink) {
    return (
      <Link
        ref={ref as Ref<HTMLAnchorElement>}
        href={disabled ? '#' : href}
        aria-disabled={disabled}
        onClick={clickHandler}
        className={cn('text-inherit no-underline hover:no-underline', buttonClasses)}
        {...props}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      aria-label={isLoading ? 'Loading...' : ''}
      type={type}
      form={type === 'submit' ? form : undefined}
      onClick={clickHandler}
      className={buttonClasses}
      {...props}
      disabled={disabled}
    >
      {content}
    </button>
  )
}
