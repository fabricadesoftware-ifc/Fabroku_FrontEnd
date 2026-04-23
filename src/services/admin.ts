import apiClient from '@/plugins/axios'

export interface StorageService {
  service_id: number
  service_name: string
  container_name: string | null
  project_id: string | null
  project_name: string
  app_id: number | null
  app_name: string | null
  size_bytes: number | null
  size_formatted: string
}

export interface StorageUsageResponse {
  services: StorageService[]
  total_bytes: number
  total_formatted: string
}

class AdminService {
  async getStorageUsage (forceRefresh = false): Promise<StorageUsageResponse> {
    const response = await apiClient.get<StorageUsageResponse>('/admin-api/storage-usage/', {
      params: forceRefresh ? { refresh: '1' } : undefined,
    })
    return response.data
  }
}

export default new AdminService()
