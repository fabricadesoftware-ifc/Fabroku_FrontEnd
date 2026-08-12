import type { CreateProjectInput, Project, UpdateProjectInput } from '@/modules/projects/domain/models'
import type { PaginatedResponse } from '@/shared/types/api'

export interface ProjectRepository {
  getPage: () => Promise<PaginatedResponse<Project>>
  getAll: () => Promise<Project[]>
  getById: (id: string) => Promise<Project>
  create: (input: CreateProjectInput) => Promise<Project>
  update: (id: string, input: UpdateProjectInput) => Promise<Project>
  remove: (id: string) => Promise<unknown>
}
