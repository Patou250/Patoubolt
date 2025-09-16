import React from 'react'
import { getAppInfo } from '../utils/app-info'

export default function AppInfo() {
  const appInfo = getAppInfo()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Informations de l'application
            </h1>
            <div className="flex items-center space-x-2">
              <img 
                src="/Patou emeraude sans fond.png" 
                alt="Patou Logo" 
                className="h-8 w-auto"
              />
              <span className="text-lg font-semibold text-patou-main">Patou</span>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm font-mono">
              {JSON.stringify(appInfo, null, 2)}
            </pre>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-patou-main-50 rounded-lg p-4">
              <h3 className="font-semibold text-patou-main-700 mb-2">Version</h3>
              <p className="text-patou-main-600">{appInfo.appVersion}</p>
            </div>
            
            <div className="bg-protect-50 rounded-lg p-4">
              <h3 className="font-semibold text-protect-700 mb-2">Build</h3>
              <p className="text-protect-600 text-sm">
                {appInfo.buildTime}
              </p>
            </div>
            
            <div className="bg-share-50 rounded-lg p-4">
              <h3 className="font-semibold text-share-700 mb-2">Routes</h3>
              <p className="text-share-600">{appInfo.routes.length} routes</p>
            </div>
            
            <div className="bg-awaken-50 rounded-lg p-4">
              <h3 className="font-semibold text-awaken-700 mb-2">Host</h3>
              <p className="text-awaken-700 text-sm">{appInfo.host}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Fonctionnalités</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(appInfo.features).map(([feature, enabled]) => (
                <div 
                  key={feature}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    enabled ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <span className="font-medium text-gray-900 capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    enabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {enabled ? 'Activé' : 'Désactivé'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Routes disponibles</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {appInfo.routes.map((route) => (
                  <div key={route} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-patou-main rounded-full"></span>
                    <code className="text-sm text-gray-700">{route}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}