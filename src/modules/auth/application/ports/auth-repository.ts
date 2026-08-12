import type { AuthUser } from '@/modules/auth/domain/models'

export interface AuthRepository {
  checkSession: () => Promise<AuthUser>
  getCurrentUser: () => Promise<AuthUser>
  logout: () => Promise<void>
  refresh: (refreshToken?: string) => Promise<unknown>
}

export interface AuthNavigator {
  goToLogin: () => void
}
