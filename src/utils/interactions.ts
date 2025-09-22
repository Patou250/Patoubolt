// WeWeb Interaction Guidelines
export type ElementType = 'card' | 'button' | 'icon'
export type ButtonVariant = 'primary' | 'secondary' | 'default'

interface InteractionGuidelines {
  interactions: {
    hover: {
      cards: {
        transform: string
        boxShadow: string
        transition: string
      }
      buttons: {
        primary: {
          filter: string
          transform: string
          transition: string
        }
        secondary: {
          transform: string
          transition: string
        }
      }
      icons: {
        colorTransition: string
        scaleTransform: string
      }
    }
  }
}

// Mock guidelines - replace with actual WeWeb values
const mockGuidelines: InteractionGuidelines = {
  interactions: {
    hover: {
      cards: {
        transform: 'translateY(-4px) scale(1.01)',
        boxShadow: '0 8px 24px rgba(52, 211, 153, 0.12)',
        transition: 'all 0.12s cubic-bezier(0.4, 0, 0.2, 1)'
      },
      buttons: {
        primary: {
          filter: 'brightness(0.95)',
          transform: 'translateY(-2px) scale(1.01)',
          transition: 'all 0.12s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        secondary: {
          transform: 'translateY(-1px)',
          transition: 'all 0.12s cubic-bezier(0.4, 0, 0.2, 1)'
        }
      },
      icons: {
        colorTransition: 'color 0.3s ease',
        scaleTransform: 'scale(1.05)'
      }
    }
  }
}

export const getInteractionGuidelines = (
  elementType: ElementType = 'card', 
  variant: ButtonVariant = 'default'
) => {
  const uiGuidelines = mockGuidelines // Will be replaced with real WeWeb guidelines
  
  switch(elementType) {
    case 'card':
      return uiGuidelines.interactions.hover.cards
    case 'button':
      return uiGuidelines.interactions.hover.buttons[variant] || uiGuidelines.interactions.hover.buttons.primary
    case 'icon':
      return uiGuidelines.interactions.hover.icons
    default:
      return uiGuidelines.interactions.hover.cards
  }
}

// Generate CSS styles from guidelines
export const generateInteractionStyles = (
  elementType: ElementType, 
  variant: ButtonVariant = 'default'
): React.CSSProperties => {
  const guidelines = getInteractionGuidelines(elementType, variant)
  
  if (elementType === 'card') {
    return {
      transition: guidelines.transition,
      cursor: 'pointer'
    }
  }
  
  if (elementType === 'button') {
    return {
      transition: guidelines.transition,
      cursor: 'pointer'
    }
  }
  
  if (elementType === 'icon') {
    return {
      transition: guidelines.colorTransition,
      cursor: 'pointer'
    }
  }
  
  return {}
}

// Generate hover styles
export const generateHoverStyles = (
  elementType: ElementType, 
  variant: ButtonVariant = 'default'
): string => {
  const guidelines = getInteractionGuidelines(elementType, variant)
  
  if (elementType === 'card') {
    return `
      &:hover {
        transform: ${guidelines.transform};
        box-shadow: ${guidelines.boxShadow};
        transition: ${guidelines.transition};
      }
    `
  }
  
  if (elementType === 'button') {
    const styles = guidelines as any
    return `
      &:hover {
        ${styles.filter ? `filter: ${styles.filter};` : ''}
        transform: ${styles.transform};
        transition: ${styles.transition};
      }
    `
  }
  
  if (elementType === 'icon') {
    return `
      &:hover {
        transform: ${guidelines.scaleTransform};
        transition: ${guidelines.colorTransition};
      }
    `
  }
  
  return ''
}

