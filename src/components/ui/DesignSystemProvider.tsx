import React, { createContext, useContext, useEffect, useState } from 'react'
import { patouDesignSystem } from '../../utils/designSystem'

interface DesignSystemContextType {
  isReady: boolean
  designTokens: any
  uiGuidelines: any
  layoutSystem: any
  assetManagement: any
}

const DesignSystemContext = createContext<DesignSystemContextType>({
  isReady: false,
  designTokens: null,
  uiGuidelines: null,
  layoutSystem: null,
  assetManagement: null
})

export const useDesignSystem = () => {
  const context = useContext(DesignSystemContext)
  if (!context) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider')
  }
  return context
}

interface DesignSystemProviderProps {
  children: React.ReactNode
}

export default function DesignSystemProvider({ children }: DesignSystemProviderProps) {
  const [isReady, setIsReady] = useState(patouDesignSystem.isInitialized())
  const [designTokens, setDesignTokens] = useState(patouDesignSystem.getDesignTokens())
  const [uiGuidelines, setUIGuidelines] = useState(patouDesignSystem.getUIGuidelines())
  const [layoutSystem, setLayoutSystem] = useState(patouDesignSystem.getLayoutSystem())
  const [assetManagement, setAssetManagement] = useState(patouDesignSystem.getAssetManagement())

  useEffect(() => {
    const handleReady = (event: CustomEvent) => {
      setIsReady(true)
      setDesignTokens(event.detail.designTokens)
      setUIGuidelines(event.detail.uiGuidelines)
      setLayoutSystem(event.detail.layoutSystem)
      setAssetManagement(event.detail.assetManagement)
    }

    if (patouDesignSystem.isInitialized()) {
      setIsReady(true)
      setDesignTokens(patouDesignSystem.getDesignTokens())
      setUIGuidelines(patouDesignSystem.getUIGuidelines())
      setLayoutSystem(patouDesignSystem.getLayoutSystem())
      setAssetManagement(patouDesignSystem.getAssetManagement())
    } else {
      window.addEventListener('patou:design-system-ready', handleReady as EventListener)
      return () => window.removeEventListener('patou:design-system-ready', handleReady as EventListener)
    }
  }, [])

  const value: DesignSystemContextType = {
    isReady,
    designTokens,
    uiGuidelines,
    layoutSystem,
    assetManagement
  }

  return (
    <DesignSystemContext.Provider value={value}>
      {children}
    </DesignSystemContext.Provider>
  )
}