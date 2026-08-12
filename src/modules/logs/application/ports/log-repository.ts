import type { AppLog, LogFilters, RuntimeLogs } from '@/modules/logs/domain/models'
import type { PaginatedResponse } from '@/shared/types/api'

export interface LogRepository {
  getPage: (filters?: LogFilters) => Promise<PaginatedResponse<AppLog>>
  getById: (id: number) => Promise<AppLog>
  streamTask: (taskId: string, afterId?: number) => Promise<AppLog[]>
  getRuntime: (appId: number, num?: number) => Promise<RuntimeLogs>
  getRuntimeStreamUrl: (appId: number, tail?: number) => string
}
