import type { TaskStatus } from '@/modules/applications/domain/models'

import { onUnmounted, ref } from 'vue'

import { usePolling } from '@/shared/composables/use-polling'

interface ServiceTaskPollingOptions {
  intervalMs?: number
  timeoutMs?: number
}

export function useServiceTaskPolling (options: ServiceTaskPollingOptions = {}) {
  const polling = usePolling()
  const status = ref<TaskStatus | null>(null)
  const pollingRequest = ref(false)
  const disposed = ref(false)
  let pendingTimeout: ReturnType<typeof setTimeout> | null = null

  async function poll (fetchStatus: () => Promise<TaskStatus>) {
    if (disposed.value || pollingRequest.value) {
      return null
    }
    pollingRequest.value = true
    try {
      const nextStatus = await fetchStatus()
      status.value = nextStatus
      if (nextStatus.state === 'SUCCESS' || nextStatus.state === 'FAILURE') {
        polling.stop()
      }
      return nextStatus
    } finally {
      pollingRequest.value = false
    }
  }

  function start (fetchStatus: () => Promise<TaskStatus>) {
    polling.stop()
    void poll(fetchStatus)
    polling.start(() => {
      void poll(fetchStatus)
    }, options.intervalMs ?? 2000)
  }

  function delay (milliseconds: number) {
    return new Promise<void>(resolve => {
      pendingTimeout = setTimeout(() => {
        pendingTimeout = null
        resolve()
      }, milliseconds)
    })
  }

  async function waitForCompletion (fetchStatus: () => Promise<TaskStatus>) {
    const startedAt = Date.now()
    const timeoutMs = options.timeoutMs ?? 60_000
    const intervalMs = options.intervalMs ?? 1500

    while (!disposed.value && Date.now() - startedAt < timeoutMs) {
      const nextStatus = await poll(fetchStatus)
      if (nextStatus?.state === 'SUCCESS' || nextStatus?.state === 'FAILURE') {
        return nextStatus
      }
      await delay(intervalMs)
    }

    return status.value
  }

  onUnmounted(() => {
    disposed.value = true
    polling.stop()
    if (pendingTimeout) {
      clearTimeout(pendingTimeout)
    }
  })

  return { status, active: polling.active, start, stop: polling.stop, poll, waitForCompletion }
}
