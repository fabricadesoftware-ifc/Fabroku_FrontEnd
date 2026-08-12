import type { AuthUser } from '@/modules/auth/domain/models'
import type { ProjectMemberDirectory } from '@/modules/projects/application/ports/project-member-directory'
import type { PaginatedResponse } from '@/shared/types/api'
import type { AxiosInstance } from 'axios'
import apiClient from '@/shared/http/api-client'

export class HttpProjectMemberDirectory implements ProjectMemberDirectory {
  constructor (private readonly client: AxiosInstance = apiClient) {}

  async search (query: string): Promise<AuthUser[]> {
    const response = await this.client.get<PaginatedResponse<AuthUser>>('/auth/users/', {
      params: { search: query },
    })
    return response.data.results || []
  }
}

export const projectMemberDirectory = new HttpProjectMemberDirectory()
