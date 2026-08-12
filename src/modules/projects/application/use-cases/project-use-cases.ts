import type { ProjectRepository } from '@/modules/projects/application/ports/project-repository'
import type { CreateProjectInput, Project, UpdateProjectInput } from '@/modules/projects/domain/models'

export class ListProjects {
  constructor (private readonly repository: ProjectRepository) {}

  execute (): Promise<Project[]> {
    return this.repository.getAll()
  }
}

export class GetProject {
  constructor (private readonly repository: ProjectRepository) {}

  execute (id: string): Promise<Project> {
    return this.repository.getById(id)
  }
}

export class CreateProject {
  constructor (private readonly repository: ProjectRepository) {}

  execute (input: CreateProjectInput): Promise<Project> {
    return this.repository.create(input)
  }
}

export class UpdateProject {
  constructor (private readonly repository: ProjectRepository) {}

  execute (id: string, input: UpdateProjectInput): Promise<Project> {
    return this.repository.update(id, input)
  }
}

export class DeleteProject {
  constructor (private readonly repository: ProjectRepository) {}

  execute (id: string): Promise<unknown> {
    return this.repository.remove(id)
  }
}
