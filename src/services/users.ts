import type { Response, User } from '@/interfaces'

import apiClient from '@/plugins/axios'

class UsersService {
  async searchByUsername (username: string): Promise<User[]> {
    const response = await apiClient.get<Response<User>>('/auth/users/', {
      params: { search: username },
    })
    return response.data.results || []
  }

  async getUser (id: number): Promise<User> {
    const response = await apiClient.get<User>(`/auth/users/${id}/`)
    return response.data
  }

  async getAdminList (): Promise<User[]> {
    const response = await apiClient.get<User[]>('/auth/users/admin_list/')
    return response.data
  }

  async toggleActive (id: number): Promise<User> {
    const response = await apiClient.post<User>(
      `/auth/users/${id}/toggle_active/`,
    )
    return response.data
  }

  async setQuota (
    id: number,
    quota: { max_apps?: number | null, max_services?: number | null },
  ): Promise<User> {
    const response = await apiClient.post<User>(
      `/auth/users/${id}/set_quota/`,
      quota,
    )
    return response.data
  }

  async getMyQuota (): Promise<{
    max_apps: number | null
    max_services: number | null
    apps_count: number
    services_count: number
    can_create_app: boolean
    can_create_service: boolean
  }> {
    const response = await apiClient.get('/auth/users/my_quota/')
    return response.data
  }
}

export default new UsersService()
