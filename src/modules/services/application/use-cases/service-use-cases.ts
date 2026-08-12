import type { PaginatedResponse, TaskResult } from '../../../../shared/types/api'
import type { TaskStatus } from '../../../applications/domain/models'
import type {
  CreateServiceInput,
  Service,
} from '../../domain/models'
import type { ServiceRepository } from '../ports/service-repository'

export class ListProjectServices {
  private readonly repository: ServiceRepository

  constructor (repository: ServiceRepository) {
    this.repository = repository
  }

  execute (projectId: string): Promise<PaginatedResponse<Service>> {
    return this.repository.getByProject(projectId)
  }
}

export class ListAppServices {
  private readonly repository: ServiceRepository

  constructor (repository: ServiceRepository) {
    this.repository = repository
  }

  execute (appId: number): Promise<PaginatedResponse<Service>> {
    return this.repository.getByApp(appId)
  }
}

export class CreateService {
  private readonly repository: ServiceRepository

  constructor (repository: ServiceRepository) {
    this.repository = repository
  }

  execute (input: CreateServiceInput): Promise<Service> {
    return this.repository.create(input)
  }
}

export class DeleteService {
  private readonly repository: ServiceRepository

  constructor (repository: ServiceRepository) {
    this.repository = repository
  }

  execute (serviceId: number): Promise<Pick<TaskResult, 'task_id'>> {
    return this.repository.remove(serviceId)
  }
}

export class LinkService {
  private readonly repository: ServiceRepository

  constructor (repository: ServiceRepository) {
    this.repository = repository
  }

  execute (serviceId: number, appId: number): Promise<Pick<TaskResult, 'task_id'>> {
    return this.repository.link(serviceId, appId)
  }
}

export class UnlinkService {
  private readonly repository: ServiceRepository

  constructor (repository: ServiceRepository) {
    this.repository = repository
  }

  execute (serviceId: number): Promise<Pick<TaskResult, 'task_id'>> {
    return this.repository.unlink(serviceId)
  }
}

export class GetServiceStatus {
  private readonly repository: ServiceRepository

  constructor (repository: ServiceRepository) {
    this.repository = repository
  }

  execute (serviceId: number): Promise<TaskStatus> {
    return this.repository.getStatus(serviceId)
  }
}
