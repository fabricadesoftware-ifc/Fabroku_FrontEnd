import type { Project } from '@/interfaces'

import { defineStore } from 'pinia'
import { ref } from 'vue'

import ProjectsService from '@/services/projects'

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Buscar todos os projetos
  const fetchProjects = async () => {
    loading.value = true
    error.value = null
    try {
      projects.value = await ProjectsService.getAllProjects()
      return projects.value
    } catch (error_) {
      error.value = 'Erro ao carregar projetos'
      console.error('Erro ao buscar projetos:', error_)
      throw error_
    } finally {
      loading.value = false
    }
  }

  // Buscar um projeto específico
  const fetchProject = async (projectId: string) => {
    loading.value = true
    error.value = null
    try {
      currentProject.value = await ProjectsService.getProject(projectId)
      return currentProject.value
    } catch (error_) {
      error.value = 'Erro ao carregar projeto'
      console.error('Erro ao buscar projeto:', error_)
      throw error_
    } finally {
      loading.value = false
    }
  }

  // Criar novo projeto
  const createProject = async (
    project: Omit<Project, 'id' | 'created_at' | 'updated_at'>,
  ) => {
    loading.value = true
    error.value = null
    try {
      const newProject = await ProjectsService.createProject(project)
      projects.value.push(newProject)
      return newProject
    } catch (error_) {
      error.value = 'Erro ao criar projeto'
      console.error('Erro ao criar projeto:', error_)
      throw error_
    } finally {
      loading.value = false
    }
  }

  // Atualizar projeto
  const updateProject = async (projectId: string, data: Partial<Project>) => {
    loading.value = true
    error.value = null
    try {
      const updatedProject = await ProjectsService.updateProject(
        projectId,
        data,
      )
      const index = projects.value.findIndex(p => p.id === projectId)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
      if (currentProject.value?.id === projectId) {
        currentProject.value = updatedProject
      }
      return updatedProject
    } catch (error_) {
      error.value = 'Erro ao atualizar projeto'
      console.error('Erro ao atualizar projeto:', error_)
      throw error_
    } finally {
      loading.value = false
    }
  }

  // Deletar projeto
  const deleteProject = async (projectId: string) => {
    loading.value = true
    error.value = null
    try {
      await ProjectsService.deleteProject(projectId)
      projects.value = projects.value.filter(p => p.id !== projectId)
      if (currentProject.value?.id === projectId) {
        currentProject.value = null
      }
    } catch (error_) {
      error.value = 'Erro ao deletar projeto'
      console.error('Erro ao deletar projeto:', error_)
      throw error_
    } finally {
      loading.value = false
    }
  }

  return {
    projects,
    currentProject,
    loading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
  }
})
