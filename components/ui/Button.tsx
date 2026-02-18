import React from 'react'
import { cn } from '../../lib/utils'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false,
    className,
    children,
    ...props 
  }, ref) => {
    
    const baseClasses = 'btn'
    const variantClass = `btn--${variant}`
    const sizeClass = `btn--${size}`
    const fullWidthClass = fullWidth ? 'btn--full-width' : ''

    const combinedClasses = cn(
      baseClasses,
      variantClass,
      sizeClass,
      fullWidthClass,
      className
    )

    return (
      <button
        ref={ref}
        className={combinedClasses}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button