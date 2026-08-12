import type { GitRepository } from '@/modules/git/application/ports/git-repository'
import type { GitRepo } from '@/modules/git/domain/models'
import type { AxiosInstance } from 'axios'
import apiClient from '@/shared/http/api-client'

export class HttpGitRepository implements GitRepository {
  constructor (private readonly client: AxiosInstance = apiClient) {}

  async getRepos (): Promise<GitRepo[]> {
    const response = await this.client.get<GitRepo[]>('/git/repos')
    return response.data
  }
}

export const gitRepository = new HttpGitRepository()
