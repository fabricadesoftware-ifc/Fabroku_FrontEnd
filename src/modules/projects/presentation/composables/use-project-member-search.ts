import type { AuthUser } from '@/modules/auth/domain/models'
import type { ProjectMemberDirectory } from '@/modules/projects/application/ports/project-member-directory'
import { onUnmounted, ref } from 'vue'

export function useProjectMemberSearch (
  directory: ProjectMemberDirectory,
  isExcluded: (user: AuthUser) => boolean = () => false,
) {
  const searching = ref(false)
  const results = ref<AuthUser[]>([])
  let timeout: ReturnType<typeof setTimeout> | null = null

  function clear () {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    results.value = []
    searching.value = false
  }

  function search (query: string) {
    if (timeout) {
      clearTimeout(timeout)
    }

    if (!query || query.length < 2) {
      results.value = []
      return
    }

    timeout = setTimeout(async () => {
      searching.value = true
      try {
        const users = await directory.search(query)
        results.value = users.filter(user => !isExcluded(user))
      } catch (error) {
        console.error('Erro ao buscar usuários para o projeto:', error)
        results.value = []
      } finally {
        searching.value = false
        timeout = null
      }
    }, 300)
  }

  onUnmounted(clear)

  return { searching, results, search, clear }
}
