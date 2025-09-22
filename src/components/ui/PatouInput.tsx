import React from 'react'

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
  
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="patou-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`patou-input ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
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