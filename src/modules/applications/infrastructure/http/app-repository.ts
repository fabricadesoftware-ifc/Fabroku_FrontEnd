import type { AppRepository } from '@/modules/applications/application/ports/app-repository'
import type {
  App,
  AppProcessScale,
  LastCommit,
  TaskStatus,
  UpdateEnvVarsResult,
} from '@/modules/applications/domain/models'
import type { PaginatedResponse, TaskResult } from '@/shared/types/api'
import type { AxiosInstance } from 'axios'
import apiClient from '@/shared/http/api-client'

export class HttpAppRepository implements AppRepository {
  constructor (private readonly client: AxiosInstance = apiClient) {}

  async getAll (): Promise<PaginatedResponse<App>> {
    const response = await this.client.get<PaginatedResponse<App>>('/apps/apps/')
    return response.data
  }

  async getByProject (projectId: string): Promise<PaginatedResponse<App>> {
    const response = await this.client.get<PaginatedResponse<App>>('/apps/apps/', { params: { project: projectId } })
    return response.data
  }

  async getById (id: string): Promise<App> {
    const response = await this.client.get<App>(`/apps/apps/${id}/`)
    return response.data
  }

  async create (input: App): Promise<App> {
    const response = await this.client.post<App>('/apps/apps/', input)
    return response.data
  }

  async update (id: string, input: App): Promise<App> {
    const response = await this.client.put<App>(`/apps/apps/${id}/`, input)
    return response.data
  }

  async patch (id: string, input: Partial<App>): Promise<App> {
    const response = await this.client.patch<App>(`/apps/apps/${id}/`, input)
    return response.data
  }

  async updateEnvVars (id: string, variables: Record<string, string>): Promise<UpdateEnvVarsResult> {
    const response = await this.client.patch<UpdateEnvVarsResult>(`/apps/apps/${id}/env_vars/`, {
      variables,
      restart: true,
    })
    return response.data
  }

  async remove (id: string): Promise<TaskResult> {
    const response = await this.client.delete<TaskResult>(`/apps/apps/${id}/`)
    return response.data
  }

  async getStatus (id: string): Promise<TaskStatus> {
    const response = await this.client.get<TaskStatus>(`/apps/apps/${id}/get_app_status/`)
    return response.data
  }

  async start (id: string): Promise<App> {
    const response = await this.client.post<App>(`/apps/apps/${id}/start/`)
    return response.data
  }

  async stop (id: string): Promise<App> {
    const response = await this.client.post<App>(`/apps/apps/${id}/stop/`)
    return response.data
  }

  async restart (id: string): Promise<App> {
    const response = await this.client.post<App>(`/apps/apps/${id}/restart/`)
    return response.data
  }

  async getProcesses (id: string, refresh = false): Promise<{ processes: AppProcessScale[], max_instances: number }> {
    const response = await this.client.get(`/apps/apps/${id}/processes/`, { params: { refresh } })
    return response.data
  }

  async scaleProcesses (id: string, processes: Record<string, number>): Promise<TaskResult> {
    const response = await this.client.post<TaskResult>(`/apps/apps/${id}/scale_processes/`, { processes })
    return response.data
  }

  async redeploy (id: string, commit?: string): Promise<TaskResult> {
    const response = await this.client.post<TaskResult>(`/apps/apps/${id}/redeploy/`, { commit })
    return response.data
  }

  async runCommand (id: string, command: string): Promise<TaskResult> {
    const response = await this.client.post<TaskResult>(`/apps/apps/${id}/run_command/`, { command })
    return response.data
  }

  async getAllowedCommands (id: string): Promise<{ commands: string[], prefixes: string[] }> {
    const response = await this.client.get(`/apps/apps/${id}/allowed_commands/`)
    return response.data
  }

  async checkName (name: string): Promise<{ available: boolean, name?: string, reason?: string }> {
    const response = await this.client.get('/apps/apps/check_name/', { params: { name } })
    return response.data
  }

  async getLastCommit (id: number): Promise<LastCommit | { error: string }> {
    const response = await this.client.get<LastCommit | { error: string }>(`/apps/apps/${id}/last_commit/`)
    return response.data
  }
}

export const appRepository = new HttpAppRepository()
