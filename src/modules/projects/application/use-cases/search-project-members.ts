import type { AuthUser } from '@/modules/auth/domain/models'
import type { ProjectMemberDirectory } from '@/modules/projects/application/ports/project-member-directory'

export class SearchProjectMembers {
  constructor (private readonly directory: ProjectMemberDirectory) {}

  execute (query: string): Promise<AuthUser[]> {
    return this.directory.search(query)
  }
}
