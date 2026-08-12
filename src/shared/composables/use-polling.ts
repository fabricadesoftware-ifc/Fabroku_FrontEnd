import { onUnmounted, ref } from 'vue'

export function usePolling () {
  const timer = ref<ReturnType<typeof setInterval> | null>(null)

  function stop () {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
  }

  function start (callback: () => void | Promise<void>, intervalMs: number) {
    stop()
    timer.value = setInterval(() => {
      void callback()
    }, intervalMs)
  }

  onUnmounted(stop)

  return { active: timer, start, stop }
}
