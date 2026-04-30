import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, ...props }, ref) => {
    const baseStyles = 'font-semibold rounded-lg transition-all duration-200 will-animate font-sans cursor-pointer'

    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-primary/30',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 active:scale-95 shadow-md hover:shadow-lg hover:shadow-secondary/30',
      outline: 'border-2 border-primary text-primary hover:bg-primary/10 active:scale-95',
      ghost: 'text-foreground hover:bg-muted active:scale-95',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
