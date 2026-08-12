import type { LogRepository } from '@/modules/logs/application/ports/log-repository'
import type { AppLog } from '@/modules/logs/domain/models'
import { ref } from 'vue'

import { getLatestLogId } from '@/modules/logs/domain/log-collection'
import { usePolling } from '@/shared/composables/use-polling'

interface TaskLogStreamOptions {
  getTaskId: () => string | undefined
  onLogs: (logs: AppLog[]) => void | Promise<void>
  intervalMs?: number
}

export function useTaskLogStream (
  repository: LogRepository,
  options: TaskLogStreamOptions,
) {
  const polling = usePolling()
  const active = ref(false)
  const lastId = ref<number | undefined>()
  const loading = ref(false)
  let requestInFlight = false
  let generation = 0

  async function poll () {
    const taskId = options.getTaskId()
    if (!active.value || !taskId || requestInFlight) {
      return
    }

    requestInFlight = true
    const currentGeneration = generation
    loading.value = true

    try {
      const logs = await repository.streamTask(taskId, lastId.value)
      if (currentGeneration !== generation || !active.value) {
        return
      }

      if (logs.length > 0) {
        lastId.value = getLatestLogId(logs) ?? lastId.value
        await options.onLogs(logs)
      }
    } catch (error) {
      if (currentGeneration === generation) {
        console.error('Erro no stream de logs da tarefa:', error)
      }
    } finally {
      requestInFlight = false
      if (currentGeneration === generation) {
        loading.value = false
      }
    }
  }

  function start () {
    if (active.value) {
      return
    }

    active.value = true
    generation += 1
    void poll().finally(() => {
      if (active.value) {
        polling.start(() => poll(), options.intervalMs ?? 2000)
      }
    })
  }

  function stop () {
    active.value = false
    generation += 1
    polling.stop()
    requestInFlight = false
    loading.value = false
  }

  return { active, lastId, loading, poll, start, stop }
}
