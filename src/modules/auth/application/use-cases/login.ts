import type { AuthNavigator } from '@/modules/auth/application/ports/auth-repository'

export class Login {
  constructor (private readonly navigator: AuthNavigator) {}

  execute (): void {
    this.navigator.goToLogin()
  }
}
