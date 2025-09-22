import React, { useState, useRef, useEffect } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  size?: 'thumbnail' | 'small' | 'medium' | 'large' | 'hero'
  quality?: number
  [key: string]: any
}

export default function LazyImage({ 
  src, 
  alt, 
  className = '', 
  placeholder,
  size = 'medium',
  quality = 85,
  ...props 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Generate optimized Pexels URLs
  const getOptimizedSrc = (originalSrc: string, targetSize: string) => {
    if (originalSrc.includes('pexels.com')) {
      const sizeMap = {
        thumbnail: 'w=150&h=150',
        small: 'w=300&h=300',
        medium: 'w=600&h=400', 
        large: 'w=1200&h=800',
        hero: 'w=1920&h=1080'
      }
      
      const [base] = originalSrc.split('?')
      return `${base}?auto=compress&cs=tinysrgb&${sizeMap[targetSize as keyof typeof sizeMap]}&q=${quality}`
    }
    return originalSrc
  }

  // Generate responsive srcSet
  const generateSrcSet = (baseSrc: string) => {
    if (baseSrc.includes('pexels.com')) {
      const [base] = baseSrc.split('?')
      return [
        `${base}?auto=compress&cs=tinysrgb&w=300&q=${quality} 300w`,
        `${base}?auto=compress&cs=tinysrgb&w=600&q=${quality} 600w`,
        `${base}?auto=compress&cs=tinysrgb&w=1200&q=${quality} 1200w`
      ].join(', ')
    }
    return undefined
  }

  const optimizedSrc = getOptimizedSrc(src, size)
  const srcSet = generateSrcSet(src)

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          {placeholder ? (
            <img src={placeholder} alt="" className="opacity-50" />
          ) : (
            <div className="w-8 h-8 text-gray-400">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={optimizedSrc}
          srcSet={srcSet}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt={alt}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          {...props}
        />
      )}
    </div>
  )
}