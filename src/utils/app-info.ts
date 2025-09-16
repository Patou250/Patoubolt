// Informations de l'application
export interface AppInfo {
  appVersion: string
  buildTime: string
  routes: string[]
  features: {
    spotify: boolean
    childArea: boolean
    parentArea: boolean
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
  '/parent/history',
  '/parent/insights',
  '/child/login',
  '/child',
  '/player'
]

// Génération des informations de l'application
export function getAppInfo(): AppInfo {
  return {
    appVersion: '0.1.0',
    buildTime: new Date().toISOString(),
    routes: APP_ROUTES,
    features: {
      spotify: true,
      childArea: true,
      parentArea: true
    }
  }
}