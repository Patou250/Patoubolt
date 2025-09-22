// WeWeb Page Context System
import { patouDesignSystem } from './designSystem'

interface PageContext {
  path: string
  type: 'public' | 'app' | 'child'
  layout: 'public' | 'app' | 'child'
  userType?: 'parent' | 'child'
}

interface GlobalContext {
  page: {
    path: string
    title?: string
    meta?: Record<string, any>
  }
}

class PageContextManager {
  private static instance: PageContextManager
  private currentContext: PageContext | null = null
  private appliedStyles: Set<string> = new Set()

  static getInstance(): PageContextManager {
    if (!PageContextManager.instance) {
      PageContextManager.instance = new PageContextManager()
    }
    return PageContextManager.instance
  }

  // Determine page context from current path
  determinePageContext(currentPath: string): PageContext {
    // Public pages
    const isPublicPage = currentPath.includes('/parent/login') || 
                        currentPath.includes('/parent/signup') || 
                        currentPath === '/' ||
                        currentPath.includes('/privacy') ||
                        currentPath.includes('/terms')

    // App pages (parent)
    const isAppPage = currentPath.includes('/parent/dashboard') || 
                     currentPath.includes('/parent/children') ||
                     currentPath.includes('/parent/playlists') ||
                     currentPath.includes('/parent/rules') ||
                     currentPath.includes('/parent/curation') ||
                     currentPath.includes('/parent/insights')

    // Child pages
    const isChildPage = currentPath.includes('/child') && 
                       !currentPath.includes('/child/login')

    if (isPublicPage) {
      return {
        path: currentPath,
        type: 'public',
        layout: 'public'
      }
    } else if (isAppPage) {
      return {
        path: currentPath,
        type: 'app',
        layout: 'app',
        userType: 'parent'
      }
    } else if (isChildPage) {
      return {
        path: currentPath,
        type: 'child',
        layout: 'child',
        userType: 'child'
      }
    }

    // Default fallback
    return {
      path: currentPath,
      type: 'public',
      layout: 'public'
    }
  }

  // Apply page-specific styles
  async applyPageStyles(context: PageContext): Promise<void> {
    try {
      console.log('🎨 Applying page-specific styles for:', context.path)

      const layoutSystem = patouDesignSystem.getLayoutSystem()
      const uiGuidelines = patouDesignSystem.getUIGuidelines()

      if (!layoutSystem || !uiGuidelines) {
        console.warn('⚠️ Design system not ready, using fallback styles')
        this.applyFallbackStyles(context)
        return
      }

      // Apply layout-specific styles
      if (context.layout === 'public') {
        await this.applyPublicLayoutStyles(layoutSystem.layouts?.public)
        console.log('✅ Applied public layout styles')
      } else if (context.layout === 'app') {
        await this.applyAppLayoutStyles(layoutSystem.layouts?.app)
        console.log('✅ Applied app layout styles')
      } else if (context.layout === 'child') {
        await this.applyChildLayoutStyles(layoutSystem.layouts?.child || layoutSystem.layouts?.app)
        console.log('✅ Applied child layout styles')
      }

      // Initialize interactive elements
      await this.initializeInteractiveElements(uiGuidelines)

      // Apply user-type specific styles
      if (context.userType) {
        await this.applyUserTypeStyles(context.userType)
      }

      // Mark styles as applied
      this.appliedStyles.add(context.path)
      console.log('✅ Page-specific styles applied for:', context.path)

    } catch (error) {
      console.error('❌ Error applying page styles:', error)
      this.applyFallbackStyles(context)
    }
  }

