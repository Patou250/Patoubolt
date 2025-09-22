import { useEffect } from 'react'
import { AssetManager } from '../../utils/assets'

interface AssetPreloaderProps {
  critical?: string[]
  deferred?: string[]
}

export default function AssetPreloader({ 
  critical = [], 
  deferred = [] 
}: AssetPreloaderProps) {
  useEffect(() => {
    const assetManager = AssetManager.getInstance()
    
    // Preload critical assets immediately
    if (critical.length > 0) {
      assetManager.preloadCritical(critical)
    }
    
    // Preload deferred assets after a delay
    if (deferred.length > 0) {
      const timer = setTimeout(() => {
        assetManager.preloadCritical(deferred)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [critical, deferred])

  return null
}

// Default preloader for Patou app
export function PatouAssetPreloader() {
  const criticalAssets = [
    '/patou-logo.svg',
    // Add other critical assets when we have the real paths
  ]
  
  const deferredAssets = [
    // Add illustrations and non-critical images
  ]

  return (
    <AssetPreloader 
      critical={criticalAssets}
      deferred={deferredAssets}
    />
  )
}