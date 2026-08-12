import type { AdminUser, StorageUsage, UserQuota } from '../../domain/models'
import type {
  AdminUserRepository,
  StorageRepository,
} from '../ports/administration-repositories'

export class ListAdminUsers {
  private readonly repository: AdminUserRepository

  constructor (repository: AdminUserRepository) {
    this.repository = repository
  }

  execute (): Promise<AdminUser[]> {
    return this.repository.getList()
  }
}

export class ToggleActiveUser {
  private readonly repository: AdminUserRepository

  constructor (repository: AdminUserRepository) {
    this.repository = repository
  }

  execute (id: number): Promise<AdminUser> {
    return this.repository.toggleActive(id)
  }
}

export class ToggleAdminUser {
  private readonly repository: AdminUserRepository

  constructor (repository: AdminUserRepository) {
    this.repository = repository
  }

  execute (id: number): Promise<AdminUser> {
    return this.repository.toggleAdmin(id)
  }
}

export class SetUserQuota {
  private readonly repository: AdminUserRepository

  constructor (repository: AdminUserRepository) {
    this.repository = repository
  }

  execute (
    id: number,
    quota: { max_apps?: number | null, max_services?: number | null },
  ): Promise<AdminUser> {
    return this.repository.setQuota(id, quota)
  }
}

export class GetMyQuota {
  private readonly repository: AdminUserRepository

  constructor (repository: AdminUserRepository) {
    this.repository = repository
  }

  execute (): Promise<UserQuota> {
    return this.repository.getMyQuota()
  }
}

export class GetStorageUsage {
  private readonly repository: StorageRepository

  constructor (repository: StorageRepository) {
    this.repository = repository
  }

  execute (forceRefresh = false): Promise<StorageUsage> {
    return this.repository.getUsage(forceRefresh)
  }
}
