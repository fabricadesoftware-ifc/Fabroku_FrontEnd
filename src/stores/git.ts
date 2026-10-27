import type { GitRepo } from '@/modules/git/domain/models'

import { defineStore } from 'pinia'
import { ref } from 'vue'

import { ListBranches, ListRepositories } from '@/modules/git'
import { gitRepository } from '@/modules/git/infrastructure/http/git-repository'

export const useGitStore = defineStore('git', () => {
  const repos = ref<GitRepo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const listRepositories = new ListRepositories(gitRepository)
  const listBranches = new ListBranches(gitRepository)
  const branches = ref<string[]>([])
  const branchesLoading = ref(false)
  let branchesRequest = 0

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

  // Buscar branches reais do repositório selecionado
  const fetchBranches = async (repoFullName: string) => {
    // Troca rápida de repo: só a resposta do último pedido vale.
    const request = ++branchesRequest
    branchesLoading.value = true
    branches.value = []
    try {
      const result = await listBranches.execute(repoFullName)
      if (request === branchesRequest) {
        branches.value = result
      }
    } catch (error_) {
      console.error('Erro ao buscar branches:', error_)
    } finally {
      if (request === branchesRequest) {
        branchesLoading.value = false
      }
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
    branches,
    branchesLoading,
    fetchBranches,
  }
})
