import React, { memo, useCallback, useState } from 'react'
import { Combobox as BaseCombobox, ComboboxRootProps } from '@base-ui/react'
import { ComboboxProvider } from './combobox-context'

export type ComboboxProps<T> = ComboboxRootProps<T> & {
  size?: 'xl' | 'lg' | 'md' | 'sm'
  variant?: 'default' | 'secondary' | 'muted' | 'ghost'
  invalid?: boolean
}

// Use a type assertion for the generic memo
export const Combobox = memo(
  <T,>({
    children,
    size = 'md',
    variant = 'default',
    invalid = false,
    onOpenChange,
    ...props
  }: ComboboxProps<T>) => {
    if (!props.items) {
      throw new Error('Combobox requires an `items` prop.')
    }

    const [inputValue, setInputValue] = useState('')

    const handleOpenChange = useCallback<NonNullable<typeof onOpenChange>>(
      (open, eventDetails) => {
        if (open) {
          // Clear input value when combobox opens
          setInputValue('')
        }
        onOpenChange?.(open, eventDetails)
      },
      [onOpenChange],
    )

    return (
      <ComboboxProvider
        disabled={Boolean(props.disabled)}
        size={size}
        variant={variant}
        invalid={invalid}
        itemToStringLabel={props.itemToStringLabel}
      >
        <BaseCombobox.Root
          data-variant={variant}
          data-size={size}
          data-invalid={invalid || undefined}
          inputValue={inputValue}
          onInputValueChange={setInputValue}
          onOpenChange={handleOpenChange}
          {...props}
        >
          {children}
        </BaseCombobox.Root>
      </ComboboxProvider>
    )
  },
) as <T>(props: ComboboxProps<T>) => React.ReactElement
