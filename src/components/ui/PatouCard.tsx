import React from 'react'
import { generateInteractionStyles, getComponentGuidelines, generateAnimationStyles } from '../../utils/interactions'

interface PatouCardProps {
  children: React.ReactNode
  variant?: 'default' | 'feature' | 'interactive'
  className?: string
  onClick?: () => void
  animation?: 'fadeIn' | 'slideUp' | 'scaleIn'
  animationDelay?: string
}

export default function PatouCard({ 
  children, 
  variant = 'default', 
  className = '', 
  onClick,
  animation,
  animationDelay = '0ms'
}: PatouCardProps) {
  const interactionStyles = generateInteractionStyles('card')
  const componentGuidelines = getComponentGuidelines('card', variant)
  const animationStyles = animation ? generateAnimationStyles(animation, animationDelay) : {}
  
  const baseClasses = 'patou-card'
  const variantClasses = {
    default: '',
    feature: 'patou-card-feature',
    interactive: 'cursor-pointer'
  }
  const animationClass = animation ? `patou-animate-${animation}` : ''
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${animationClass} ${className}`
  const combinedStyles = { ...componentGuidelines, ...interactionStyles, ...animationStyles }
  
  if (onClick) {
    return (
      <div 
        className={`${classes} cursor-pointer`}
        data-component="card"
        style={combinedStyles}
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
    <div className={classes} style={combinedStyles} data-component="card">
      {children}
    </div>
  )
}