// WeWeb Responsive Utilities

export const breakpoints = {
  mobile: '0px',
  tablet: '768px', 
  desktop: '1024px',
  wide: '1200px'
} as const

export type Breakpoint = keyof typeof breakpoints

// Hook for responsive behavior
export function useResponsive() {
  const getBreakpoint = (): Breakpoint => {
    if (typeof window === 'undefined') return 'desktop'
    
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  const [currentBreakpoint, setCurrentBreakpoint] = React.useState<Breakpoint>(getBreakpoint)

  React.useEffect(() => {
    const handleResize = () => {
      setCurrentBreakpoint(getBreakpoint())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    currentBreakpoint,
    isMobile: currentBreakpoint === 'mobile',
    isTablet: currentBreakpoint === 'tablet', 
    isDesktop: currentBreakpoint === 'desktop',
    isWide: currentBreakpoint === 'wide'
  }
}

// Responsive value selector
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>): T | undefined {
  const { currentBreakpoint } = useResponsive()
  
  // Fallback logic: mobile -> tablet -> desktop -> wide
  return values[currentBreakpoint] || 
         values.desktop || 
         values.tablet || 
         values.mobile
}

// Component visibility by breakpoint
export function useBreakpointVisibility(
  showOn: Breakpoint[] = ['mobile', 'tablet', 'desktop']
): boolean {
  const { currentBreakpoint } = useResponsive()
  return showOn.includes(currentBreakpoint)
}

// Grid column calculator
export function getGridColumns(
  columns: { desktop?: number; tablet?: number; mobile?: number } = {}
): string {
  const { desktop = 3, tablet = 2, mobile = 1 } = columns
  
  let classes = `grid-cols-${mobile}`
  
  if (tablet !== mobile) {
    classes += ` md:grid-cols-${tablet}`
  }
  
  if (desktop !== tablet) {
    classes += ` lg:grid-cols-${desktop}`
  }
  
  return classes
}