import type { AdminNotificationRepository } from '@/modules/administration/application/ports/administration-repositories'
import type { AdminNotification } from '@/modules/administration/domain/models'
import { ref } from 'vue'
import {
  CountUnreadAdminNotifications,
  ListAdminNotifications,
  MarkAdminNotificationRead,
  MarkAllAdminNotificationsRead,
} from '@/modules/administration/application/use-cases/administration-use-cases'
import { usePolling } from '@/shared/composables/use-polling'

const POLL_INTERVAL_MS = 60_000

export function useAdminNotifications (repository: AdminNotificationRepository) {
  const notifications = ref<AdminNotification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const polling = usePolling()

  const listNotifications = new ListAdminNotifications(repository)
  const countUnread = new CountUnreadAdminNotifications(repository)
  const markRead = new MarkAdminNotificationRead(repository)
  const markAllRead = new MarkAllAdminNotificationsRead(repository)

  async function refreshCount () {
    try {
      unreadCount.value = await countUnread.execute()
    } catch {
      // Silencioso: o sino nao deve quebrar a navegacao se a API falhar.
    }
  }

  async function fetch () {
    loading.value = true
    error.value = null
    try {
      notifications.value = await listNotifications.execute()
      await refreshCount()
    } catch (error_) {
      error.value = error_ instanceof Error ? error_.message : 'Erro ao carregar notificações'
    } finally {
      loading.value = false
    }
  }

  async function read (id: number) {
    const updated = await markRead.execute(id)
    notifications.value = notifications.value.map(item => (item.id === id ? updated : item))
    await refreshCount()
  }

  async function readAll () {
    await markAllRead.execute()
    const now = new Date().toISOString()
    notifications.value = notifications.value.map(item => ({ ...item, read_at: item.read_at ?? now }))
    unreadCount.value = 0
  }

  function startPolling () {
    void refreshCount()
    polling.start(refreshCount, POLL_INTERVAL_MS)
  }

  return {
    error,
    fetch,
    loading,
    notifications,
    read,
    readAll,
    startPolling,
    stopPolling: polling.stop,
    unreadCount,
  }
}
