import type { AppLog, LogCategory, LogLevel, Response } from '@/interfaces'

import apiClient from '@/plugins/axios'

interface LogFilters {
  app?: number
  task_id?: string
  level?: LogLevel
  category?: LogCategory
  progress?: number
  page?: number
}

class LogsService {
  async getLogs (filters?: LogFilters): Promise<Response<AppLog>> {
    const params = new URLSearchParams()
    if (filters?.app) {
      params.append('app', filters.app.toString())
    }
    if (filters?.task_id) {
      params.append('task_id', filters.task_id)
    }
    if (filters?.level) {
      params.append('level', filters.level)
    }
    if (filters?.category) {
      params.append('category', filters.category)
    }
    if (filters?.progress) {
      params.append('progress', filters.progress.toString())
    }
    if (filters?.page) {
      params.append('page', filters.page.toString())
    }

    const response = await apiClient.get(`/logs/?${params.toString()}`)
    return response.data
  }

  async getLog (id: number): Promise<AppLog> {
    const response = await apiClient.get(`/logs/${id}/`)
    return response.data
  }

  async streamLogs (taskId: string, afterId?: number): Promise<AppLog[]> {
    const params = afterId ? `?after=${afterId}` : ''
    const response = await apiClient.get(`/logs/stream/${taskId}/${params}`)
    return response.data.logs ?? response.data
  }

  async getAppRuntimeLogs (appId: number, num?: number): Promise<{ lines: string[] }> {
    const params = new URLSearchParams({ app: appId.toString() })
    if (num) {
      params.append('num', num.toString())
    }
    const response = await apiClient.get(`/logs/app-runtime/?${params.toString()}`)
    return response.data
  }
}

export default new LogsService()
