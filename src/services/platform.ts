import type { PlatformConfig } from '@/interfaces'

import apiClient from '@/plugins/axios'

class PlatformService {
  async getConfig (): Promise<PlatformConfig> {
    const response = await apiClient.get<PlatformConfig>('/platform/config/')
    return response.data
  }
}

export default new PlatformService()
