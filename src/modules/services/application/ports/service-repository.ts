import type { TaskStatus } from '@/modules/applications/domain/models'
import type { CreateServiceInput, Service } from '@/modules/services/domain/models'
import type { PaginatedResponse, TaskResult } from '@/shared/types/api'

export interface ServiceRepository {
  getByApp: (appId: number) => Promise<PaginatedResponse<Service>>
  getByProject: (projectId: string) => Promise<PaginatedResponse<Service>>
  create: (input: CreateServiceInput) => Promise<Service>
  remove: (id: number) => Promise<Pick<TaskResult, 'task_id'>>
  link: (serviceId: number, appId: number) => Promise<Pick<TaskResult, 'task_id'>>
  unlink: (serviceId: number) => Promise<Pick<TaskResult, 'task_id'>>
  getStatus: (serviceId: number) => Promise<TaskStatus>
}
