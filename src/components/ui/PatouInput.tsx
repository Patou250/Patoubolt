import React from 'react'
import { getComponentGuidelines } from '../../utils/interactions'

interface PatouInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export default function PatouInput({ 
  label, 
  error, 
  helperText, 
  className = '',
  id,
  ...props 
}: PatouInputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const inputGuidelines = getComponentGuidelines('input', error ? 'error' : 'default')
  const labelGuidelines = getComponentGuidelines('form', 'label')
  
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="patou-label">
          style={labelGuidelines}
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`patou-input ${className}`}
        style={inputGuidelines}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  )
}