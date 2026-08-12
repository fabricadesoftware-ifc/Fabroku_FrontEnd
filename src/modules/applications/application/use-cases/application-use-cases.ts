import type { AppRepository } from '@/modules/applications/application/ports/app-repository'
import type { App } from '@/modules/applications/domain/models'
import type { TaskResult } from '@/shared/types/api'

export type CreateAppInput = Omit<
  App,
  'id' | 'created_at' | 'updated_at' | 'status' | 'task_id' | 'name_dokku'
> & { name_dokku?: string | null }

export class ListApplications {
  constructor (private readonly repository: AppRepository) {}

  execute () {
    return this.repository.getAll()
  }
}

export class ListProjectApplications {
  constructor (private readonly repository: AppRepository) {}

  execute (projectId: string) {
    return this.repository.getByProject(projectId)
  }
}

export class GetApplication {
  constructor (private readonly repository: AppRepository) {}

  execute (id: string) {
    return this.repository.getById(id)
  }
}

export class CreateApplication {
  constructor (private readonly repository: AppRepository) {}

  execute (input: CreateAppInput) {
    return this.repository.create(input as App)
  }
}

export class UpdateApplication {
  constructor (private readonly repository: AppRepository) {}

  execute (id: string, input: Partial<App>) {
    return this.repository.patch(id, input)
  }
}

export class DeleteApplication {
  constructor (private readonly repository: AppRepository) {}

  execute (id: string): Promise<TaskResult> {
    return this.repository.remove(id)
  }
}

export class StartApplication {
  constructor (private readonly repository: AppRepository) {}

  execute (id: string) {
    return this.repository.start(id)
  }
}

export class StopApplication {
  constructor (private readonly repository: AppRepository) {}

  execute (id: string) {
    return this.repository.stop(id)
  }
}

export class RestartApplication {
  constructor (private readonly repository: AppRepository) {}

  execute (id: string) {
    return this.repository.restart(id)
  }
}

export class RedeployApplication {
  constructor (private readonly repository: AppRepository) {}

  execute (id: string, commit?: string) {
    return this.repository.redeploy(id, commit)
  }
}

export class CheckApplicationName {
  constructor (private readonly repository: AppRepository) {}

  execute (name: string) {
    return this.repository.checkName(name)
  }
}

export class UpdateApplicationEnvironment {
  constructor (private readonly repository: AppRepository) {}

  execute (id: string, variables: Record<string, string>) {
    return this.repository.updateEnvVars(id, variables)
  }
}

export class GetApplicationStatus {
  constructor (private readonly repository: AppRepository) {}

  execute (id: string) {
    return this.repository.getStatus(id)
  }
}

export class ScaleApplicationProcesses {
  constructor (private readonly repository: AppRepository) {}

  execute (id: string, processes: Record<string, number>) {
    return this.repository.scaleProcesses(id, processes)
  }
}

export class GetApplicationProcesses {
  constructor (private readonly repository: AppRepository) {}

  execute (id: string, refresh = false) {
    return this.repository.getProcesses(id, refresh)
  }
}

export class RunApplicationCommand {
  constructor (private readonly repository: AppRepository) {}

  execute (id: string, command: string) {
    return this.repository.runCommand(id, command)
  }
}
