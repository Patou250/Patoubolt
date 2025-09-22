import React from 'react'

interface PatouButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  loading?: boolean
}

export default function PatouButton({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  loading = false,
  disabled,
  className = '',
  ...props 
}: PatouButtonProps) {
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
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
  
  return (
    <button 
      className={classes}
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