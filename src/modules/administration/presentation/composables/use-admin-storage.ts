import type { StorageRepository } from '@/modules/administration/application/ports/administration-repositories'
import type { StorageUsage } from '@/modules/administration/domain/models'
import { ref } from 'vue'
import { GetStorageUsage } from '@/modules/administration/application/use-cases/administration-use-cases'

export function useAdminStorage (repository: StorageRepository) {
  const usage = ref<StorageUsage | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const getUsage = new GetStorageUsage(repository)

  async function fetch (forceRefresh = false) {
    loading.value = true
    error.value = null
    try {
      usage.value = await getUsage.execute(forceRefresh)
      return usage.value
    } catch (error_) {
      error.value = error_ instanceof Error ? error_.message : 'Erro ao carregar uso de espaço'
      throw error_
    } finally {
      loading.value = false
    }
  }

  return { error, fetch, loading, usage }
}
