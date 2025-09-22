// WeWeb Asset Management System
interface AssetPaths {
  logos: Record<string, string>
  illustrations: Record<string, string>
  icons: Record<string, string>
}

// Asset loading utilities
export class AssetManager {
  private static instance: AssetManager
  private loadedAssets = new Set<string>()
  private preloadQueue: string[] = []

  static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager()
    }
    return AssetManager.instance
  }

  // Preload critical assets
  preloadCritical(assets: string[]): void {
    assets.forEach(asset => {
      if (!this.loadedAssets.has(asset)) {
        this.preloadAsset(asset)
      }
    })
  }

  private preloadAsset(src: string): void {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = this.getAssetType(src)
    link.href = src
    document.head.appendChild(link)
    this.loadedAssets.add(src)
  }

  private getAssetType(src: string): string {
    if (src.includes('.woff') || src.includes('.ttf')) return 'font'
    if (src.includes('.css')) return 'style'
    return 'image'
  }

  // Lazy load images with intersection observer
  lazyLoadImage(element: HTMLImageElement): void {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            if (img.dataset.src) {
              img.src = img.dataset.src
              img.classList.remove('lazy')
              observer.unobserve(img)
            }
          }
        })
      })
      observer.observe(element)
    }
  }
}

// Asset path helpers
export const getAssetPath = (category: 'logos' | 'illustrations' | 'icons', name: string): string => {
  // Default paths - will be updated with real WeWeb paths
  const basePaths = {
    logos: '/images/logos',
    illustrations: '/images/illustrations', 
    icons: '/icons'
  }
  
  return `${basePaths[category]}/${name}`
}

// Optimized image component
export const OptimizedImage = ({ 
  src, 
  alt, 
  size = 'medium',
  loading = 'lazy',
  className = '',
  ...props 
}: {
  src: string
  alt: string
  size?: 'thumbnail' | 'small' | 'medium' | 'large' | 'hero'
  loading?: 'eager' | 'lazy'
  className?: string
  [key: string]: any
}) => {
  const sizeMap = {
    thumbnail: '150x150',
    small: '300x300', 
    medium: '600x400',
    large: '1200x800',
    hero: '1920x1080'
  }

  // Generate responsive srcSet if needed
  const generateSrcSet = (baseSrc: string) => {
    if (baseSrc.includes('pexels.com')) {
      const [base, params] = baseSrc.split('?')
      return `${base}?auto=compress&cs=tinysrgb&w=300 300w, ${base}?auto=compress&cs=tinysrgb&w=600 600w, ${base}?auto=compress&cs=tinysrgb&w=1200 1200w`
    }
    return undefined
  }

  return (
    <img
      src={src}
      srcSet={generateSrcSet(src)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      alt={alt}
      loading={loading}
      className={`${className} ${loading === 'lazy' ? 'lazy' : ''}`}
      {...props}
    />
  )
}

// Icon component with WeWeb sizing
export const PatouIcon = ({ 
  name, 
  size = 'md', 
  color = 'default',
  className = '',
  ...props 
}: {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'default' | 'primary' | 'protect' | 'share' | 'awaken' | 'light' | 'dark'
  className?: string
  [key: string]: any
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5', 
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    default: 'text-gray-600',
    primary: 'text-primary',
    protect: 'text-protect', 
    share: 'text-share',
    awaken: 'text-awaken',
    light: 'text-white',
    dark: 'text-gray-900'
  }

  return (
    <img
      src={getAssetPath('icons', `${name}.svg`)}
      alt={name}
      className={`${sizeClasses[size]} ${colorClasses[color]} ${className} patou-icon`}
      {...props}
    />
  )
}