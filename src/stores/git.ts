import type { GitRepo } from '@/modules/git/domain/models'

import { defineStore } from 'pinia'
import { ref } from 'vue'

import { ListRepositories } from '@/modules/git'
import { gitRepository } from '@/modules/git/infrastructure/http/git-repository'

export const useGitStore = defineStore('git', () => {
  const repos = ref<GitRepo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const listRepositories = new ListRepositories(gitRepository)

  // Buscar repositórios do GitHub do usuário
  const fetchRepos = async () => {
    loading.value = true
    error.value = null
    try {
      repos.value = await listRepositories.execute()
      return repos.value
    } catch (error_) {
      error.value = 'Erro ao carregar repositórios'
      console.error('Erro ao buscar repositórios:', error_)
      throw error_
    } finally {
      loading.value = false
    }
  }

  // Limpar repositórios
  const clearRepos = () => {
    repos.value = []
  }

  return {
    repos,
    loading,
    error,
    fetchRepos,
    clearRepos,
  }
})
