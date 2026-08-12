import type { LogRepository } from '@/modules/logs/application/ports/log-repository'
import { onUnmounted, ref } from 'vue'

export function useRuntimeLogStream (
  repository: LogRepository,
  getAppId: () => number | undefined,
  isEnabled: () => boolean,
) {
  const lines = ref<string[]>([])
  const loading = ref(false)
  const live = ref(false)
  let pollTimer: ReturnType<typeof setInterval> | null = null
  let eventSource: EventSource | null = null
  let fallbackStarted = false
  let generation = 0

  async function fetchLogs () {
    const appId = getAppId()
    if (!appId) {
      loading.value = false
      return
    }
    const currentGeneration = generation
    loading.value = true
    try {
      const response = await repository.getRuntime(appId, 200)
      if (currentGeneration !== generation || !live.value) {
        return
      }
      lines.value = response.lines
    } catch (error) {
      console.error('Erro ao buscar logs do app:', error)
      lines.value = []
    } finally {
      loading.value = false
    }
  }

  function closeEventSource () {
    eventSource?.close()
    eventSource = null
  }

  function stopPolling () {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function startFallback () {
    if (!live.value || pollTimer) {
      return
    }
    fallbackStarted = true
    closeEventSource()
    void fetchLogs()
    pollTimer = setInterval(() => void fetchLogs(), 4000)
  }

  function parsePayload (event: Event): { lines?: string[], line?: string } {
    try {
      return JSON.parse((event as MessageEvent).data || '{}')
    } catch {
      return {}
    }
  }

  function start () {
    if (!isEnabled()) {
      return
    }
    if (eventSource || pollTimer) {
      return
    }
    live.value = true
    fallbackStarted = false
    generation += 1
    loading.value = true

    const appId = getAppId()
    if (!appId) {
      loading.value = false
      return
    }

    const currentGeneration = generation

    try {
      const source = new EventSource(repository.getRuntimeStreamUrl(appId, 200), {
        withCredentials: true,
      })
      eventSource = source
      source.addEventListener('open', () => {
        if (currentGeneration !== generation) {
          return
        }
        loading.value = false
      })
      source.addEventListener('snapshot', event => {
        if (currentGeneration !== generation || !live.value) {
          return
        }
        const payload = parsePayload(event)
        lines.value = Array.isArray(payload.lines) ? payload.lines : []
        loading.value = false
      })
      source.addEventListener('line', event => {
        if (currentGeneration !== generation || !live.value) {
          return
        }
        const payload = parsePayload(event)
        const line = payload.line?.trim()
        if (line) {
          lines.value = [...lines.value, line].slice(-500)
        }
        loading.value = false
      })
      source.addEventListener('error', event => {
        if (currentGeneration !== generation || !live.value) {
          return
        }
        if (event instanceof MessageEvent && event.data) {
          console.warn('Erro do stream de logs:', event.data)
          return
        }
        if (!fallbackStarted) {
          console.warn('Stream de logs indisponível, usando fallback HTTP.')
          startFallback()
        }
      })
    } catch (error) {
      console.error('Erro ao iniciar stream de logs:', error)
      startFallback()
    }
  }

  function stop () {
    live.value = false
    fallbackStarted = false
    generation += 1
    closeEventSource()
    stopPolling()
  }

  onUnmounted(stop)

  return { lines, loading, live, fetchLogs, start, stop }
}
