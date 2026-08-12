import type { ServiceRepository } from '@/modules/services/application/ports/service-repository'
import type { CreateServiceInput, Service } from '@/modules/services/domain/models'

import { ref } from 'vue'

import { CreateService, GetServiceStatus } from '@/modules/services/application/use-cases/service-use-cases'
import { useServiceTaskPolling } from '@/modules/services/presentation/composables/use-service-task-polling'
import { formatServiceError } from '@/modules/services/presentation/service-error'

export function useServiceCreation (repository: ServiceRepository) {
  const creating = ref(false)
  const error = ref('')
  const createdService = ref<Service | null>(null)
  const createService = new CreateService(repository)
  const getServiceStatus = new GetServiceStatus(repository)
  const taskPolling = useServiceTaskPolling()

  async function create (input: CreateServiceInput) {
    creating.value = true
    error.value = ''
    createdService.value = null
    try {
      const service = await createService.execute(input)
      createdService.value = service
      if (service.task_id && service.id) {
        const status = await taskPolling.waitForCompletion(
          () => getServiceStatus.execute(service.id as number),
        )
        creating.value = false
        if (status?.state === 'FAILURE') {
          error.value = status.status || 'Não foi possível provisionar o serviço.'
        }
        return { service, status }
      }
      creating.value = false
      return { service, status: null }
    } catch (error_) {
      error.value = formatServiceError(
        error_,
        'Não foi possível criar o serviço. Verifique os dados e tente novamente.',
      )
      throw error_
    } finally {
      if (!createdService.value?.task_id) {
        creating.value = false
      }
    }
  }

  function clearError () {
    error.value = ''
  }

  return { creating, error, createdService, taskStatus: taskPolling.status, create, clearError }
}
