import type {
  App,
  AppProcessScale,
  LastCommit,
  TaskStatus,
  UpdateEnvVarsResult,
} from '@/modules/applications/domain/models'
import type { PaginatedResponse, TaskResult } from '@/shared/types/api'

export interface AppRepository {
  getAll: () => Promise<PaginatedResponse<App>>
  getByProject: (projectId: string) => Promise<PaginatedResponse<App>>
  getById: (id: string) => Promise<App>
  create: (input: App) => Promise<App>
  update: (id: string, input: App) => Promise<App>
  patch: (id: string, input: Partial<App>) => Promise<App>
  updateEnvVars: (id: string, variables: Record<string, string>) => Promise<UpdateEnvVarsResult>
  remove: (id: string) => Promise<TaskResult>
  getStatus: (id: string) => Promise<TaskStatus>
  start: (id: string) => Promise<App>
  stop: (id: string) => Promise<App>
  restart: (id: string) => Promise<App>
  getProcesses: (id: string, refresh?: boolean) => Promise<{ processes: AppProcessScale[], max_instances: number }>
  scaleProcesses: (id: string, processes: Record<string, number>) => Promise<TaskResult>
  redeploy: (id: string, commit?: string) => Promise<TaskResult>
  runCommand: (id: string, command: string) => Promise<TaskResult>
  getAllowedCommands: (id: string) => Promise<{ commands: string[], prefixes: string[] }>
  checkName: (name: string) => Promise<{ available: boolean, name?: string, reason?: string }>
  getLastCommit: (id: number) => Promise<LastCommit | { error: string }>
}
