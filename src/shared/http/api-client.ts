import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { environment } from '@/app/config/environment'

const apiClient = axios.create({
  baseURL: environment.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

function processQueue (error: Error | null) {
  for (const promise of failedQueue) {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve()
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

    const isRefreshRoute = originalRequest?.url?.includes('/auth/refresh')
    if (
      !error.response
      || error.response.status !== 401
      || originalRequest?._retry
      || isRefreshRoute
    ) {
      if (error.response?.status === 401 && shouldRedirectToLogin(originalRequest)) {
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
