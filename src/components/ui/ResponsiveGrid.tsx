import React from 'react'

interface ResponsiveGridProps {
  children: React.ReactNode
  columns?: {
    desktop?: number
    tablet?: number
    mobile?: number
  }
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ResponsiveGrid({ 
  children, 
  columns = { desktop: 3, tablet: 2, mobile: 1 },
  gap = 'md',
  className = ''
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6', 
    lg: 'gap-8'
  }

  const getGridClasses = () => {
    const { desktop = 3, tablet = 2, mobile = 1 } = columns
    
    let classes = 'grid '
    
    // Mobile first
    classes += `grid-cols-${mobile} `
    
    // Tablet
    if (tablet !== mobile) {
      classes += `md:grid-cols-${tablet} `
    }
    
    // Desktop
    if (desktop !== tablet) {
      classes += `lg:grid-cols-${desktop} `
    }
    
    return classes
  }

  return (
    <div className={`${getGridClasses()} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  )
}

// Predefined grid patterns from WeWeb
export const GridPatterns = {
  // Feature cards
  Features: ({ children }: { children: React.ReactNode }) => (
    <ResponsiveGrid columns={{ desktop: 3, tablet: 2, mobile: 1 }} gap="lg">
      {children}
    </ResponsiveGrid>
  ),
  
  // Children management
  Children: ({ children }: { children: React.ReactNode }) => (
    <ResponsiveGrid columns={{ desktop: 3, tablet: 2, mobile: 1 }} gap="md">
      {children}
    </ResponsiveGrid>
  ),
  
  // Settings cards
  Settings: ({ children }: { children: React.ReactNode }) => (
    <ResponsiveGrid columns={{ desktop: 2, tablet: 2, mobile: 1 }} gap="md">
      {children}
    </ResponsiveGrid>
  ),
  
  // Dashboard stats
  Stats: ({ children }: { children: React.ReactNode }) => (
    <ResponsiveGrid columns={{ desktop: 4, tablet: 2, mobile: 2 }} gap="sm">
      {children}
    </ResponsiveGrid>
  )
}