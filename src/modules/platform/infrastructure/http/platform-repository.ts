import type { PlatformRepository } from '@/modules/platform/application/ports/platform-repository'
import type { PlatformConfig } from '@/modules/platform/domain/models'
import type { AxiosInstance } from 'axios'
import apiClient from '@/shared/http/api-client'

export class HttpPlatformRepository implements PlatformRepository {
  constructor (private readonly client: AxiosInstance = apiClient) {}

  async getConfig (): Promise<PlatformConfig> {
    const response = await this.client.get<PlatformConfig>('/platform/config/')
    return response.data
  }
}

export const platformRepository = new HttpPlatformRepository()
