import type { AuthUser as User } from '@/modules/auth/domain/models'

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { CheckSession, Login, Logout } from '@/modules/auth'
import { authNavigator } from '@/modules/auth/infrastructure/browser-auth-navigator'
import { authRepository } from '@/modules/auth/infrastructure/http/auth-repository'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const checkSession = new CheckSession(authRepository)
  const loginUseCase = new Login(authNavigator)
  const logoutUseCase = new Logout(authRepository)

  // Com cookies httpOnly, verificamos autenticação via endpoint /auth/check/
  const isAuthenticated = computed(() => !!user.value)

  // Verifica se está autenticado (chama o backend)
  const checkAuth = async (): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      user.value = await checkSession.execute() as User
      return true
    } catch (error_) {
      user.value = null
      error.value = error_ instanceof Error ? error_.message : 'Não foi possível verificar a sessão'
      return false
    } finally {
      loading.value = false
    }
  }

  // Redireciona para login do GitHub
  const login = () => {
    loginUseCase.execute()
  }

  // Logout - remove cookies no backend
  const logout = async () => {
    try {
      await logoutUseCase.execute()
    } catch (error_) {
      console.error('Erro no logout:', error_)
    } finally {
      user.value = null
      window.location.href = '/'
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    checkAuth,
    logout,
    login,
  }
})
