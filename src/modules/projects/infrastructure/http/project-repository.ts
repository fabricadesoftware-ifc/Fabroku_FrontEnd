import type { ProjectRepository } from '@/modules/projects/application/ports/project-repository'
import type { CreateProjectInput, Project, UpdateProjectInput } from '@/modules/projects/domain/models'
import type { PaginatedResponse } from '@/shared/types/api'
import type { AxiosInstance, AxiosResponse } from 'axios'
import apiClient from '@/shared/http/api-client'

export class HttpProjectRepository implements ProjectRepository {
  constructor (private readonly client: AxiosInstance = apiClient) {}

  async getPage (): Promise<PaginatedResponse<Project>> {
    const response = await this.client.get<PaginatedResponse<Project>>('/projects/projects/')
    return response.data
  }

  async getAll (): Promise<Project[]> {
    const projects: Project[] = []
    let nextUrl: string | null = '/projects/projects/'

    while (nextUrl) {
      const response: AxiosResponse<PaginatedResponse<Project>> = await this.client.get(nextUrl)
      projects.push(...response.data.results)
      nextUrl = response.data.next
    }

    return projects
  }

  async getById (id: string): Promise<Project> {
    const response = await this.client.get<Project>(`/projects/projects/${id}/`)
    return response.data
  }

  async create (input: CreateProjectInput): Promise<Project> {
    const response = await this.client.post<Project>('/projects/projects/', input)
    return response.data
  }

  async update (id: string, input: UpdateProjectInput): Promise<Project> {
    const response = await this.client.patch<Project>(`/projects/projects/${id}/`, input)
    return response.data
  }

  async remove (id: string): Promise<unknown> {
    const response = await this.client.delete(`/projects/projects/${id}/`)
    return response.data
  }
}

export const projectRepository = new HttpProjectRepository()
