// WeWeb Design System Initialization
interface DesignTokens {
  colors: Record<string, any>
  spacing: Record<string, string>
  typography: Record<string, any>
  radius: Record<string, string>
  shadows: Record<string, string>
}

interface UIGuidelines {
  components: Record<string, any>
  interactions: Record<string, any>
  animations: Record<string, any>
}

interface LayoutSystem {
  layouts: Record<string, any>
}

interface AssetManagement {
  logos: Record<string, string>
  illustrations: Record<string, string>
  icons: Record<string, string>
}

class PatouDesignSystem {
  private static instance: PatouDesignSystem
  private initialized = false
  
  private designTokens: DesignTokens | null = null
  private uiGuidelines: UIGuidelines | null = null
  private layoutSystem: LayoutSystem | null = null
  private assetManagement: AssetManagement | null = null

  static getInstance(): PatouDesignSystem {
    if (!PatouDesignSystem.instance) {
      PatouDesignSystem.instance = new PatouDesignSystem()
    }
    return PatouDesignSystem.instance
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('🎨 Design System already initialized')
      return
    }

    try {
      console.log('🚀 Initializing Patou Design System...')

      // Load WeWeb formulas (will be replaced with actual formulas)
      await this.loadDesignTokens()
      await this.loadUIGuidelines()
      await this.loadLayoutSystem()
      await this.loadAssetManagement()

      // Apply tokens to CSS custom properties
      this.applyCSSTokens()
      
      this.initialized = true
      console.log('✅ Design System initialized successfully')
      
      // Dispatch custom event for components that need to react
      window.dispatchEvent(new CustomEvent('patou:design-system-ready', {
        detail: {
          designTokens: this.designTokens,
          uiGuidelines: this.uiGuidelines,
          layoutSystem: this.layoutSystem,
          assetManagement: this.assetManagement
        }
      }))
      
      // Initialize page context after design system is ready
      const { pageContextManager } = await import('./pageContext')
      await pageContextManager.updatePageContext(window.location.pathname)
      
    } catch (error) {
      console.error('❌ Failed to initialize Design System:', error)
      // Fallback to default tokens
      this.applyFallbackTokens()
    }
  }

  private async loadDesignTokens(): Promise<void> {
    try {
      // Replace with: const designTokens = formulas['87ab7385-c509-459b-853e-088dc90f50f0']();
      this.designTokens = this.getMockDesignTokens()
      console.log('📐 Design tokens loaded')
    } catch (error) {
      console.warn('⚠️ Failed to load design tokens, using fallback')
      this.designTokens = this.getMockDesignTokens()
    }
  }

  private async loadUIGuidelines(): Promise<void> {
    try {
      // Replace with: const uiGuidelines = formulas['8001aa8b-fd4a-4522-a6bf-67cbb73f5525']();
      this.uiGuidelines = this.getMockUIGuidelines()
      console.log('🎯 UI guidelines loaded')
    } catch (error) {
      console.warn('⚠️ Failed to load UI guidelines, using fallback')
      this.uiGuidelines = this.getMockUIGuidelines()
    }
  }

  private async loadLayoutSystem(): Promise<void> {
    try {
      // Replace with: const layoutSystem = formulas['bd43d893-9b5f-481a-96b4-537343442a45']();
      this.layoutSystem = this.getMockLayoutSystem()
      console.log('🏗️ Layout system loaded')
    } catch (error) {
      console.warn('⚠️ Failed to load layout system, using fallback')
      this.layoutSystem = this.getMockLayoutSystem()
    }
  }

  private async loadAssetManagement(): Promise<void> {
    try {
      // Replace with: const assetManagement = formulas['a2a49a8f-127e-4885-a1de-0a1ac992583a']();
      this.assetManagement = this.getMockAssetManagement()
      console.log('🖼️ Asset management loaded')
    } catch (error) {
      console.warn('⚠️ Failed to load asset management, using fallback')
      this.assetManagement = this.getMockAssetManagement()
    }
  }

  private applyCSSTokens(): void {
    const root = document.documentElement

    if (this.designTokens) {
      // Apply color tokens
      Object.entries(this.designTokens.colors).forEach(([category, colors]) => {
        if (typeof colors === 'object' && colors !== null) {
          Object.entries(colors).forEach(([variant, value]) => {
            root.style.setProperty(`--color-${category}-${variant}`, String(value))
          })
        } else {
          root.style.setProperty(`--color-${category}`, String(colors))
        }
      })

      // Apply spacing tokens
      Object.entries(this.designTokens.spacing).forEach(([size, value]) => {
        root.style.setProperty(`--spacing-${size}`, value)
      })

      // Apply typography tokens
      Object.entries(this.designTokens.typography).forEach(([property, values]) => {
        if (typeof values === 'object' && values !== null) {
          Object.entries(values).forEach(([variant, value]) => {
            root.style.setProperty(`--${property}-${variant}`, String(value))
          })
        }
      })

      // Apply radius tokens
      Object.entries(this.designTokens.radius).forEach(([size, value]) => {
        root.style.setProperty(`--radius-${size}`, value)
      })

      // Apply shadow tokens
      Object.entries(this.designTokens.shadows).forEach(([type, value]) => {
        root.style.setProperty(`--shadow-${type}`, value)
      })

      console.log('🎨 CSS custom properties applied')
    }
  }

  private applyFallbackTokens(): void {
    const root = document.documentElement
    
    // Apply minimal fallback tokens
    const fallbackTokens = {
      '--color-primary-base': '#287233',
      '--color-protect-base': '#017ba6',
      '--color-share-base': '#e2725b',
      '--color-awaken-base': '#ffd447',
      '--spacing-xs': '8px',
      '--spacing-sm': '16px',
      '--spacing-md': '24px',
      '--spacing-lg': '32px',
      '--spacing-xl': '48px',
      '--radius-sm': '8px',
      '--radius-md': '12px',
      '--radius-lg': '16px',
      '--shadow-soft': '0 4px 16px rgba(40, 114, 51, 0.08)',
      '--shadow-elevated': '0 8px 24px rgba(40, 114, 51, 0.12)'
    }

    Object.entries(fallbackTokens).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })

    console.log('🔄 Fallback tokens applied')
  }

  // Mock data - replace with actual WeWeb formulas
  private getMockDesignTokens(): DesignTokens {
    return {
      colors: {
        primary: {
          base: '#287233',
          light: '#4ade80',
          dark: '#166534'
        },
        protect: {
          base: '#017ba6',
          light: '#0ea5e9',
          bg: '#f0f9ff'
        },
        share: {
          base: '#e2725b',
          light: '#fb7185',
          bg: '#fef2f2'
        },
        awaken: {
          base: '#ffd447',
          light: '#fbbf24',
          bg: '#fffbeb'
        },
        text: {
          primary: '#0b0f0d',
          secondary: '#5b6660',
          light: '#9ca3af'
        },
        background: {
          page: '#F8FAF9',
          app: '#111315',
          sidebar: '#1A1F1C',
          surface: '#ffffff'
        }
      },
      spacing: {
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '32px',
        xl: '48px',
        '2xl': '64px'
      },
      typography: {
        fontSize: {
          xs: '12px',
          sm: '14px',
          base: '16px',
          lg: '18px',
          xl: '20px',
          '2xl': '24px',
          '3xl': '32px'
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
          extrabold: '800'
        }
      },
      radius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px'
      },
      shadows: {
        soft: '0 4px 16px rgba(40, 114, 51, 0.08)',
        elevated: '0 8px 24px rgba(40, 114, 51, 0.12)',
        header: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }
    }
  }

  private getMockUIGuidelines(): UIGuidelines {
    return {
      components: {},
      interactions: {},
      animations: {}
    }
  }

  private getMockLayoutSystem(): LayoutSystem {
    return {
      layouts: {}
    }
  }

  private getMockAssetManagement(): AssetManagement {
    return {
      logos: {},
      illustrations: {},
      icons: {}
    }
  }

  // Getters for accessing loaded data
  getDesignTokens(): DesignTokens | null {
    return this.designTokens
  }

  getUIGuidelines(): UIGuidelines | null {
    return this.uiGuidelines
  }

  getLayoutSystem(): LayoutSystem | null {
    return this.layoutSystem
  }

  getAssetManagement(): AssetManagement | null {
    return this.assetManagement
  }

  isInitialized(): boolean {
    return this.initialized
  }
}

// Export singleton instance
export const patouDesignSystem = PatouDesignSystem.getInstance()

// Auto-initialize on module load
export const initializeDesignSystem = async (): Promise<void> => {
  await patouDesignSystem.initialize()
}

// Hook for React components
export const useDesignSystem = () => {
  const [isReady, setIsReady] = React.useState(patouDesignSystem.isInitialized())

  React.useEffect(() => {
    const handleReady = () => setIsReady(true)
    
    if (patouDesignSystem.isInitialized()) {
      setIsReady(true)
    } else {
      window.addEventListener('patou:design-system-ready', handleReady)
      return () => window.removeEventListener('patou:design-system-ready', handleReady)
    }
  }, [])

  return {
    isReady,
    designTokens: patouDesignSystem.getDesignTokens(),
    uiGuidelines: patouDesignSystem.getUIGuidelines(),
    layoutSystem: patouDesignSystem.getLayoutSystem(),
    assetManagement: patouDesignSystem.getAssetManagement()
  }
}