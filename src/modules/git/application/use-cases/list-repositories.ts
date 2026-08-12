import type { GitRepository } from '@/modules/git/application/ports/git-repository'
import type { GitRepo } from '@/modules/git/domain/models'

export class ListRepositories {
  constructor (private readonly repository: GitRepository) {}

  execute (): Promise<GitRepo[]> {
    return this.repository.getRepos()
  }
}
