import type { AdminNotification, AdminUser, StorageUsage, UserQuota } from '@/modules/administration/domain/models'

export interface AdminUserRepository {
  searchByUsername: (username: string) => Promise<AdminUser[]>
  getById: (id: number) => Promise<AdminUser>
  getList: () => Promise<AdminUser[]>
  toggleActive: (id: number) => Promise<AdminUser>
  toggleAdmin: (id: number) => Promise<AdminUser>
  setQuota: (id: number, quota: { max_apps?: number | null, max_services?: number | null }) => Promise<AdminUser>
  getMyQuota: () => Promise<UserQuota>
}

export interface StorageRepository {
  getUsage: (forceRefresh?: boolean) => Promise<StorageUsage>
}

export interface AdminNotificationRepository {
  list: (unreadOnly?: boolean) => Promise<AdminNotification[]>
  unreadCount: () => Promise<number>
  markRead: (id: number) => Promise<AdminNotification>
  markAllRead: () => Promise<number>
}
