import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Cookies httpOnly sao enviados automaticamente.
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

function processQueue (error: Error | null) {
  for (const prom of failedQueue) {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  }
  failedQueue = []
}

function isAuthCheckRequest (
  request?: InternalAxiosRequestConfig & { _retry?: boolean },
) {
  return request?.url?.includes('/auth/check') ?? false
}

function isCallbackPage () {
  return ['/callback', '/callback/'].includes(window.location.pathname)
}

function shouldRedirectToLogin (
  request?: InternalAxiosRequestConfig & { _retry?: boolean },
) {
  return (
    window.location.pathname !== '/'
    && !isCallbackPage()
    && !isAuthCheckRequest(request)
  )
}

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    const isRefreshRoute = originalRequest.url?.includes('/auth/refresh')
    if (
      !error.response
      || error.response.status !== 401
      || originalRequest._retry
      || isRefreshRoute
    ) {
      if (
        (error.response?.status === 401)
        && shouldRedirectToLogin(originalRequest)
      ) {
        window.location.href = '/'
        return new Promise(() => {})
      }
      throw error
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(() => apiClient(originalRequest))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      await apiClient.post('/auth/refresh/')
      processQueue(null)

      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError as Error)
      isRefreshing = false

      if (shouldRedirectToLogin(originalRequest)) {
        window.location.href = '/'
        return new Promise(() => {})
      }
      throw refreshError
    } finally {
      isRefreshing = false
    }
  },
)

export default apiClient
