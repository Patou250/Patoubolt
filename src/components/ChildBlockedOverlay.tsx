import { useState } from 'react'
import { Clock, Shield, Ban, MessageCircle } from 'lucide-react'
import type { RuleViolation } from '../types/rules'

interface ChildBlockedOverlayProps {
  violation: RuleViolation
  onRequestTime?: () => void
}

export default function ChildBlockedOverlay({ violation, onRequestTime }: ChildBlockedOverlayProps) {
  const [isRequesting, setIsRequesting] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  const handleRequestTime = async () => {
    if (!onRequestTime) return
    
    setIsRequesting(true)
    try {
      await onRequestTime()
      setRequestSent(true)
    } catch (error) {
      console.error('Failed to request time:', error)
    } finally {
      setIsRequesting(false)
    }
  }

  const getIcon = () => {
    switch (violation.type) {
      case 'time_window':
        return <Clock className="w-12 h-12 text-purple-500" />
      case 'quota_exceeded':
        return <Clock className="w-12 h-12 text-orange-500" />
      case 'explicit_content':
        return <Shield className="w-12 h-12 text-red-500" />
      case 'not_whitelisted':
        return <Ban className="w-12 h-12 text-gray-500" />
      default:
        return <Ban className="w-12 h-12 text-gray-500" />
    }
  }

  const getColor = () => {
    switch (violation.type) {
      case 'time_window':
        return 'from-purple-50 to-purple-100'
      case 'quota_exceeded':
        return 'from-orange-50 to-orange-100'
      case 'explicit_content':
        return 'from-red-50 to-red-100'
      case 'not_whitelisted':
        return 'from-gray-50 to-gray-100'
      default:
        return 'from-gray-50 to-gray-100'
    }
  }

  const canRequestTime = violation.type === 'quota_exceeded' || violation.type === 'time_window'

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${getColor()} flex items-center justify-center p-4 z-50`}>
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          {getIcon()}
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Oups ! 😔
          </h2>
          <p className="text-gray-600 text-lg">
            {violation.message}
          </p>
        </div>

        {violation.details && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            {violation.type === 'time_window' && violation.details.current_time && (
              <p>Il est actuellement {violation.details.current_time}</p>
            )}
            {violation.type === 'quota_exceeded' && violation.details.quota && (
              <p>
                Quota: {violation.details.used || 0} / {violation.details.quota} minutes
              </p>
            )}
          </div>
        )}

        {canRequestTime && (
          <div className="space-y-3">
            {!requestSent ? (
              <button
                onClick={handleRequestTime}
                disabled={isRequesting}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-medium py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                {isRequesting ? 'Envoi...' : 'Demander +5 minutes'}
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg">
                ✅ Demande envoyée aux parents !
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500">
          Demande à tes parents de modifier tes règles d'écoute si nécessaire
        </div>
      </div>
    </div>
  )
}