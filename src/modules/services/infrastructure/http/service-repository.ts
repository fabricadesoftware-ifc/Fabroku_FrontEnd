import type { TaskStatus } from '@/modules/applications/domain/models'
import type { ServiceRepository } from '@/modules/services/application/ports/service-repository'
import type { CreateServiceInput, Service } from '@/modules/services/domain/models'
import type { PaginatedResponse } from '@/shared/types/api'
import type { AxiosInstance } from 'axios'
import apiClient from '@/shared/http/api-client'

export class HttpServiceRepository implements ServiceRepository {
  constructor (private readonly client: AxiosInstance = apiClient) {}

  async getByApp (appId: number): Promise<PaginatedResponse<Service>> {
    const response = await this.client.get<PaginatedResponse<Service>>('/apps/services/', {
      params: { app: appId },
    })
    return response.data
  }

  async getByProject (projectId: string): Promise<PaginatedResponse<Service>> {
    const response = await this.client.get<PaginatedResponse<Service>>('/apps/services/', {
      params: { project: projectId },
    })
    return response.data
  }

  async create (input: CreateServiceInput): Promise<Service> {
    const response = await this.client.post<Service>('/apps/services/', input)
    return response.data
  }

  async remove (id: number): Promise<Pick<{ task_id: string }, 'task_id'>> {
    const response = await this.client.delete(`/apps/services/${id}/`)
    return response.data
  }

  async link (serviceId: number, appId: number): Promise<Pick<{ task_id: string }, 'task_id'>> {
    const response = await this.client.post(`/apps/services/${serviceId}/link/`, { app_id: appId })
    return response.data
  }

  async unlink (serviceId: number): Promise<Pick<{ task_id: string }, 'task_id'>> {
    const response = await this.client.post(`/apps/services/${serviceId}/unlink/`)
    return response.data
  }

  async getStatus (serviceId: number): Promise<TaskStatus> {
    const response = await this.client.get<TaskStatus>(`/apps/services/${serviceId}/get_service_status/`)
    return response.data
  }
}

export const serviceRepository = new HttpServiceRepository()
