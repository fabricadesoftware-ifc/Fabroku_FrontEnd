import { ref } from 'vue'

import { AppError } from '@/shared/errors/app-error'

export function useAsyncState () {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function execute<T> (operation: () => Promise<T>, fallbackMessage: string): Promise<T> {
    loading.value = true
    error.value = null

    try {
      return await operation()
    } catch (error_) {
      error.value = error_ instanceof AppError ? error_.message : fallbackMessage
      throw error_
    } finally {
      loading.value = false
    }
  }

  function clearError () {
    error.value = null
  }

  return { loading, error, execute, clearError }
}
