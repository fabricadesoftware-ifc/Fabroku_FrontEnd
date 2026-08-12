import type { AppRepository } from '@/modules/applications/application/ports/app-repository'
import type { Service, ServiceRepository } from '@/modules/services'

import { ref } from 'vue'

import {
  DeleteService,
  LinkService,
  ListProjectServices,
  UnlinkService,
} from '@/modules/services/application/use-cases/service-use-cases'
import { useServiceTaskPolling } from '@/modules/services/presentation/composables/use-service-task-polling'
import { formatServiceError } from '@/modules/services/presentation/service-error'

interface ProjectServicesOptions {
  serviceRepository: ServiceRepository
  appRepository: AppRepository
  projectId: string
}

export function useProjectServices (options: ProjectServicesOptions) {
  const services = ref<Service[]>([])
  const loading = ref(false)
  const error = ref('')
  const deletingId = ref<number | null>(null)
  const linking = ref(false)
  const taskPolling = useServiceTaskPolling({ timeoutMs: 60_000 })
  const listServices = new ListProjectServices(options.serviceRepository)
  const deleteService = new DeleteService(options.serviceRepository)
  const linkService = new LinkService(options.serviceRepository)
  const unlinkService = new UnlinkService(options.serviceRepository)

  async function fetch () {
    loading.value = true
    error.value = ''
    try {
      const response = await listServices.execute(options.projectId)
      services.value = response.results
      return services.value
    } catch (error_) {
      error.value = formatServiceError(error_, 'Não foi possível carregar os serviços.')
      throw error_
    } finally {
      loading.value = false
    }
  }

  function isReady (service: Service) {
    return Boolean(service.container_name) && !service.task_id
  }

  async function waitForAppTask (appId: number, taskId: string) {
    void taskId
    return taskPolling.waitForCompletion(() => options.appRepository.getStatus(String(appId)))
  }

  async function remove (service: Service) {
    if (!service.id) {
      return
    }
    deletingId.value = service.id
    try {
      await deleteService.execute(service.id)
      await fetch()
    } finally {
      deletingId.value = null
    }
  }

  async function link (serviceId: number, appId: number) {
    linking.value = true
    error.value = ''
    try {
      const result = await linkService.execute(serviceId, appId)
      const status = await waitForAppTask(appId, result.task_id)
      if (status?.state === 'FAILURE') {
        error.value = status.status || 'Não foi possível vincular o serviço ao app.'
        return status
      }
      await fetch()
      return status
    } catch (error_) {
      error.value = formatServiceError(error_, 'Não foi possível vincular o serviço ao app.')
      throw error_
    } finally {
      linking.value = false
    }
  }

  async function unlink (service: Service) {
    if (!service.id) {
      return
    }
    const result = await unlinkService.execute(service.id)
    if (typeof service.app === 'number') {
      await waitForAppTask(service.app, result.task_id)
    }
    await fetch()
  }

  return { services, loading, error, deletingId, linking, taskPolling, fetch, isReady, remove, link, unlink }
}
