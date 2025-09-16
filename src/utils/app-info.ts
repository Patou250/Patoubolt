// Informations de l'application
export interface AppInfo {
  appVersion: string
  buildTime: string
  routerPaths: string[]
  features: {
    spotifySdk: boolean
    childArea: boolean
    parentArea: boolean
  }
  env: {
    host: string
  }
}

// Liste des routes déclarées dans l'application
export const APP_ROUTES = [
  '/',
  '/parent/login',
  '/parent/callback',
  '/parent/dashboard',
  '/parent/children',
  '/parent/rules/:childId',
  '/parent/curation',
  '/parent/insights',
  '/parent/history',
  '/child/login',
  '/child',
  '/player'
]

// Génération des informations de l'application
export function getAppInfo(): AppInfo {
  return {
    appVersion: import.meta.env.VITE_COMMIT || 'dev',
    buildTime: new Date().toISOString(),
    routerPaths: APP_ROUTES,
    features: {
      spotifySdk: true,
      childArea: true,
      parentArea: true
    },
    env: {
      host: typeof window !== 'undefined' ? window.location.host : 'unknown'
    }
  }
}