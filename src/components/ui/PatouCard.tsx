import React from 'react'

interface PatouCardProps {
  children: React.ReactNode
  variant?: 'default' | 'feature' | 'interactive' | 'bento'
  className?: string
  onClick?: () => void
  animation?: 'fadeIn' | 'slideUp' | 'scaleIn' | 'float' | 'bounceGentle' | 'pulseGlow'
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
  const baseClasses = 'transition-all duration-300'
  
  const variantClasses = {
    default: 'bg-white rounded-xl p-6 shadow-card border border-gray-100',
    feature: 'bg-white rounded-xl p-6 shadow-card border border-gray-100 hover:shadow-interactive hover:border-primary/30 hover:-translate-y-1',
    interactive: 'bg-white rounded-xl p-6 shadow-card border border-gray-100 cursor-pointer hover:shadow-interactive hover:-translate-y-2 hover:scale-[1.02]',
    bento: 'bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-bento border border-gray-200/50'
  }
  
  const animationClasses = {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    scaleIn: 'animate-scale-in',
    float: 'animate-float',
    bounceGentle: 'animate-bounce-gentle',
    pulseGlow: 'animate-pulse-glow'
  }

  const animationClass = animation ? animationClasses[animation] : ''
  const classes = `${baseClasses} ${variantClasses[variant]} ${animationClass} ${className}`
  
  const style = animationDelay !== '0ms' ? { animationDelay } : undefined

  if (onClick) {
    return (
      <div 
        className={classes}
        style={style}
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
    <div className={classes} style={style}>
      {children}
    </div>
  )
}

// Predefined card patterns
export const CardPatterns = {
  // Feature showcase card
  Feature: ({ icon, title, description, action, children }: {
    icon: React.ReactNode
    title: string
    description: string
    action?: React.ReactNode
    children?: React.ReactNode
  }) => (
    <PatouCard variant="feature" className="text-center group">
      <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
      {action}
      {children}
    </PatouCard>
  ),

  // Child profile card
  Child: ({ emoji, name, stats, actions }: {
    emoji: string
    name: string
    stats: string
    actions: React.ReactNode
  }) => (
    <PatouCard variant="interactive" className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-3xl">{emoji}</div>
        <div>
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">{stats}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions}
      </div>
    </PatouCard>
  ),

  // Playlist card
  Playlist: ({ cover, title, trackCount, onClick }: {
    cover: string
    title: string
    trackCount: number
    onClick?: () => void
  }) => (
    <PatouCard variant="interactive" onClick={onClick} className="overflow-hidden">
      <img 
        src={cover} 
        alt={title}
        className="w-full h-32 object-cover rounded-lg mb-4"
      />
      <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
      <p className="text-sm text-gray-600">
        {trackCount} titre{trackCount > 1 ? 's' : ''}
      </p>
    </PatouCard>
  ),

  // Stats card
  Stats: ({ icon, label, value, trend }: {
    icon: React.ReactNode
    label: string
    value: string | number
    trend?: 'up' | 'down' | 'neutral'
  }) => (
    <PatouCard className="text-center">
      <div className="flex items-center justify-center mb-3">
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
      {trend && (
        <div className={`text-xs mt-2 ${
          trend === 'up' ? 'text-green-600' : 
          trend === 'down' ? 'text-red-600' : 
          'text-gray-500'
        }`}>
          {trend === 'up' ? '↗️ En hausse' : 
           trend === 'down' ? '↘️ En baisse' : 
           '→ Stable'}
        </div>
      )}
    </PatouCard>
  )
}