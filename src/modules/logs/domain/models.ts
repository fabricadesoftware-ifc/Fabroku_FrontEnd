export type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'DOKKU'
export type LogCategory
  = | 'SYSTEM'
    | 'CREATE'
    | 'DEPLOY'
    | 'CONFIG'
    | 'GIT'
    | 'DATABASE'
    | 'DOMAIN'
    | 'SSL'

export interface AppLog {
  id?: number
  app: number
  task_id?: string | null
  message: string
  level: LogLevel
  level_display?: string
  category: LogCategory
  category_display?: string
  metadata?: Record<string, unknown>
  progress?: number
  created_at?: string
}

export interface LogFilters {
  app?: number
  task_id?: string
  level?: LogLevel
  category?: LogCategory
  progress?: number
  page?: number
}

export interface RuntimeLogs {
  lines: string[]
}
