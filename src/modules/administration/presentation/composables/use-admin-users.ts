import type { AdminUserRepository } from '@/modules/administration/application/ports/administration-repositories'
import type { AdminUser } from '@/modules/administration/domain/models'
import { ref } from 'vue'
import {
  ListAdminUsers,
  SetUserQuota,
  ToggleActiveUser,
  ToggleAdminUser,
} from '@/modules/administration/application/use-cases/administration-use-cases'

export function useAdminUsers (repository: AdminUserRepository) {
  const users = ref<AdminUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const togglingUserId = ref<number | null>(null)
  const togglingAdminUserId = ref<number | null>(null)
  const quotaSaving = ref(false)
  const listUsers = new ListAdminUsers(repository)
  const toggleActive = new ToggleActiveUser(repository)
  const toggleAdmin = new ToggleAdminUser(repository)
  const setQuota = new SetUserQuota(repository)

  async function fetch () {
    loading.value = true
    error.value = null
    try {
      users.value = await listUsers.execute()
      return users.value
    } catch (error_) {
      users.value = []
      error.value = error_ instanceof Error ? error_.message : 'Erro ao carregar usuários'
      throw error_
    } finally {
      loading.value = false
    }
  }

  function replaceUser (updated: AdminUser) {
    const index = users.value.findIndex(user => user.id === updated.id)
    if (index !== -1) {
      users.value[index] = updated
    }
  }

  async function toggleActiveFor (id: number) {
    togglingUserId.value = id
    try {
      const updated = await toggleActive.execute(id)
      replaceUser(updated)
      return updated
    } finally {
      togglingUserId.value = null
    }
  }

  async function toggleAdminFor (id: number) {
    togglingAdminUserId.value = id
    try {
      const updated = await toggleAdmin.execute(id)
      replaceUser(updated)
      return updated
    } finally {
      togglingAdminUserId.value = null
    }
  }

  async function saveQuota (
    id: number,
    quota: { max_apps?: number | null, max_services?: number | null },
  ) {
    quotaSaving.value = true
    try {
      const updated = await setQuota.execute(id, quota)
      replaceUser(updated)
      return updated
    } finally {
      quotaSaving.value = false
    }
  }

  return {
    error,
    fetch,
    loading,
    quotaSaving,
    saveQuota,
    toggleActiveFor,
    toggleAdminFor,
    togglingAdminUserId,
    togglingUserId,
    users,
  }
}
