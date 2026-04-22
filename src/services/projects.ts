import type { Project, Response } from '@/interfaces'
import apiClient from '@/plugins/axios'

class ProjectsService {
  async getProjects (): Promise<Response<Project>> {
    const response = await apiClient.get('/projects/projects/')
    return response.data
  }

  async getProject (id: string): Promise<Project> {
    const response = await apiClient.get(`/projects/projects/${id}/`)
    return response.data
  }

  async createProject (data: any): Promise<Project> {
    const response = await apiClient.post('/projects/projects/', data)
    return response.data
  }

  async updateProject (id: string, data: any): Promise<Project> {
    const response = await apiClient.patch(`/projects/projects/${id}/`, data)
    return response.data
  }

  async deleteProject (id: string) {
    const response = await apiClient.delete(`/projects/projects/${id}/`)
    return response.data
  }
}
export default new ProjectsService()
