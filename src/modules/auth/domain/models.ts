export interface AuthUser {
  id?: number
  username?: string
  email: string
  name?: string | null
  avatar_url: string | null
  is_superuser?: boolean
  is_fabric?: boolean
  is_active?: boolean
  date_joined?: string
  last_login?: string | null
  max_apps?: number | null
  max_services?: number | null
  apps_count?: number
  services_count?: number
  custom_max_apps?: number | null
  custom_max_services?: number | null
}
