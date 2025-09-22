import React from 'react'

interface PatouButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'protect' | 'share' | 'awaken'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  loading?: boolean
  animation?: 'fadeIn' | 'slideUp' | 'scaleIn'
  animationDelay?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
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
  icon,
  iconPosition = 'left',
  ...props 
}: PatouButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg focus:ring-primary/50',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:-translate-y-0.5 focus:ring-gray-500/50',
    outline: 'bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white focus:ring-primary/50',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500/50',
    protect: 'bg-protect text-white hover:bg-protect/90 hover:-translate-y-0.5 hover:shadow-lg focus:ring-protect/50',
    share: 'bg-share text-white hover:bg-share/90 hover:-translate-y-0.5 hover:shadow-lg focus:ring-share/50',
    awaken: 'bg-awaken text-gray-900 hover:bg-awaken/90 hover:-translate-y-0.5 hover:shadow-lg focus:ring-awaken/50'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-3'
  }

  const animationClasses = {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    scaleIn: 'animate-scale-in'
  }

  const animationClass = animation ? animationClasses[animation] : ''
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${animationClass} ${className}`
  
  const style = animationDelay !== '0ms' ? { animationDelay } : undefined

  return (
    <button 
      className={classes}
      style={style}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="transition-transform duration-300 group-hover:scale-110">
          {icon}
        </span>
      )}
      
      <span>{children}</span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          {icon}
        </span>
      )}
    </button>
  )
}

// Predefined button patterns
export const ButtonPatterns = {
  // CTA Button with arrow
  CTA: ({ children, ...props }: Omit<PatouButtonProps, 'icon' | 'iconPosition'>) => (
    <PatouButton 
      variant="primary" 
      size="lg"
      icon={<span>→</span>}
      iconPosition="right"
      className="group"
      {...props}
    >
      {children}
    </PatouButton>
  ),

  // Action button with icon
  Action: ({ icon, children, ...props }: PatouButtonProps) => (
    <PatouButton 
      icon={icon}
      iconPosition="left"
      {...props}
    >
      {children}
    </PatouButton>
  ),

  // Icon only button
  IconOnly: ({ icon, title, ...props }: PatouButtonProps & { title: string }) => (
    <PatouButton 
      className="!p-2 rounded-full"
      title={title}
      {...props}
    >
      {icon}
    </PatouButton>
  )
}