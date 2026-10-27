import type { AdminNotification } from '../../../domain/models.ts'
import type { AdminNotificationRepository } from '../../ports/administration-repositories.ts'

import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  CountUnreadAdminNotifications,
  ListAdminNotifications,
  MarkAdminNotificationRead,
  MarkAllAdminNotificationsRead,
} from '../administration-use-cases.ts'

const notification: AdminNotification = {
  id: 7,
  event_type: 'app_delete_failed',
  event_display: 'Falha ao apagar app',
  level: 'error',
  title: 'Falha ao apagar o app my-app no Dokku',
  message: 'ssh connection error',
  app: 1,
  app_name: 'my-app',
  project_id: 'p-1',
  service: null,
  service_name: null,
  metadata: {},
  created_at: '2026-10-27T12:00:00Z',
  read_at: null,
}

function repository (overrides: Partial<AdminNotificationRepository> = {}): AdminNotificationRepository {
  return {
    list: async () => [notification],
    unreadCount: async () => 1,
    markRead: async () => ({ ...notification, read_at: '2026-10-27T12:01:00Z' }),
    markAllRead: async () => 1,
    ...overrides,
  }
}

test('lista notificações repassando o filtro de não lidas', async () => {
  let receivedUnreadOnly: boolean | undefined
  const result = await new ListAdminNotifications(repository({
    list: async unreadOnly => {
      receivedUnreadOnly = unreadOnly
      return [notification]
    },
  })).execute(true)

  assert.equal(receivedUnreadOnly, true)
  assert.deepEqual(result, [notification])
})

test('conta e marca notificações como lidas pelo port', async () => {
  let markedId = 0
  const repo = repository({
    markRead: async id => {
      markedId = id
      return { ...notification, read_at: 'agora' }
    },
  })

  assert.equal(await new CountUnreadAdminNotifications(repo).execute(), 1)
  assert.equal((await new MarkAdminNotificationRead(repo).execute(7)).read_at, 'agora')
  assert.equal(markedId, 7)
  assert.equal(await new MarkAllAdminNotificationsRead(repo).execute(), 1)
})
