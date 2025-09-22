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
  const uiGuidelines = mockGuidelines // Replace with: formulas['8001aa8b-fd4a-4522-a6bf-67cbb73f5525']()
  
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