import type { GitRepo } from '@/modules/git/domain/models'

export interface GitRepository {
  getRepos: () => Promise<GitRepo[]>
}
