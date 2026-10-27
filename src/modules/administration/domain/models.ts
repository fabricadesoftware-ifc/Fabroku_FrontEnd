export interface AdminUser {
  id: number
  username?: string
  email: string
  name?: string | null
  avatar_url: string | null
  is_superuser?: boolean
  is_fabric?: boolean
  is_active?: boolean
  max_apps?: number | null
  max_services?: number | null
  apps_count?: number
  services_count?: number
  custom_max_apps?: number | null
  custom_max_services?: number | null
}

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

export interface StorageUsage {
  services: StorageService[]
  total_bytes: number
  total_formatted: string
}

export interface UserQuota {
  max_apps: number | null
  max_services: number | null
  apps_count: number
  services_count: number
  can_create_app: boolean
  can_create_service: boolean
}

export type AdminNotificationEvent = 'app_delete_failed' | 'service_delete_failed'

export interface AdminNotification {
  id: number
  event_type: AdminNotificationEvent
  event_display: string
  level: string
  title: string
  message: string
  app: number | null
  app_name: string | null
  project_id: string | null
  service: number | null
  service_name: string | null
  metadata: Record<string, unknown>
  created_at: string
  read_at: string | null
}
