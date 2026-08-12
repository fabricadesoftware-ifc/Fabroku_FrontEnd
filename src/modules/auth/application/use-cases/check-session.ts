import type { AuthRepository } from '@/modules/auth/application/ports/auth-repository'
import type { AuthUser } from '@/modules/auth/domain/models'

export class CheckSession {
  constructor (private readonly repository: AuthRepository) {}

  execute (): Promise<AuthUser> {
    return this.repository.checkSession()
  }
}
