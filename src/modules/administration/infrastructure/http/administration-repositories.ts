import type {
  AdminNotificationRepository,
  AdminUserRepository,
  StorageRepository,
} from '@/modules/administration/application/ports/administration-repositories'
import type { AdminNotification, AdminUser, StorageUsage, UserQuota } from '@/modules/administration/domain/models'
import type { PaginatedResponse } from '@/shared/types/api'
import type { AxiosInstance } from 'axios'
import apiClient from '@/shared/http/api-client'

export class HttpAdminUserRepository implements AdminUserRepository {
  constructor (private readonly client: AxiosInstance = apiClient) {}

  async searchByUsername (username: string): Promise<AdminUser[]> {
    const response = await this.client.get<PaginatedResponse<AdminUser>>('/auth/users/', {
      params: { search: username },
    })
    return response.data.results || []
  }

  async getById (id: number): Promise<AdminUser> {
    const response = await this.client.get<AdminUser>(`/auth/users/${id}/`)
    return response.data
  }

  async getList (): Promise<AdminUser[]> {
    const response = await this.client.get<AdminUser[]>('/auth/users/admin_list/')
    return response.data
  }

  async toggleActive (id: number): Promise<AdminUser> {
    const response = await this.client.post<AdminUser>(`/auth/users/${id}/toggle_active/`)
    return response.data
  }

  async toggleAdmin (id: number): Promise<AdminUser> {
    const response = await this.client.post<AdminUser>(`/auth/users/${id}/toggle_admin/`)
    return response.data
  }

  async setQuota (id: number, quota: { max_apps?: number | null, max_services?: number | null }): Promise<AdminUser> {
    const response = await this.client.post<AdminUser>(`/auth/users/${id}/set_quota/`, quota)
    return response.data
  }

  async getMyQuota (): Promise<UserQuota> {
    const response = await this.client.get<UserQuota>('/auth/users/my_quota/')
    return response.data
  }
}

export class HttpStorageRepository implements StorageRepository {
  constructor (private readonly client: AxiosInstance = apiClient) {}

  async getUsage (forceRefresh = false): Promise<StorageUsage> {
    const response = await this.client.get<StorageUsage>('/admin-api/storage-usage/', {
      params: forceRefresh ? { refresh: '1' } : undefined,
    })
    return response.data
  }
}

export class HttpAdminNotificationRepository implements AdminNotificationRepository {
  constructor (private readonly client: AxiosInstance = apiClient) {}

  async list (unreadOnly = false): Promise<AdminNotification[]> {
    const response = await this.client.get<PaginatedResponse<AdminNotification>>('/admin-api/notifications/', {
      params: unreadOnly ? { unread: '1' } : undefined,
    })
    return response.data.results || []
  }

  async unreadCount (): Promise<number> {
    const response = await this.client.get<{ count: number }>('/admin-api/notifications/unread_count/')
    return response.data.count
  }

  async markRead (id: number): Promise<AdminNotification> {
    const response = await this.client.post<AdminNotification>(`/admin-api/notifications/${id}/read/`)
    return response.data
  }

  async markAllRead (): Promise<number> {
    const response = await this.client.post<{ updated: number }>('/admin-api/notifications/read_all/')
    return response.data.updated
  }
}

export const adminUserRepository = new HttpAdminUserRepository()
export const storageRepository = new HttpStorageRepository()
export const adminNotificationRepository = new HttpAdminNotificationRepository()
