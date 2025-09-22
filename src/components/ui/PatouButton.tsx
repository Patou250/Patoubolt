import React from 'react'
import { generateInteractionStyles, getComponentGuidelines, generateAnimationStyles, ButtonVariant } from '../../utils/interactions'

interface PatouButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  loading?: boolean
  animation?: 'fadeIn' | 'slideUp' | 'scaleIn'
  animationDelay?: string
}

export default function PatouButton({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  loading = false,
  disabled,
  className = '',
  animation,
  animationDelay = '0ms',
  ...props 
}: PatouButtonProps) {
  const interactionStyles = generateInteractionStyles('button', variant as ButtonVariant)
  const componentGuidelines = getComponentGuidelines('button', variant)
  const animationStyles = animation ? generateAnimationStyles(animation, animationDelay) : {}
  
  const baseClasses = 'btn'
  const variantClasses = {
    primary: 'btn--primary',
    secondary: 'btn--secondary', 
    outline: 'btn--outline',
    ghost: 'btn--ghost'
  }
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: '',
    lg: 'btn--large'
  }
  const animationClass = animation ? `patou-animate-${animation}` : ''
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${animationClass} ${className}`
  const combinedStyles = { ...componentGuidelines, ...interactionStyles, ...animationStyles }
  
  return (
    <button 
      className={classes}
      style={combinedStyles}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
      )}
      {children}
    </button>
  )
}