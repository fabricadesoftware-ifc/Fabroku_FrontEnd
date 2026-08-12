import type { AuthRepository } from '@/modules/auth/application/ports/auth-repository'

export class Logout {
  constructor (private readonly repository: AuthRepository) {}

  execute (): Promise<void> {
    return this.repository.logout()
  }
}
