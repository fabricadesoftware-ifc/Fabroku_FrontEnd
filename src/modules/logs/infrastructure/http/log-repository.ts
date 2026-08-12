import type { LogRepository } from '@/modules/logs/application/ports/log-repository'
import type { AppLog, LogFilters, RuntimeLogs } from '@/modules/logs/domain/models'
import type { PaginatedResponse } from '@/shared/types/api'
import type { AxiosInstance } from 'axios'
import apiClient from '@/shared/http/api-client'

export class HttpLogRepository implements LogRepository {
  constructor (private readonly client: AxiosInstance = apiClient) {}

  async getPage (filters?: LogFilters): Promise<PaginatedResponse<AppLog>> {
    const response = await this.client.get<PaginatedResponse<AppLog>>('/logs/', { params: filters })
    return response.data
  }

  async getById (id: number): Promise<AppLog> {
    const response = await this.client.get<AppLog>(`/logs/${id}/`)
    return response.data
  }

  async streamTask (taskId: string, afterId?: number): Promise<AppLog[]> {
    const response = await this.client.get<{ logs?: AppLog[] } | AppLog[]>(`/logs/stream/${taskId}/`, {
      params: afterId === undefined ? undefined : { after: afterId },
    })
    if (Array.isArray(response.data)) {
      return response.data
    }

    return response.data.logs ?? []
  }

  async getRuntime (appId: number, num?: number): Promise<RuntimeLogs> {
    const response = await this.client.get<RuntimeLogs>('/logs/app-runtime/', {
      params: { app: appId, ...(num ? { num } : {}) },
    })
    return response.data
  }

  getRuntimeStreamUrl (appId: number, tail = 200): string {
    const rawBaseUrl = this.client.defaults.baseURL || '/api'
    const baseUrl = rawBaseUrl.startsWith('http')
      ? rawBaseUrl
      : `${window.location.origin}${rawBaseUrl}`
    const url = new URL(`${baseUrl.replace(/\/$/, '')}/logs/app-runtime-stream/`)
    url.searchParams.set('app', appId.toString())
    url.searchParams.set('tail', tail.toString())
    return url.toString()
  }
}

export const logRepository = new HttpLogRepository()
