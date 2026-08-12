import type { AuthNavigator } from '@/modules/auth/application/ports/auth-repository'
import { environment } from '@/app/config/environment'

export class BrowserAuthNavigator implements AuthNavigator {
  goToLogin (): void {
    window.location.href = `${environment.apiBaseUrl}/auth/github/login/`
  }
}

export const authNavigator = new BrowserAuthNavigator()
