export interface AppEnvironment {
  apiBaseUrl: string
}

export const environment: AppEnvironment = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
}