  private async applyPublicLayoutStyles(publicLayout: any): Promise<void> {
    if (!publicLayout) return

    const root = document.documentElement

    // Apply header styles
    if (publicLayout.header) {
      root.style.setProperty('--layout-public-header-height', publicLayout.header.height || '80px')
      root.style.setProperty('--layout-public-header-bg', publicLayout.header.backgroundColor || 'var(--color-background-surface)')
      root.style.setProperty('--layout-public-header-shadow', publicLayout.header.boxShadow || '0 2px 10px rgba(0, 0, 0, 0.05)')
    }

    // Apply content styles
    if (publicLayout.content) {
      root.style.setProperty('--layout-public-content-max-width', publicLayout.content.maxWidth || '1200px')
      root.style.setProperty('--layout-public-content-padding', publicLayout.content.padding || '0 24px')
    }

    // Apply footer styles
    if (publicLayout.footer) {
      root.style.setProperty('--layout-public-footer-padding', publicLayout.footer.padding || '48px 0')
      root.style.setProperty('--layout-public-footer-border', publicLayout.footer.borderTop || '1px solid rgba(0, 0, 0, 0.05)')
    }
  }

  private async applyAppLayoutStyles(appLayout: any): Promise<void> {
    if (!appLayout) return

    const root = document.documentElement

    // Apply sidebar styles
    if (appLayout.sidebar) {
      root.style.setProperty('--layout-app-sidebar-width', appLayout.sidebar.width || '280px')
      root.style.setProperty('--layout-app-sidebar-bg', appLayout.sidebar.backgroundColor || 'var(--color-background-sidebar)')
      root.style.setProperty('--layout-app-sidebar-shadow', appLayout.sidebar.boxShadow || '4px 0 20px rgba(0, 0, 0, 0.1)')
    }

    // Apply content styles
    if (appLayout.content) {
      root.style.setProperty('--layout-app-content-padding', appLayout.content.padding || '32px')
      root.style.setProperty('--layout-app-content-bg', appLayout.content.backgroundColor || 'var(--color-background-page)')
    }

    // Apply mobile nav styles
    if (appLayout.mobileNav) {
      root.style.setProperty('--layout-app-mobile-nav-height', appLayout.mobileNav.height || '80px')
      root.style.setProperty('--layout-app-mobile-nav-bg', appLayout.mobileNav.backgroundColor || 'rgba(255, 255, 255, 0.95)')
      root.style.setProperty('--layout-app-mobile-nav-radius', appLayout.mobileNav.borderRadius || '20px 20px 0 0')
    }
  }

  private async applyChildLayoutStyles(childLayout: any): Promise<void> {
    if (!childLayout) return

    const root = document.documentElement

    // Child layout uses similar structure to app but with different colors
    root.style.setProperty('--layout-child-primary-color', 'var(--color-awaken-base)')
    root.style.setProperty('--layout-child-bg', 'var(--color-awaken-bg)')
    
    // Apply mobile-first approach for child layout
    root.style.setProperty('--layout-child-content-padding', '16px')
    root.style.setProperty('--layout-child-nav-height', '80px')
  }

