import type { AuthRepository } from '@/modules/auth/application/ports/auth-repository'
import type { AuthUser } from '@/modules/auth/domain/models'
import type { AxiosInstance } from 'axios'
import { AppError } from '@/shared/errors/app-error'
import apiClient from '@/shared/http/api-client'

function toAuthError (error: unknown): AppError {
  const status = typeof error === 'object' && error !== null && 'response' in error
    ? (error.response as { status?: number } | undefined)?.status
    : undefined

  return new AppError('Não foi possível concluir a operação de autenticação.', {
    kind: status === 401 ? 'authentication' : 'network',
    status,
    cause: error,
  })
}

export class HttpAuthRepository implements AuthRepository {
  constructor (private readonly client: AxiosInstance = apiClient) {}

  async checkSession (): Promise<AuthUser> {
    try {
      const response = await this.client.get<{ user?: AuthUser } | AuthUser>('/auth/check/')
      if ('user' in response.data && response.data.user) {
        return response.data.user
      }
      return response.data as AuthUser
    } catch (error) {
      throw toAuthError(error)
    }
  }

  async getCurrentUser (): Promise<AuthUser> {
    try {
      const response = await this.client.get<AuthUser>('/auth/users/me/')
      return response.data
    } catch (error) {
      throw toAuthError(error)
    }
  }

  async logout (): Promise<void> {
    try {
      await this.client.post('/auth/logout/')
    } catch (error) {
      throw toAuthError(error)
    }
  }

  async refresh (refreshToken?: string): Promise<unknown> {
    try {
      const response = await this.client.post('/token/refresh/', refreshToken ? { refresh: refreshToken } : undefined)
      return response.data
    } catch (error) {
      throw toAuthError(error)
    }
  }
}

export const authRepository = new HttpAuthRepository()
