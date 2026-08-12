import type { App, TaskStatus } from '@/modules/applications/domain/models'

import { onUnmounted, ref } from 'vue'

import { usePolling } from '@/shared/composables/use-polling'

type TaskCompletionHandler = (status: TaskStatus) => void | Promise<void>

interface AppTaskPollingOptions {
  getApp: () => App | null
  fetchApp: () => Promise<unknown>
  fetchStatus: () => Promise<TaskStatus | null>
  onCompleted?: TaskCompletionHandler
  intervalMs?: number
  timeoutMs?: number
}

const TASK_STATUSES = new Set(['STARTING', 'DELETING', 'DEPLOYING'])

export function useAppTaskPolling (options: AppTaskPollingOptions) {
  const polling = usePolling()
  const disposed = ref(false)
  const pollingRequest = ref(false)
  let pendingTimeout: ReturnType<typeof setTimeout> | null = null

  function isTaskStatus () {
    return TASK_STATUSES.has(options.getApp()?.status ?? '')
  }

  function stop () {
    polling.stop()
  }

  async function poll () {
    if (disposed.value || pollingRequest.value) {
      return
    }
    pollingRequest.value = true

    try {
      const status = await options.fetchStatus()
      if (status?.state === 'SUCCESS' || status?.state === 'FAILURE') {
        stop()
        await options.onCompleted?.(status)
      }
    } catch (error_) {
      console.error('Erro ao buscar status da task:', error_)
    } finally {
      pollingRequest.value = false
    }
  }

  function start () {
    const app = options.getApp()
    if (disposed.value || !app?.task_id || !isTaskStatus()) {
      return
    }
    stop()
    void poll()
    polling.start(() => poll(), options.intervalMs ?? 2000)
  }

  function delay (milliseconds: number) {
    return new Promise<void>(resolve => {
      pendingTimeout = setTimeout(() => {
        pendingTimeout = null
        resolve()
      }, milliseconds)
    })
  }

  async function waitForCompletion (taskId?: string) {
    const timeoutMs = options.timeoutMs ?? 45_000
    const pollIntervalMs = 1500
    const startedAt = Date.now()
    let currentTaskId = taskId

    while (!disposed.value && Date.now() - startedAt < timeoutMs) {
      try {
        const app = options.getApp()
        if (currentTaskId && app) {
          app.task_id = currentTaskId
        } else {
          await options.fetchApp()
          currentTaskId = options.getApp()?.task_id ?? undefined
          if (!currentTaskId) {
            await delay(pollIntervalMs)
            continue
          }
        }

        const status = await options.fetchStatus()
        if (status?.state === 'SUCCESS' || status?.state === 'FAILURE') {
          await options.fetchApp()
          await options.onCompleted?.(status)
          return status
        }
      } catch (error_) {
        console.error('Erro ao aguardar task do app:', error_)
      }

      await delay(pollIntervalMs)
    }

    if (!disposed.value) {
      await options.fetchApp()
    }
    return null
  }

  onUnmounted(() => {
    disposed.value = true
    stop()
    if (pendingTimeout) {
      clearTimeout(pendingTimeout)
    }
  })

  return { active: polling.active, start, stop, poll, waitForCompletion }
}
