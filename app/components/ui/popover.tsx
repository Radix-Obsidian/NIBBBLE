'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

const Popover = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </PopoverContext.Provider>
  )
}

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, ref) => {
  const context = React.useContext(PopoverContext)
  if (!context) {
    throw new Error('PopoverTrigger must be used within a Popover')
  }

  const { open, setOpen } = context

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      ref,
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e)
        setOpen(!open)
      },
    })
  }

  return (
    <button
      ref={ref}
      className={className}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </button>
  )
})

PopoverTrigger.displayName = 'PopoverTrigger'

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end'
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = 'center', children, ...props }, ref) => {
    const context = React.useContext(PopoverContext)
    if (!context) {
      throw new Error('PopoverContent must be used within a Popover')
    }

    const { open, setOpen } = context

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref && 'current' in ref && ref.current && !ref.current.contains(event.target as Node)) {
          setOpen(false)
        }
      }

      if (open) {
        document.addEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [open, setOpen, ref])

    if (!open) return null

    return (
      <div
        ref={ref}
        className={cn(
          'absolute z-50 mt-2 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
          align === 'end' && 'right-0',
          align === 'start' && 'left-0',
          align === 'center' && 'left-1/2 -translate-x-1/2',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

PopoverContent.displayName = 'PopoverContent'

export { Popover, PopoverTrigger, PopoverContent }