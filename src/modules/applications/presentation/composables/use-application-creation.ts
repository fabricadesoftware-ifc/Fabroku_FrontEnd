import type { AppRepository } from '@/modules/applications/application/ports/app-repository'
import type { CreateAppInput } from '@/modules/applications/application/use-cases/application-use-cases'

import { ref } from 'vue'
import {
  CheckApplicationName,
  CreateApplication,
  GetApplicationStatus,
} from '@/modules/applications/application/use-cases/application-use-cases'
import { getHttpErrorData } from '@/shared/errors/http-error'

export function useApplicationCreation (repository: AppRepository) {
  const creating = ref(false)
  const quotaError = ref('')
  const createApplication = new CreateApplication(repository)
  const getApplicationStatus = new GetApplicationStatus(repository)
  const checkApplicationName = new CheckApplicationName(repository)

  async function checkName (name: string) {
    return checkApplicationName.execute(name)
  }

  async function create (input: CreateAppInput) {
    creating.value = true
    quotaError.value = ''
    try {
      const app = await createApplication.execute(input)
      let status = null
      if (app.id) {
        try {
          status = await getApplicationStatus.execute(String(app.id))
        } catch {
          // A falha no primeiro status não impede o redirecionamento da criação.
        }
      }
      return { app, status }
    } catch (error_) {
      const data = getHttpErrorData(error_)
      if (data && typeof data !== 'string' && data.quota) {
        quotaError.value = `Limite de apps atingido: você possui ${data.current} de ${data.limit} apps permitidos.`
      }
      throw error_
    } finally {
      creating.value = false
    }
  }

  return { creating, quotaError, checkName, create }
}
