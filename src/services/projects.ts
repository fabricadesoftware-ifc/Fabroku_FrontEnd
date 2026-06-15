import type { Project, Response } from '@/interfaces'
import type { AxiosResponse } from 'axios'
import apiClient from '@/plugins/axios'

class ProjectsService {
  async getProjects (): Promise<Response<Project>> {
    const response = await apiClient.get('/projects/projects/')
    return response.data
  }

  async getAllProjects (): Promise<Project[]> {
    const projects: Project[] = []
    let nextUrl: string | null = '/projects/projects/'

    while (nextUrl) {
      const response: AxiosResponse<Response<Project>> = await apiClient.get(nextUrl)
      projects.push(...response.data.results)
      nextUrl = response.data.next
    }

    return projects
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
