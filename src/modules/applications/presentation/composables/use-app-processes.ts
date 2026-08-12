import type { AppRepository } from '@/modules/applications/application/ports/app-repository'
import type { AppProcessScale } from '@/modules/applications/domain/models'

import { ref } from 'vue'

import {
  GetApplicationProcesses,
  ScaleApplicationProcesses,
} from '@/modules/applications/application/use-cases/application-use-cases'
import { getHttpErrorData } from '@/shared/errors/http-error'

interface ProcessOptions {
  repository: AppRepository
  appId: string
  canManage: () => boolean
  waitForTask: (taskId?: string) => Promise<unknown>
}

export function useAppProcesses (options: ProcessOptions) {
  const processes = ref<AppProcessScale[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const maxInstances = ref(5)

  const getProcesses = new GetApplicationProcesses(options.repository)
  const scaleProcesses = new ScaleApplicationProcesses(options.repository)

  async function fetch (refresh = false) {
    if (!options.canManage()) {
      return
    }
    loading.value = true
    error.value = ''
    try {
      const result = await getProcesses.execute(options.appId, refresh)
      processes.value = result.processes
      maxInstances.value = result.max_instances
    } catch (error_) {
      const data = getHttpErrorData(error_)
      error.value = data && typeof data !== 'string' && typeof data.error === 'string'
        ? data.error
        : 'Erro ao buscar processos do app'
      throw error_
    } finally {
      loading.value = false
    }
  }

  async function scale (values: Record<string, number>) {
    if (!options.canManage()) {
      return
    }
    saving.value = true
    error.value = ''
    try {
      const result = await scaleProcesses.execute(options.appId, values)
      const status = await options.waitForTask(result.task_id)
      if ((status as { state?: string, status?: string } | null)?.state === 'FAILURE') {
        error.value = (status as { status?: string }).status || 'Erro ao aplicar escala de processos'
      }
      await fetch(true)
      return result
    } catch (error_) {
      const data = getHttpErrorData(error_)
      error.value = data && typeof data !== 'string' && typeof data.error === 'string'
        ? data.error
        : 'Erro ao aplicar escala de processos'
      throw error_
    } finally {
      saving.value = false
    }
  }

  return { processes, loading, saving, error, maxInstances, fetch, refresh: () => fetch(true), scale }
}