// Layout Guidelines Function
export function getLayoutGuidelines(layoutType = 'public', breakpoint = 'desktop') {
  // Will be replaced with: formulas['bd43d893-9b5f-481a-96b4-537343442a45']()
  const layoutSystem = {
    layouts: {
      public: {
        header: {
          height: '80px',
          padding: '0 24px',
          position: 'fixed',
          backgroundColor: 'var(--color-background-page)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(10px)'
        },
        content: {
          maxWidth: '1200px',
          padding: '0 24px',
          marginTop: '80px'
        },
        footer: {
          padding: '48px 0',
          borderTop: '1px solid rgba(0, 0, 0, 0.05)'
        }
      },
      app: {
        sidebar: {
          width: '280px',
          padding: '24px',
          position: 'fixed',
          backgroundColor: 'var(--color-background-sidebar)',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)'
        },
        content: {
          maxWidth: 'none',
          padding: '32px',
          marginLeft: '280px',
          backgroundColor: 'var(--color-background-page)'
        },
        mobileNav: {
          height: '80px',
          padding: '16px',
          position: 'fixed',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
          borderRadius: '20px 20px 0 0'
        }
      }
    }
  }
  
  return layoutSystem.layouts[layoutType] || layoutSystem.layouts.public
}

// Convert layout guidelines to CSS variables
export const generateLayoutStyles = (layoutType = 'public', breakpoint = 'desktop') => {
  const layout = getLayoutGuidelines(layoutType, breakpoint)
  
  const cssVariables: Record<string, string> = {}
  
  // Convert nested object to CSS custom properties
  const flattenObject = (obj: any, prefix = '--layout') => {
    Object.entries(obj).forEach(([key, value]) => {
      const cssKey = `${prefix}-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      
      if (typeof value === 'object' && value !== null) {
        flattenObject(value, cssKey)
      } else {
        cssVariables[cssKey] = String(value)
      }
    })
  }
  
  flattenObject(layout)
  return cssVariables
}

// Animation Guidelines Function
export function getAnimationGuidelines(animationType = 'fadeIn', delay = '0ms') {
  const uiGuidelines = formulas['8001aa8b-fd4a-4522-a6bf-67cbb73f5525']();
  const animation = uiGuidelines.animations.patterns[animationType];
  
  if (!animation) return {};
  
  return {
    animationKeyframes: animation.keyframes,
    animationDuration: animation.duration,
    animationTimingFunction: animation.timingFunction,
    animationFillMode: animation.fillMode,
    animationDelay: delay,
    animationIterationCount: '1'
  };
}

// Convert animation guidelines to CSS styles
export const generateAnimationStyles = (
  animationType: 'fadeIn' | 'slideUp' | 'scaleIn' = 'fadeIn',
  delay: string = '0ms'
): React.CSSProperties => {
  const guidelines = getAnimationGuidelines(animationType, delay)
  
  if (!guidelines.animationKeyframes) return {}
  
  return {
    animationDuration: guidelines.animationDuration,
    animationTimingFunction: guidelines.animationTimingFunction,
    animationFillMode: guidelines.animationFillMode,
    animationDelay: guidelines.animationDelay,
    animationIterationCount: guidelines.animationIterationCount,
    animationName: animationType // CSS class will handle keyframes
  }
}

// Generate CSS animation classes
export const generateAnimationClasses = (
  animationType: 'fadeIn' | 'slideUp' | 'scaleIn' = 'fadeIn',
  delay: string = '0ms'
): string => {
  const baseClass = `patou-animate-${animationType}`
  const delayClass = delay !== '0ms' ? ` animation-delay-${delay.replace('ms', '')}` : ''
  
  return `${baseClass}${delayClass}`
}

// WeWeb Component Guidelines
export const getComponentGuidelines = (
  componentType: 'card' | 'button' | 'input' | 'form' = 'card', 
  variant: string = 'default'
) => {
  // Mock guidelines - replace with: formulas['8001aa8b-fd4a-4522-a6bf-67cbb73f5525']()
  const uiGuidelines = {
    components: {
      card: {
        default: {
          backgroundColor: 'var(--color-background-surface)',
          borderRadius: 'var(--patou-radius)',
          padding: 'var(--spacing-lg)',
          boxShadow: 'var(--patou-shadow-soft)',
          transition: 'all 0.3s ease',
          border: '1px solid rgba(40, 114, 51, 0.08)'
        },
        feature: {
          backgroundColor: 'var(--color-background-surface)',
          borderRadius: 'var(--patou-radius)',
          padding: 'var(--spacing-xl)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          border: '1px solid rgba(40, 114, 51, 0.08)'
        },
        interactive: {
          backgroundColor: 'var(--color-background-surface)',
          borderRadius: 'var(--patou-radius)',
          padding: 'var(--spacing-lg)',
          boxShadow: 'var(--patou-shadow-soft)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          border: '1px solid rgba(40, 114, 51, 0.08)'
        }
      },
      button: {
        primary: {
          backgroundColor: 'var(--color-primary-base)',
          color: 'white',
          padding: 'var(--spacing-sm) var(--spacing-lg)',
          borderRadius: 'var(--patou-radius)',
          fontWeight: '600',
          cursor: 'pointer',
          border: 'none',
          transition: 'all 0.3s ease',
          minHeight: '48px'
        },
        secondary: {
          backgroundColor: 'transparent',
          color: 'var(--color-protect-base)',
          border: '2px solid var(--color-protect-base)',
          padding: 'var(--spacing-sm) var(--spacing-lg)',
          borderRadius: 'var(--patou-radius)',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          minHeight: '48px'
        },
        outline: {
          backgroundColor: 'transparent',
          color: 'var(--color-primary-base)',
          border: '2px solid var(--color-primary-base)',
          padding: 'var(--spacing-sm) var(--spacing-lg)',
          borderRadius: 'var(--patou-radius)',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          minHeight: '48px'
        },
        ghost: {
          backgroundColor: 'transparent',
          color: 'var(--color-text-secondary)',
          border: 'none',
          padding: 'var(--spacing-sm) var(--spacing-lg)',
          borderRadius: 'var(--patou-radius)',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          minHeight: '48px'
        }
      },
      input: {
        default: {
          height: '48px',
          padding: 'var(--spacing-sm)',
          borderRadius: 'var(--patou-radius-sm)',
          border: '1px solid #e5e7eb',
          backgroundColor: 'var(--color-background-surface)',
          transition: 'all 0.3s ease',
          fontFamily: 'inherit',
          fontSize: 'var(--font-size-base)',
          width: '100%'
        },
        error: {
          height: '48px',
          padding: 'var(--spacing-sm)',
          borderRadius: 'var(--patou-radius-sm)',
          border: '1px solid #ef4444',
          backgroundColor: 'var(--color-background-surface)',
          transition: 'all 0.3s ease',
          fontFamily: 'inherit',
          fontSize: 'var(--font-size-base)',
          width: '100%'
        }
      },
      form: {
        label: {
          marginBottom: 'var(--spacing-xs)',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          display: 'block',
          fontSize: 'var(--font-size-sm)'
        }
      }
    }
  }
  
  if (uiGuidelines.components[componentType]) {
    return uiGuidelines.components[componentType][variant] || uiGuidelines.components[componentType].default
  }
  
  return {}
}

// Convert guidelines to React styles
export const generateComponentStyles = (
  componentType: 'card' | 'button' | 'input' | 'form' = 'card',
  variant: string = 'default'
): React.CSSProperties => {
  const guidelines = getComponentGuidelines(componentType, variant)
  
  // Convert CSS custom properties to actual values for React
  const convertedStyles: React.CSSProperties = {}
  
  Object.entries(guidelines).forEach(([key, value]) => {
    // Convert kebab-case to camelCase for React
    const reactKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    convertedStyles[reactKey as keyof React.CSSProperties] = value as any
  })
  
  return convertedStyles
}