  private async initializeInteractiveElements(uiGuidelines: any): Promise<void> {
    // Wait for DOM to be ready
    await new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve)
      } else {
        resolve(void 0)
      }
    })

    // Initialize cards with hover effects
    const cards = document.querySelectorAll('[data-component="card"], .patou-card, .patou-card-feature')
    cards.forEach(card => {
      this.applyCardHoverEffects(card as HTMLElement, uiGuidelines)
    })

    // Initialize buttons with hover effects
    const buttons = document.querySelectorAll('[data-component="button"], .btn, .weweb-btn-primary, .weweb-btn-secondary')
    buttons.forEach(button => {
      this.applyButtonHoverEffects(button as HTMLElement, uiGuidelines)
    })

    console.log('🎯 Interactive elements initialized')
  }

  private applyCardHoverEffects(card: HTMLElement, uiGuidelines: any): void {
    const hoverStyles = uiGuidelines?.interactions?.hover?.cards || {
      transform: 'translateY(-4px) scale(1.01)',
      boxShadow: '0 8px 24px rgba(52, 211, 153, 0.12)',
      transition: 'all 0.12s cubic-bezier(0.4, 0, 0.2, 1)'
    }

    card.addEventListener('mouseenter', () => {
      Object.entries(hoverStyles).forEach(([property, value]) => {
        card.style[property as any] = value as string
      })
    })

    card.addEventListener('mouseleave', () => {
      card.style.transform = ''
      card.style.boxShadow = ''
    })
  }

  private applyButtonHoverEffects(button: HTMLElement, uiGuidelines: any): void {
    const isPrimary = button.classList.contains('btn-primary') || button.classList.contains('weweb-btn-primary')
    const variant = isPrimary ? 'primary' : 'secondary'
    
    const hoverStyles = uiGuidelines?.interactions?.hover?.buttons?.[variant] || {
      filter: 'brightness(0.95)',
      transform: 'translateY(-2px) scale(1.01)',
      transition: 'all 0.12s cubic-bezier(0.4, 0, 0.2, 1)'
    }

    button.addEventListener('mouseenter', () => {
      Object.entries(hoverStyles).forEach(([property, value]) => {
        button.style[property as any] = value as string
      })
    })

    button.addEventListener('mouseleave', () => {
      button.style.transform = ''
      button.style.filter = ''
    })
  }

  private async applyUserTypeStyles(userType: 'parent' | 'child'): Promise<void> {
    const root = document.documentElement

    if (userType === 'parent') {
      root.style.setProperty('--user-context-primary', 'var(--color-protect-base)')
      root.style.setProperty('--user-context-bg', 'var(--color-protect-bg)')
      root.style.setProperty('--user-context-accent', 'var(--color-protect-light)')
    } else if (userType === 'child') {
      root.style.setProperty('--user-context-primary', 'var(--color-awaken-base)')
      root.style.setProperty('--user-context-bg', 'var(--color-awaken-bg)')
      root.style.setProperty('--user-context-accent', 'var(--color-awaken-light)')
    }

    console.log(`🎨 Applied ${userType} user type styles`)
  }

  private applyFallbackStyles(context: PageContext): void {
    console.log('🔄 Applying fallback styles for:', context.layout)
    
    const root = document.documentElement
    
    // Basic fallback styles
    const fallbackStyles = {
      '--layout-header-height': '80px',
      '--layout-sidebar-width': '280px',
      '--layout-content-padding': '32px',
      '--layout-mobile-nav-height': '80px'
    }

    Object.entries(fallbackStyles).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })
  }

  // Public methods
  getCurrentContext(): PageContext | null {
    return this.currentContext
  }

  async updatePageContext(currentPath: string): Promise<void> {
    const newContext = this.determinePageContext(currentPath)
    
    // Only apply styles if context changed
    if (!this.currentContext || this.currentContext.path !== newContext.path) {
      this.currentContext = newContext
      await this.applyPageStyles(newContext)
    }
  }

  isStylesApplied(path: string): boolean {
    return this.appliedStyles.has(path)
  }
}

// Export singleton instance
export const pageContextManager = PageContextManager.getInstance()

// Hook for React components
export const usePageContext = () => {
  const [context, setContext] = React.useState<PageContext | null>(
    pageContextManager.getCurrentContext()
  )

  React.useEffect(() => {
    const updateContext = () => {
      setContext(pageContextManager.getCurrentContext())
    }

    // Listen for page context changes
    window.addEventListener('patou:page-context-changed', updateContext)
    return () => window.removeEventListener('patou:page-context-changed', updateContext)
  }, [])

  return context
}

// Initialize page context on route change
function initializePageContext() {
  const uiGuidelines = formulas['8001aa8b-fd4a-4522-a6bf-67cbb73f5525']();
  const layoutSystem = formulas['bd43d893-9b5f-481a-96b4-537343442a45']();
  
  // Dispatch event for React components
  window.dispatchEvent(new CustomEvent('patou:page-context-changed', {
    detail: { context: pageContextManager.getCurrentContext() }
  }))
}