import type { AppLog, LogFilters, RuntimeLogs } from '../../domain/models'
import type { LogRepository } from '../ports/log-repository'
import type { PaginatedResponse } from '@/shared/types/api'

export class ListLogs {
  constructor (private readonly repository: LogRepository) {}

  execute (filters?: LogFilters): Promise<PaginatedResponse<AppLog>> {
    return this.repository.getPage(filters)
  }
}

export class GetLog {
  constructor (private readonly repository: LogRepository) {}

  execute (id: number): Promise<AppLog> {
    return this.repository.getById(id)
  }
}

export class StreamTaskLogs {
  constructor (private readonly repository: LogRepository) {}

  execute (taskId: string, afterId?: number): Promise<AppLog[]> {
    return this.repository.streamTask(taskId, afterId)
  }
}

export class GetRuntimeLogs {
  constructor (private readonly repository: LogRepository) {}

  execute (appId: number, num?: number): Promise<RuntimeLogs> {
    return this.repository.getRuntime(appId, num)
  }
}

export class GetRuntimeLogStreamUrl {
  constructor (private readonly repository: LogRepository) {}

  execute (appId: number, tail?: number): string {
    return this.repository.getRuntimeStreamUrl(appId, tail)
  }
}
