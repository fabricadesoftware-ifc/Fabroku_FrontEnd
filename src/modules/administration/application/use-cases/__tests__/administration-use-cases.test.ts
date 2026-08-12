import type { AdminUser, StorageUsage } from '../../../domain/models.ts'
import type {
  AdminUserRepository,
  StorageRepository,
} from '../../ports/administration-repositories.ts'

import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  GetStorageUsage,
  ListAdminUsers,
  SetUserQuota,
  ToggleAdminUser,
} from '../administration-use-cases.ts'

const user: AdminUser = {
  id: 1,
  email: 'admin@example.com',
  name: 'Admin',
  avatar_url: null,
}

function userRepository (overrides: Partial<AdminUserRepository> = {}): AdminUserRepository {
  return {
    searchByUsername: async () => [],
    getById: async () => user,
    getList: async () => [user],
    toggleActive: async () => user,
    toggleAdmin: async () => ({ ...user, is_superuser: true }),
    setQuota: async () => user,
    getMyQuota: async () => ({
      max_apps: null,
      max_services: null,
      apps_count: 0,
      services_count: 0,
      can_create_app: true,
      can_create_service: true,
    }),
    ...overrides,
  }
}

test('lista usuários administrativos pelo port da aplicação', async () => {
  const result = await new ListAdminUsers(userRepository()).execute()

  assert.deepEqual(result, [user])
})

test('altera papel administrativo sem expor o repository à apresentação', async () => {
  let receivedId = 0
  const repository = userRepository({
    toggleAdmin: async id => {
      receivedId = id
      return { ...user, is_superuser: true }
    },
  })

  const result = await new ToggleAdminUser(repository).execute(1)

  assert.equal(receivedId, 1)
  assert.equal(result.is_superuser, true)
})

test('salva quota e busca armazenamento através de casos de uso distintos', async () => {
  const usage: StorageUsage = {
    services: [],
    total_bytes: 0,
    total_formatted: '0 B',
  }
  let quota: { max_apps?: number | null, max_services?: number | null } | undefined
  const repository = userRepository({
    setQuota: async (_id, input) => {
      quota = input
      return user
    },
  })
  const storageRepository: StorageRepository = {
    getUsage: async forceRefresh => forceRefresh ? usage : usage,
  }

  await new SetUserQuota(repository).execute(1, { max_apps: 4, max_services: 2 })
  const result = await new GetStorageUsage(storageRepository).execute(true)

  assert.deepEqual(quota, { max_apps: 4, max_services: 2 })
  assert.deepEqual(result, usage)
})
