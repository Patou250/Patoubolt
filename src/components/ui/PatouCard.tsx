import React from 'react'
import { generateInteractionStyles, getComponentGuidelines } from '../../utils/interactions'

interface PatouCardProps {
  children: React.ReactNode
  variant?: 'default' | 'feature' | 'interactive'
  className?: string
  onClick?: () => void
}

export default function PatouCard({ 
  children, 
  variant = 'default', 
  className = '', 
  onClick 
}: PatouCardProps) {
  const interactionStyles = generateInteractionStyles('card')
  const componentGuidelines = getComponentGuidelines('card', variant)
  const baseClasses = 'patou-card'
  const variantClasses = {
    default: '',
    feature: 'patou-card-feature',
    interactive: 'cursor-pointer'
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`
  
  if (onClick) {
    return (
      <div 
        className={`${classes} cursor-pointer`} 
        style={{ ...componentGuidelines, ...interactionStyles }}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        }}
      >
        {children}
      </div>
    )
  }
  
  return (
    <div className={classes} style={{ ...componentGuidelines, ...interactionStyles }}>
      {children}
    </div>
  )
}