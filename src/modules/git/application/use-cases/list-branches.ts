import type { GitRepository } from '@/modules/git/application/ports/git-repository'

export class ListBranches {
  constructor (private readonly repository: GitRepository) {}

  execute (repoFullName: string): Promise<string[]> {
    return this.repository.getBranches(repoFullName)
  }
}
