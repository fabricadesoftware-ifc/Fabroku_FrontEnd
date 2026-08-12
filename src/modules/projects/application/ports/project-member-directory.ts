import type { AuthUser } from '@/modules/auth/domain/models'

export interface ProjectMemberDirectory {
  search: (query: string) => Promise<AuthUser[]>
}
