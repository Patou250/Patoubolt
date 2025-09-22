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